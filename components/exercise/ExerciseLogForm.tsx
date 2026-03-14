'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  exerciseLogSchema,
  type ExerciseLogFormData,
  ACTIVITY_TYPES,
  ACTIVITY_LABELS,
} from '@/lib/validations/exercise.schema';
import { createExerciseLog } from '@/lib/actions/exercise.actions';

const exerciseLogDefaultValues = {
  activityType: 'walking',
  loggedAt: '',
} satisfies Partial<ExerciseLogFormData>;

export function ExerciseLogForm() {
  const router = useRouter();
  const form = useForm<ExerciseLogFormData>({
    resolver: zodResolver(exerciseLogSchema),
    defaultValues: exerciseLogDefaultValues,
  });

  const onSubmit = async (data: ExerciseLogFormData) => {
    try {
      const result = await createExerciseLog(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to save activity.' });
        return;
      }
      form.reset(exerciseLogDefaultValues);
      router.refresh();
    } catch {
      form.setError('root', { message: 'Unable to save activity. Please try again.' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor="activityType"
          >
            Activity type
          </label>
          <select
            id="activityType"
            className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-describedby={form.formState.errors.activityType ? 'activityType-error' : undefined}
            aria-invalid={!!form.formState.errors.activityType}
            {...form.register('activityType')}
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {ACTIVITY_LABELS[type]}
              </option>
            ))}
          </select>
          {form.formState.errors.activityType && (
            <p id="activityType-error" role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.activityType.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="loggedAt">
            Date & time (optional)
          </label>
          <input
            id="loggedAt"
            type="datetime-local"
            className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            {...form.register('loggedAt')}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor="durationMinutes"
          >
            Duration (minutes)
          </label>
          <input
            id="durationMinutes"
            type="number"
            min={1}
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.durationMinutes
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={
              form.formState.errors.durationMinutes ? 'durationMinutes-error' : undefined
            }
            aria-invalid={!!form.formState.errors.durationMinutes}
            {...form.register('durationMinutes', { valueAsNumber: true })}
          />
          {form.formState.errors.durationMinutes && (
            <p id="durationMinutes-error" role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.durationMinutes.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="calories">
            Calories burned (optional)
          </label>
          <input
            id="calories"
            type="number"
            min={0}
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.calories
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            {...form.register('calories', { valueAsNumber: true })}
          />
          {form.formState.errors.calories && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.calories.message}
            </p>
          )}
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
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <span className="flex items-center gap-1">
            Saving
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Log activity'
        )}
      </button>
    </form>
  );
}
