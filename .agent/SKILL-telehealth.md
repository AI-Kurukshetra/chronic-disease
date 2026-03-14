# SKILL: Telehealth, Video Consultations & Secure Messaging

## HealthOS Agent Skill File

**Read this before any telehealth, video, or messaging task.**

---

## Key Rules

- Twilio Video is loaded with `next/dynamic` and `ssr: false` — it's browser-only
- Video tokens generated server-side — never expose Twilio API keys to client
- All messages stored in `messages` table with RLS — sender and recipient only
- Video sessions are logged in `appointments` table for HIPAA audit trail

---

## Twilio Video Token — Server Action

```typescript
// lib/actions/telehealth.actions.ts
'use server';

import twilio from 'twilio';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const { AccessToken } = twilio.jwt;
const { VideoGrant } = AccessToken;

const joinRoomSchema = z.object({
  appointmentId: z.string().uuid(),
});

export async function getTwilioVideoToken(
  input: z.infer<typeof joinRoomSchema>,
): Promise<{ token: string; roomName: string } | { error: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = joinRoomSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid appointment' };

  // Verify user is a participant in this appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, patient_id, provider_id, status')
    .eq('id', parsed.data.appointmentId)
    .or(`patient_id.eq.${user.id},provider_id.eq.${user.id}`)
    .single();

  if (!appointment) return { error: 'Appointment not found or access denied' };
  if (appointment.status !== 'confirmed') return { error: 'Appointment is not confirmed' };

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_VIDEO_API_KEY!,
    process.env.TWILIO_VIDEO_API_SECRET!,
    { identity: user.id, ttl: 3600 },
  );

  const roomName = `appointment-${parsed.data.appointmentId}`;
  token.addGrant(new VideoGrant({ room: roomName }));

  // Log join event for HIPAA audit
  await supabase.from('appointment_audit_logs').insert({
    appointment_id: parsed.data.appointmentId,
    user_id: user.id,
    event: 'video_joined',
    timestamp: new Date().toISOString(),
  });

  return { token: token.toJwt(), roomName };
}
```

---

## Video Call Component (Lazy Loaded)

```typescript
// components/telehealth/TelehealthRoom.tsx — wrapper
import dynamic from 'next/dynamic';
import { VideoCallSkeleton } from './VideoCallSkeleton';

const TwilioVideoCall = dynamic(
  () => import('./TwilioVideoCall'),
  {
    loading: () => <VideoCallSkeleton />,
    ssr: false, // Twilio Video SDK is browser-only
  }
);

interface TelehealthRoomProps {
  appointmentId: string;
}

export function TelehealthRoom({ appointmentId }: TelehealthRoomProps) {
  return <TwilioVideoCall appointmentId={appointmentId} />;
}
```

---

## Secure Messaging Server Actions

```typescript
// lib/actions/messages.actions.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const sendMessageSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  appointmentId: z.string().uuid().optional(),
});

export async function sendMessage(
  input: z.infer<typeof sendMessageSchema>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid message' };

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    recipient_id: parsed.data.recipientId,
    content: parsed.data.content,
    appointment_id: parsed.data.appointmentId,
    read: false,
  });

  if (error) {
    console.error('[sendMessage]', { userId: user.id, error: error.code });
    return { success: false, error: 'Failed to send message' };
  }

  revalidatePath('/dashboard/messages');
  revalidatePath('/provider/messages');
  return { success: true };
}
```

---

## Realtime Message Subscription

```typescript
// lib/hooks/useRealtimeMessages.ts
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Message = Database['public']['Tables']['messages']['Row'];

export function useRealtimeMessages(userId: string, conversationPartnerId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${userId}-${conversationPartnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, conversationPartnerId, supabase]);

  return messages;
}
```
