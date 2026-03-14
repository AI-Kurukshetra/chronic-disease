'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { loginUser } from '@/lib/actions/auth.actions';

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginUser(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to sign in.' });
        return;
      }

      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch {
      form.setError('root', { message: 'Unable to sign in. Please try again.' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
          autoComplete="current-password"
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
        <div className="mt-2 flex items-center justify-end">
          <Link
            href="/login"
            className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
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
            Signing in
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Sign in'
        )}
      </button>

      <p className="text-sm text-muted-foreground">
        Need an account?{' '}
        <Link className="font-medium text-primary underline" href="/register">
          Create one
        </Link>
      </p>
    </form>
  );
}
