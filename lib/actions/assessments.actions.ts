'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export interface AssessmentActionResult {
  success: boolean;
  score?: number;
  error?: string;
}

export async function submitAssessment(
  type: 'phq9' | 'gad7',
  responses: Record<string, number>,
): Promise<AssessmentActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Please sign in again to continue.' };
    }

    const score = Object.values(responses).reduce((sum, v) => sum + v, 0);

    const { error } = await supabase.from('assessments').insert({
      patient_id: user.id,
      type,
      score,
      responses,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      logServerError(error, { action: 'submitAssessment', userId: user.id });
      return { success: false, error: 'Unable to save your assessment. Please try again.' };
    }

    revalidatePath('/assessments');

    return { success: true, score };
  } catch (error) {
    logServerError(error, { action: 'submitAssessment' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
