'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { vitalSignSchema, type VitalSignInput } from '@/lib/validations/vitals.schema';
import { logServerError } from '@/lib/utils/errors';

export interface VitalActionResult {
  success: boolean;
  error?: string;
}

export async function logVitalSign(input: VitalSignInput): Promise<VitalActionResult> {
  try {
    const parsed = vitalSignSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid vital sign data.';
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

    const { error } = await supabase.from('vital_signs').insert({
      patient_id: user.id,
      type: parsed.data.type,
      value: parsed.data.value,
      unit: parsed.data.unit,
      notes: parsed.data.notes ?? null,
      source: 'manual',
      recorded_at: parsed.data.recorded_at ?? undefined,
    });

    if (error) {
      logServerError(error, { action: 'logVitalSign', userId: user.id });
      return { success: false, error: 'Failed to save the vital sign. Please try again.' };
    }

    revalidatePath('/dashboard/vitals');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'logVitalSign' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
