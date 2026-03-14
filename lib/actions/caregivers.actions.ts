'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  caregiverInviteSchema,
  type CaregiverInviteFormData,
} from '@/lib/validations/caregivers.schema';
import { logServerError } from '@/lib/utils/errors';

export interface CaregiverActionResult {
  success: boolean;
  error?: string;
}

export async function inviteCaregiver(
  input: CaregiverInviteFormData,
): Promise<CaregiverActionResult> {
  try {
    const parsed = caregiverInviteSchema.safeParse(input);
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

    const { error } = await supabase.from('caregivers').insert({
      patient_id: user.id,
      caregiver_email: parsed.data.caregiverEmail,
      caregiver_name: parsed.data.caregiverName,
      relationship: parsed.data.relationship,
      status: 'pending',
    });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This email is already invited as a caregiver.' };
      }
      logServerError(error, { action: 'inviteCaregiver', userId: user.id });
      return { success: false, error: 'Unable to send invitation. Please try again.' };
    }

    revalidatePath('/caregivers');

    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'inviteCaregiver' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function revokeCaregiver(caregiverId: string): Promise<CaregiverActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Please sign in again to continue.' };
    }

    const { error } = await supabase
      .from('caregivers')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('id', caregiverId)
      .eq('patient_id', user.id);

    if (error) {
      logServerError(error, { action: 'revokeCaregiver', userId: user.id });
      return { success: false, error: 'Unable to revoke access. Please try again.' };
    }

    revalidatePath('/caregivers');
    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'revokeCaregiver' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
