'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { symptomLogSchema, type SymptomLogFormData } from '@/lib/validations/symptoms.schema';
import { logServerError } from '@/lib/utils/errors';

export interface SymptomActionResult {
  success: boolean;
  error?: string;
}

export async function createSymptomLog(input: SymptomLogFormData): Promise<SymptomActionResult> {
  try {
    const parsed = symptomLogSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Please check the form fields.';
      return { success: false, error: message };
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Please sign in again to continue.' };
    }

    const { error } = await supabase.from('symptoms').insert({
      patient_id: user.id,
      symptom: parsed.data.symptom,
      severity: parsed.data.severity,
      notes: parsed.data.notes ?? null,
      recorded_at: parsed.data.recordedAt ?? new Date().toISOString(),
    });

    if (error) {
      logServerError(error, { action: 'createSymptomLog', userId: user.id });
      return { success: false, error: 'Unable to save your symptom. Please try again.' };
    }

    revalidatePath('/symptoms');

    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'createSymptomLog' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
