'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/telehealth.schema';
import { createAppointment } from '@/lib/actions/telehealth.actions';

export function AppointmentForm() {
  const router = useRouter();
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentType: 'telehealth',
      scheduledAt: '',
      durationMinutes: 30,
      notes: '',
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const result = await createAppointment(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to schedule appointment.' });
        return;
      }
      form.reset({ ...form.getValues(), scheduledAt: '', notes: '' });
      router.refresh();
    } catch {
      form.setError('root', { message: 'Unable to schedule appointment. Please try again.' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor="appointmentType"
          >
            Appointment type
          </label>
          <select
            id="appointmentType"
            className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-describedby={
              form.formState.errors.appointmentType ? 'appointmentType-error' : undefined
            }
            aria-invalid={!!form.formState.errors.appointmentType}
            {...form.register('appointmentType')}
          >
            <option value="telehealth">Telehealth</option>
            <option value="in_person">In person</option>
          </select>
          {form.formState.errors.appointmentType && (
            <p
              id="appointmentType-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.appointmentType.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="scheduledAt">
            Scheduled at
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.scheduledAt
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.scheduledAt ? 'scheduledAt-error' : undefined}
            aria-invalid={!!form.formState.errors.scheduledAt}
            {...form.register('scheduledAt')}
          />
          {form.formState.errors.scheduledAt && (
            <p
              id="scheduledAt-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.scheduledAt.message}
            </p>
          )}
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
            min={15}
            max={180}
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.durationMinutes
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={
              form.formState.errors.durationMinutes ? 'durationMinutes-error' : undefined
            }
            aria-invalid={!!form.formState.errors.durationMinutes}
            {...form.register('durationMinutes')}
          />
          {form.formState.errors.durationMinutes && (
            <p
              id="durationMinutes-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.durationMinutes.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="notes">
            Notes (optional)
          </label>
          <input
            id="notes"
            type="text"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.notes
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.notes ? 'notes-error' : undefined}
            aria-invalid={!!form.formState.errors.notes}
            {...form.register('notes')}
          />
          {form.formState.errors.notes && (
            <p
              id="notes-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.notes.message}
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
            Scheduling
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Schedule appointment'
        )}
      </button>
    </form>
  );
}
