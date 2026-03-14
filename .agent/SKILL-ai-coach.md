# SKILL: AI Health Coach

## HealthOS Agent Skill File

**Read this before any AI coach, prompt, or LLM task.**

---

## Architecture Summary

```
Patient message → /api/ai/chat/route.ts (server)
  → Verify session
  → Fetch & anonymise patient context from Supabase
  → Build system prompt (lib/ai/prompts.ts)
  → Stream to Anthropic Claude API via Vercel AI SDK
  → Safety-check response for crisis keywords
  → Stream to client via useChat hook
  → Persist conversation to coach_conversations table
```

---

## API Route — Streaming Handler

```typescript
// app/api/ai/chat/route.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createServerClient } from '@/lib/supabase/server';
import { buildCoachSystemPrompt } from '@/lib/ai/prompts';
import { CRISIS_KEYWORDS } from '@/lib/constants/health.constants';
import { z } from 'zod';

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(2000),
    }),
  ),
  conversationId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  // 1. Verify session
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // 2. Validate input
  const body = await req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) return new Response('Invalid input', { status: 400 });

  // 3. Check for crisis keywords in latest user message
  const latestUserMessage =
    parsed.data.messages.filter((m) => m.role === 'user').at(-1)?.content ?? '';

  const isCrisis = CRISIS_KEYWORDS.some((kw) => latestUserMessage.toLowerCase().includes(kw));

  if (isCrisis) {
    await createEmergencyAlert(supabase, user.id, 'ai_crisis_detection', latestUserMessage);
    return Response.json(
      {
        crisis: true,
        message:
          "I'm concerned about what you've shared. Please contact emergency services (911) or the 988 Suicide & Crisis Lifeline immediately.",
      },
      { status: 200 },
    );
  }

  // 4. Fetch & anonymise patient context
  const context = await fetchAnonymisedContext(supabase, user.id);

  // 5. Build system prompt
  const systemPrompt = buildCoachSystemPrompt(context);

  // 6. Stream from Claude
  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: systemPrompt,
    messages: parsed.data.messages,
    maxTokens: 600,
    temperature: 0.7,
    onFinish: async ({ text }) => {
      // 7. Persist conversation
      await persistConversation(
        supabase,
        user.id,
        parsed.data.messages,
        text,
        parsed.data.conversationId,
      );
    },
  });

  return result.toDataStreamResponse();
}

async function fetchAnonymisedContext(supabase: any, userId: string) {
  const [vitals, prescriptions, goals] = await Promise.all([
    supabase
      .from('vital_signs')
      .select('type, value, unit, recorded_at') // No id, no patient_id
      .eq('patient_id', userId)
      .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false })
      .limit(50),
    supabase
      .from('prescriptions')
      .select('medications(name, drug_class), dosage, frequency') // No prescriber, no pharmacy
      .eq('patient_id', userId)
      .eq('is_active', true),
    supabase
      .from('goals')
      .select('title, metric, target_value, target_unit, status')
      .eq('patient_id', userId)
      .eq('status', 'active'),
  ]);

  return {
    vitals: vitals.data ?? [],
    prescriptions: prescriptions.data ?? [],
    goals: goals.data ?? [],
  };
}
```

---

## System Prompt Builder

```typescript
// lib/ai/prompts.ts
interface PatientContext {
  vitals: Array<{ type: string; value: number; unit: string; recorded_at: string }>;
  prescriptions: Array<{
    medications: { name: string; drug_class: string };
    dosage: string;
    frequency: string;
  }>;
  goals: Array<{ title: string; metric: string; target_value: number; status: string }>;
}

export function buildCoachSystemPrompt(context: PatientContext): string {
  const vitalsSummary = summariseVitals(context.vitals);
  const medicationsList = context.prescriptions
    .map((p) => `${p.medications.name} ${p.dosage} ${p.frequency}`)
    .join(', ');
  const goalsList = context.goals
    .map((g) => `${g.title} (target: ${g.target_value} ${g.metric})`)
    .join('; ');

  return `You are a compassionate, evidence-based health coach for a patient managing a chronic condition (Type 2 Diabetes focus). You use Cognitive Behavioural Therapy (CBT) and Motivational Interviewing techniques.

PATIENT CONTEXT (last 7 days):
- Vital trends: ${vitalsSummary}
- Current medications: ${medicationsList || 'None recorded'}
- Active health goals: ${goalsList || 'No goals set yet'}

YOUR ROLE:
- Provide personalised, encouraging health coaching
- Help the patient understand their health data in plain language
- Suggest evidence-based lifestyle modifications
- Celebrate progress and reframe setbacks constructively
- Ask follow-up questions to understand the patient's situation

STRICT LIMITS:
- Never diagnose conditions
- Never prescribe or recommend specific medications or dosages
- Never contradict a doctor's written instructions
- If asked for specific medical advice, always redirect: "Your care team is best placed to advise on that — I can help you prepare questions for your next appointment."
- If you detect any crisis signals, immediately refer to emergency services

TONE: Warm, non-judgmental, and encouraging. Use "you" naturally. Keep responses concise (2–4 paragraphs max).`;
}

function summariseVitals(vitals: PatientContext['vitals']): string {
  if (!vitals.length) return 'No vitals logged this week';

  const byType = vitals.reduce(
    (acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type].push(v.value);
      return acc;
    },
    {} as Record<string, number[]>,
  );

  return Object.entries(byType)
    .map(([type, values]) => {
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
      return `${type.replace(/_/g, ' ')}: avg ${avg}`;
    })
    .join(', ');
}
```

---

## Client-Side Chat Component

```typescript
// components/coach/CoachChat.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { CrisisAlert } from './CrisisAlert';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface CoachChatProps {
  conversationId?: string;
  initialMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function CoachChat({ conversationId, initialMessages = [] }: CoachChatProps) {
  const [crisisDetected, setCrisisDetected] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    initialMessages,
    body: { conversationId },
    onResponse: async (response) => {
      // Check if server returned crisis flag
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.crisis) setCrisisDetected(true);
      }
    },
  });

  if (crisisDetected) {
    return <CrisisAlert onDismiss={() => setCrisisDetected(false)} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4" role="log" aria-label="Conversation with health coach" aria-live="polite">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isLoading && <ChatMessage message={{ role: 'assistant', content: '...' }} isLoading />}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

---

## Crisis Keywords Constants

```typescript
// lib/constants/health.constants.ts
export const CRISIS_KEYWORDS = [
  'suicidal',
  'want to die',
  'end my life',
  'kill myself',
  'chest pain',
  "can't breathe",
  'difficulty breathing',
  'stroke',
  'seizure',
  'unconscious',
  'fainted',
  'severe bleeding',
  'overdose',
  'took too many pills',
] as const;

export const VITAL_ALERT_DEFAULTS = {
  blood_glucose: { low: 70, high: 250 },
  blood_pressure_systolic: { high: 160 },
  blood_pressure_diastolic: { high: 100 },
  heart_rate: { low: 50, high: 120 },
  oxygen_saturation: { low: 94 },
} as const;
```

---

## Testing the AI Coach

```typescript
// tests/unit/ai/prompts.test.ts
import { buildCoachSystemPrompt } from '@/lib/ai/prompts';

test('system prompt includes vital summary', () => {
  const prompt = buildCoachSystemPrompt({
    vitals: [
      { type: 'blood_glucose', value: 145, unit: 'mg/dL', recorded_at: new Date().toISOString() },
    ],
    prescriptions: [],
    goals: [],
  });

  expect(prompt).toContain('blood glucose');
  expect(prompt).toContain('145');
});

test('system prompt contains hard limits', () => {
  const prompt = buildCoachSystemPrompt({ vitals: [], prescriptions: [], goals: [] });
  expect(prompt).toContain('Never diagnose');
  expect(prompt).toContain('Never prescribe');
});
```
