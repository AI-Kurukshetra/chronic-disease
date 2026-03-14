'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { foodLogSchema } from '@/lib/validations/nutrition.schema';
import { logServerError } from '@/lib/utils/errors';

export interface NutritionActionResult {
  success: boolean;
  error?: string;
}

export async function createFoodLog(input: unknown): Promise<NutritionActionResult> {
  try {
    const parsed = foodLogSchema.safeParse(input);
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

    const payload = {
      patient_id: user.id,
      meal_type: parsed.data.mealType,
      description: parsed.data.description,
      calories: parsed.data.calories ?? null,
      protein_g: parsed.data.proteinG ?? null,
      carbs_g: parsed.data.carbsG ?? null,
      fat_g: parsed.data.fatG ?? null,
      logged_at: parsed.data.loggedAt ?? new Date().toISOString(),
    };

    const { error } = await supabase.from('food_logs').insert(payload);

    if (error) {
      logServerError(error, { action: 'createFoodLog', userId: user.id });
      return { success: false, error: 'Unable to save your meal. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'createFoodLog' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
