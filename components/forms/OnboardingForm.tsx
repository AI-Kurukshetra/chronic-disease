'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations/auth.schema';
import { completeOnboarding } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';

export interface OnboardingFormProps {
  defaultValues?: Partial<OnboardingFormData>;
}

export function OnboardingForm({ defaultValues }: OnboardingFormProps) {
  const router = useRouter();
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      dateOfBirth: defaultValues?.dateOfBirth ?? '',
      phone: defaultValues?.phone ?? '',
      timezone: defaultValues?.timezone ?? '',
      primaryCondition: defaultValues?.primaryCondition ?? 'type2_diabetes',
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    const result = await completeOnboarding(data);
    if (!result.success) {
      form.setError('root', { message: result.error ?? 'Unable to save onboarding.' });
      return;
    }

    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="dateOfBirth">
          Date of birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.dateOfBirth
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={form.formState.errors.dateOfBirth ? 'dob-error' : undefined}
          aria-invalid={!!form.formState.errors.dateOfBirth}
          {...form.register('dateOfBirth')}
        />
        {form.formState.errors.dateOfBirth && (
          <p
            id="dob-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.dateOfBirth.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="phone">
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.phone
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={form.formState.errors.phone ? 'phone-error' : undefined}
          aria-invalid={!!form.formState.errors.phone}
          {...form.register('phone')}
        />
        {form.formState.errors.phone && (
          <p
            id="phone-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="timezone">
          Timezone
        </label>
        <input
          id="timezone"
          type="text"
          placeholder="e.g. America/New_York"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.timezone
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={form.formState.errors.timezone ? 'timezone-error' : undefined}
          aria-invalid={!!form.formState.errors.timezone}
          {...form.register('timezone')}
        />
        {form.formState.errors.timezone && (
          <p
            id="timezone-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.timezone.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-medium text-foreground"
          htmlFor="primaryCondition"
        >
          Primary condition
        </label>
        <input
          id="primaryCondition"
          type="text"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.primaryCondition
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={
            form.formState.errors.primaryCondition ? 'primaryCondition-error' : undefined
          }
          aria-invalid={!!form.formState.errors.primaryCondition}
          {...form.register('primaryCondition')}
        />
        {form.formState.errors.primaryCondition && (
          <p
            id="primaryCondition-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.primaryCondition.message}
          </p>
        )}
      </div>

      {form.formState.errors.root && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive-light px-3 py-2 text-sm text-destructive"
        >
          {form.formState.errors.root.message}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <span className="flex items-center justify-center gap-1">
            Saving
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Finish onboarding'
        )}
      </button>
    </form>
  );
}
