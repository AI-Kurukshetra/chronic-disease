'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { symptomLogSchema, type SymptomLogFormData } from '@/lib/validations/symptoms.schema';
import { createSymptomLog } from '@/lib/actions/symptoms.actions';

const SEVERITY_LABELS: Record<number, string> = {
  1: '1 – Barely noticeable',
  2: '2 – Very mild',
  3: '3 – Mild',
  4: '4 – Mild-moderate',
  5: '5 – Moderate',
  6: '6 – Moderately severe',
  7: '7 – Severe',
  8: '8 – Very severe',
  9: '9 – Intense',
  10: '10 – Worst possible',
};

export function SymptomLogForm() {
  const router = useRouter();
  const form = useForm<SymptomLogFormData>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: {
      symptom: '',
      severity: 5,
      notes: '',
      recordedAt: '',
    },
  });

  const severityValue = form.watch('severity');

  const onSubmit = async (data: SymptomLogFormData) => {
    try {
      const result = await createSymptomLog(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to save symptom.' });
        return;
      }
      form.reset({ symptom: '', severity: 5, notes: '', recordedAt: '' });
      router.refresh();
    } catch {
      form.setError('root', { message: 'Unable to save symptom. Please try again.' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="symptom">
            Symptom
          </label>
          <input
            id="symptom"
            type="text"
            placeholder="e.g. headache, fatigue, chest pain"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.symptom
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.symptom ? 'symptom-error' : undefined}
            aria-invalid={!!form.formState.errors.symptom}
            {...form.register('symptom')}
          />
          {form.formState.errors.symptom && (
            <p id="symptom-error" role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.symptom.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="recordedAt">
            Date & time (optional)
          </label>
          <input
            id="recordedAt"
            type="datetime-local"
            className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            {...form.register('recordedAt')}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="severity">
          Severity:{' '}
          <span className="font-semibold text-foreground">
            {SEVERITY_LABELS[severityValue] ?? severityValue}
          </span>
        </label>
        <input
          id="severity"
          type="range"
          min={1}
          max={10}
          step={1}
          className="w-full accent-primary"
          aria-describedby={form.formState.errors.severity ? 'severity-error' : undefined}
          aria-invalid={!!form.formState.errors.severity}
          {...form.register('severity', { valueAsNumber: true })}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1 (mild)</span>
          <span>10 (severe)</span>
        </div>
        {form.formState.errors.severity && (
          <p id="severity-error" role="alert" className="mt-1 text-xs text-destructive">
            {form.formState.errors.severity.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={2}
          placeholder="Any additional context..."
          className="w-full resize-none rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          {...form.register('notes')}
        />
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
          'Log symptom'
        )}
      </button>
    </form>
  );
}
