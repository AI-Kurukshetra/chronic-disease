'use server';

import { registerSchema, onboardingSchema, loginSchema } from '@/lib/validations/auth.schema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { logServerError } from '@/lib/utils/errors';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

type UserRole = 'patient' | 'provider' | 'admin';

function extractRole(metadata: unknown): UserRole | null {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }

  if ('role' in metadata) {
    const roleValue = (metadata as { role?: unknown }).role;
    if (roleValue === 'patient' || roleValue === 'provider' || roleValue === 'admin') {
      return roleValue;
    }
  }

  return null;
}

export async function registerPatient(input: unknown): Promise<AuthActionResult> {
  try {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Please check the form fields.';
      return { success: false, error: message };
    }

    let supabase: ReturnType<typeof createSupabaseServerClient>;
    try {
      supabase = createSupabaseServerClient();
    } catch (configError) {
      logServerError(configError, { action: 'registerPatient.config' });
      return {
        success: false,
        error: 'Supabase configuration is invalid. Check URL and anon key in .env.local.',
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
        },
      },
    });

    if (error || !data.user) {
      const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';

      if (message.includes('signup is disabled') || message.includes('signups are disabled')) {
        return {
          success: false,
          error: 'Email signups are disabled in Supabase. Enable Email provider and try again.',
        };
      }

      if (message.includes('user already registered') || message.includes('already registered')) {
        return { success: false, error: 'This email is already registered. Please sign in.' };
      }

      if (message.includes('invalid email')) {
        return { success: false, error: 'Enter a valid email address.' };
      }

      if (message.includes('password')) {
        return { success: false, error: 'Password does not meet requirements.' };
      }

      if (message.includes('rate limit')) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }

      logServerError(error, { action: 'registerPatient.signup' });
      return { success: false, error: 'Unable to create your account. Please try again.' };
    }

    let admin: ReturnType<typeof createSupabaseAdminClient>;
    try {
      admin = createSupabaseAdminClient();
    } catch (adminError) {
      logServerError(adminError, { action: 'registerPatient.adminClient', userId: data.user.id });
      return {
        success: false,
        error:
          'Supabase service role configuration is invalid. Verify SUPABASE_SERVICE_ROLE_KEY matches the project.',
      };
    }
    const profilePayload = {
      id: data.user.id,
      role: 'patient',
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      timezone: 'UTC',
    };

    const { error: profileError } = await admin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      const message =
        typeof profileError.message === 'string' ? profileError.message.toLowerCase() : '';
      logServerError(profileError, { action: 'registerPatient.profile', userId: data.user.id });

      if (message.includes('relation') && message.includes('does not exist')) {
        return {
          success: false,
          error: 'Database tables are missing. Please run the Supabase migrations in SQL Editor.',
        };
      }

      if (message.includes('violates foreign key') || message.includes('foreign key')) {
        return {
          success: false,
          error: 'Supabase keys appear to be from different projects. Use matching URL and keys.',
        };
      }

      if (message.includes('permission denied') || message.includes('row violates')) {
        return {
          success: false,
          error:
            'Supabase service role key is incorrect or missing. Use the Service Role key (not anon).',
        };
      }

      if (message.includes('invalid api key') || message.includes('jwt')) {
        return {
          success: false,
          error: 'Supabase service role key is invalid. Please update SUPABASE_SERVICE_ROLE_KEY.',
        };
      }

      return {
        success: false,
        error: 'Account created, but profile setup failed. Please try again.',
      };
    }

    const existingMetadata =
      data.user.app_metadata && typeof data.user.app_metadata === 'object'
        ? (data.user.app_metadata as Record<string, unknown>)
        : {};
    const { error: metadataError } = await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
        ...existingMetadata,
        role: 'patient',
      },
    });

    if (metadataError) {
      logServerError(metadataError, { action: 'registerPatient.metadata', userId: data.user.id });
      return {
        success: false,
        error: 'Account created, but role setup failed. Please contact support.',
      };
    }

    const patientPayload = {
      profile_id: data.user.id,
      primary_condition: 'type2_diabetes',
      risk_level: 'medium',
    };

    const { error: patientError } = await admin
      .from('patients')
      .upsert(patientPayload, { onConflict: 'profile_id' });

    if (patientError) {
      const message =
        typeof patientError.message === 'string' ? patientError.message.toLowerCase() : '';
      logServerError(patientError, { action: 'registerPatient.patient', userId: data.user.id });

      if (message.includes('relation') && message.includes('does not exist')) {
        return {
          success: false,
          error: 'Database tables are missing. Please run the Supabase migrations in SQL Editor.',
        };
      }

      if (message.includes('violates foreign key') || message.includes('foreign key')) {
        return {
          success: false,
          error: 'Supabase keys appear to be from different projects. Use matching URL and keys.',
        };
      }

      if (message.includes('permission denied') || message.includes('row violates')) {
        return {
          success: false,
          error:
            'Supabase service role key is incorrect or missing. Use the Service Role key (not anon).',
        };
      }

      if (message.includes('invalid api key') || message.includes('jwt')) {
        return {
          success: false,
          error: 'Supabase service role key is invalid. Please update SUPABASE_SERVICE_ROLE_KEY.',
        };
      }

      return {
        success: false,
        error: 'Account created, but patient setup failed. Please try again.',
      };
    }

    return { success: true, redirectTo: '/onboarding' };
  } catch (error) {
    logServerError(error, { action: 'registerPatient' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function loginUser(input: unknown): Promise<AuthActionResult> {
  try {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Please check the form fields.';
      return { success: false, error: message };
    }

    let supabase: ReturnType<typeof createSupabaseServerClient>;
    try {
      supabase = createSupabaseServerClient();
    } catch (configError) {
      logServerError(configError, { action: 'loginUser.config' });
      return {
        success: false,
        error: 'Supabase configuration is invalid. Check URL and anon key in .env.local.',
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';

      if (message.includes('email not confirmed') || message.includes('confirm')) {
        return {
          success: false,
          error:
            'Email not confirmed. Confirm the user in Supabase Auth or disable email confirmation for testing.',
        };
      }

      if (message.includes('invalid login credentials') || message.includes('invalid')) {
        return { success: false, error: 'Invalid email or password.' };
      }

      if (message.includes('user disabled')) {
        return { success: false, error: 'This user is disabled in Supabase Auth.' };
      }

      if (message.includes('rate limit') || message.includes('too many')) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }

      logServerError(error, { action: 'loginUser.auth' });
      return { success: false, error: 'Unable to sign in. Please try again.' };
    }

    let role = extractRole(data.user.app_metadata);
    let admin: ReturnType<typeof createSupabaseAdminClient> | null = null;

    if (!role) {
      try {
        admin = createSupabaseAdminClient();
      } catch (adminError) {
        logServerError(adminError, { action: 'loginUser.adminClient', userId: data.user.id });
        return {
          success: false,
          error:
            'Supabase service role configuration is invalid. Verify SUPABASE_SERVICE_ROLE_KEY matches the project.',
        };
      }

      const { data: profile, error: profileError } = await admin
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        logServerError(profileError, { action: 'loginUser.profile', userId: data.user.id });
        return { success: false, error: 'Unable to load your profile. Please try again.' };
      }

      if (!profile) {
        return {
          success: false,
          error:
            'Profile not found for this user. Please create the account from the app registration page.',
        };
      }

      role = profile.role as UserRole;
    }

    if (admin && role) {
      const existingMetadata =
        data.user.app_metadata && typeof data.user.app_metadata === 'object'
          ? (data.user.app_metadata as Record<string, unknown>)
          : {};
      const { error: updateError } = await admin.auth.admin.updateUserById(data.user.id, {
        app_metadata: {
          ...existingMetadata,
          role,
        },
      });

      if (updateError) {
        logServerError(updateError, { action: 'loginUser.metadata', userId: data.user.id });
      }
    }

    const redirectTo =
      role === 'provider' ? '/patients' : role === 'admin' ? '/admin' : '/dashboard';

    return { success: true, redirectTo };
  } catch (error) {
    logServerError(error, { action: 'loginUser' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    logServerError(error, { action: 'logoutUser' });
  }

  redirect('/');
}

export async function completeOnboarding(input: unknown): Promise<AuthActionResult> {
  try {
    const parsed = onboardingSchema.safeParse(input);
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

    const profileUpdates: {
      phone?: string | null;
      timezone?: string;
      date_of_birth?: string | null;
    } = {};

    if (parsed.data.phone !== undefined) {
      profileUpdates.phone = parsed.data.phone ?? null;
    }

    if (parsed.data.timezone !== undefined) {
      profileUpdates.timezone = parsed.data.timezone;
    }

    if (parsed.data.dateOfBirth !== undefined) {
      profileUpdates.date_of_birth = parsed.data.dateOfBirth ?? null;
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (profileError) {
        logServerError(profileError, { action: 'completeOnboarding.profile', userId: user.id });
        return { success: false, error: 'Unable to save your profile details. Please try again.' };
      }
    }

    const patientUpdates: {
      primary_condition?: string | null;
    } = {};

    if (parsed.data.primaryCondition !== undefined) {
      patientUpdates.primary_condition = parsed.data.primaryCondition ?? null;
    }

    if (Object.keys(patientUpdates).length > 0) {
      const { error: patientError } = await supabase
        .from('patients')
        .update(patientUpdates)
        .eq('profile_id', user.id);

      if (patientError) {
        logServerError(patientError, { action: 'completeOnboarding.patient', userId: user.id });
        return { success: false, error: 'Unable to save your patient details. Please try again.' };
      }
    }

    return { success: true, redirectTo: '/dashboard' };
  } catch (error) {
    logServerError(error, { action: 'completeOnboarding' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
