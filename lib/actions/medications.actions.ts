'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logMedicationSchema, type LogMedicationInput } from '@/lib/validations/medications.schema';
import { logServerError } from '@/lib/utils/errors';

export interface MedicationActionResult {
  success: boolean;
  error?: string;
}

export async function logMedication(input: LogMedicationInput): Promise<MedicationActionResult> {
  try {
    const parsed = logMedicationSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input.';
      return { success: false, error: message };
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: pendingLog, error: fetchError } = await supabase
      .from('medication_logs')
      .select('id')
      .eq('prescription_id', parsed.data.prescriptionId)
      .eq('patient_id', user.id)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      logServerError(fetchError, { action: 'logMedication.fetch', userId: user.id });
      return { success: false, error: 'Unable to update medication log. Please try again.' };
    }

    if (!pendingLog) {
      return { success: false, error: 'No pending medication reminder found.' };
    }

    const { error: updateError } = await supabase
      .from('medication_logs')
      .update({
        status: parsed.data.status,
        taken_at: parsed.data.status === 'taken' ? new Date().toISOString() : null,
        notes: parsed.data.notes ?? null,
      })
      .eq('id', pendingLog.id);

    if (updateError) {
      logServerError(updateError, { action: 'logMedication.update', userId: user.id });
      return { success: false, error: 'Failed to log medication. Please try again.' };
    }

    revalidatePath('/dashboard/medications');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'logMedication' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
