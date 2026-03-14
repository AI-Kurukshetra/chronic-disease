'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { exerciseLogSchema, type ExerciseLogFormData } from '@/lib/validations/exercise.schema';
import { logServerError } from '@/lib/utils/errors';

export interface ExerciseActionResult {
  success: boolean;
  error?: string;
}

export async function createExerciseLog(input: ExerciseLogFormData): Promise<ExerciseActionResult> {
  try {
    const parsed = exerciseLogSchema.safeParse(input);
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

    const { error } = await supabase.from('exercise_logs').insert({
      patient_id: user.id,
      activity_type: parsed.data.activityType,
      duration_minutes: parsed.data.durationMinutes,
      calories: parsed.data.calories ?? null,
      source: 'manual',
      logged_at: parsed.data.loggedAt ?? new Date().toISOString(),
    });

    if (error) {
      logServerError(error, { action: 'createExerciseLog', userId: user.id });
      return { success: false, error: 'Unable to save your activity. Please try again.' };
    }

    revalidatePath('/exercise');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'createExerciseLog' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
