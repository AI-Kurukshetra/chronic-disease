'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { appointmentSchema } from '@/lib/validations/telehealth.schema';
import { logServerError } from '@/lib/utils/errors';

export interface TelehealthActionResult {
  success: boolean;
  error?: string;
}

export async function createAppointment(input: unknown): Promise<TelehealthActionResult> {
  try {
    const parsed = appointmentSchema.safeParse(input);
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

    const { data: carePlan, error: carePlanError } = await supabase
      .from('care_plans')
      .select('provider_id')
      .eq('patient_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (carePlanError) {
      logServerError(carePlanError, { action: 'createAppointment.carePlan', userId: user.id });
      return { success: false, error: 'Unable to load your care team. Please try again.' };
    }

    if (!carePlan?.provider_id) {
      return {
        success: false,
        error: 'No care plan found. Please ask your provider to assign a care plan.',
      };
    }

    const payload = {
      patient_id: user.id,
      provider_id: carePlan.provider_id,
      appointment_type: parsed.data.appointmentType,
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: parsed.data.durationMinutes,
      status: 'scheduled',
      notes: parsed.data.notes ?? null,
    };

    const { error } = await supabase.from('appointments').insert(payload);

    if (error) {
      logServerError(error, { action: 'createAppointment.insert', userId: user.id });
      return { success: false, error: 'Unable to schedule appointment. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'createAppointment' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
