import type { SupabaseClient } from '@supabase/supabase-js';
import type { PatientContext } from '@/lib/ai/prompts';
import { logServerError } from '@/lib/utils/errors';

export interface CoachMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachMessage extends CoachMessageInput {
  timestamp: string;
}

interface PrescriptionContextRow {
  medications:
    | { name: string; drug_class: string | null }
    | Array<{ name: string; drug_class: string | null }>
    | null;
  dosage: string;
  frequency: string;
}

export async function fetchAnonymizedContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<PatientContext> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [vitalsResponse, prescriptionsResponse, goalsResponse] = await Promise.all([
    supabase
      .from('vital_signs')
      .select('type, value, unit, recorded_at')
      .eq('patient_id', userId)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })
      .limit(50),
    supabase
      .from('prescriptions')
      .select('medications(name, drug_class), dosage, frequency')
      .eq('patient_id', userId)
      .eq('is_active', true),
    supabase
      .from('goals')
      .select('title, metric, target_value, target_unit, status')
      .eq('patient_id', userId)
      .eq('status', 'active'),
  ]);

  if (vitalsResponse.error) {
    logServerError(vitalsResponse.error, { action: 'fetchAnonymizedContext.vitals', userId });
  }

  if (prescriptionsResponse.error) {
    logServerError(prescriptionsResponse.error, {
      action: 'fetchAnonymizedContext.prescriptions',
      userId,
    });
  }

  if (goalsResponse.error) {
    logServerError(goalsResponse.error, { action: 'fetchAnonymizedContext.goals', userId });
  }

  return {
    vitals: vitalsResponse.data ?? [],
    prescriptions: (prescriptionsResponse.data ?? []).map((prescription) => {
      const typedPrescription = prescription as PrescriptionContextRow;
      const medication = Array.isArray(typedPrescription.medications)
        ? (typedPrescription.medications[0] ?? null)
        : typedPrescription.medications;

      return {
        medications: medication,
        dosage: typedPrescription.dosage,
        frequency: typedPrescription.frequency,
      };
    }),
    goals: goalsResponse.data ?? [],
  };
}

export async function persistConversation(
  supabase: SupabaseClient,
  userId: string,
  messages: CoachMessageInput[],
  assistantText: string,
  conversationId?: string,
): Promise<string | null> {
  const timestamp = new Date().toISOString();
  const updatedMessages: CoachMessage[] = [
    ...messages.map((message) => ({ ...message, timestamp })),
    { role: 'assistant', content: assistantText, timestamp },
  ];

  if (conversationId) {
    const { error } = await supabase
      .from('coach_conversations')
      .update({ messages: updatedMessages })
      .eq('id', conversationId)
      .eq('patient_id', userId);

    if (error) {
      logServerError(error, { action: 'persistConversation.update', userId });
      return null;
    }

    return conversationId;
  }

  const { data, error } = await supabase
    .from('coach_conversations')
    .insert({
      patient_id: userId,
      messages: updatedMessages,
      metadata: { model: 'claude-sonnet-4-20250514' },
    })
    .select('id')
    .single();

  if (error) {
    logServerError(error, { action: 'persistConversation.insert', userId });
    return null;
  }

  return data?.id ?? null;
}
