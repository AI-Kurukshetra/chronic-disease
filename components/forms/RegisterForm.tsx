'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { registerPatient } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerPatient(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to register.' });
        return;
      }

      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch {
      form.setError('root', { message: 'Unable to register. Please try again.' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.firstName
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.firstName ? 'firstName-error' : undefined}
            aria-invalid={!!form.formState.errors.firstName}
            {...form.register('firstName')}
          />
          {form.formState.errors.firstName && (
            <p
              id="firstName-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.lastName
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.lastName ? 'lastName-error' : undefined}
            aria-invalid={!!form.formState.errors.lastName}
            {...form.register('lastName')}
          />
          {form.formState.errors.lastName && (
            <p
              id="lastName-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.email
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
          aria-invalid={!!form.formState.errors.email}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p
            id="email-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.password
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={form.formState.errors.password ? 'password-error' : undefined}
          aria-invalid={!!form.formState.errors.password}
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p
            id="password-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-medium text-foreground"
          htmlFor="confirmPassword"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.confirmPassword
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={
            form.formState.errors.confirmPassword ? 'confirmPassword-error' : undefined
          }
          aria-invalid={!!form.formState.errors.confirmPassword}
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword && (
          <p
            id="confirmPassword-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.confirmPassword.message}
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
            Creating
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  );
}
