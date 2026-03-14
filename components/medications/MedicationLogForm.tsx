'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { logMedicationSchema, type LogMedicationInput } from '@/lib/validations/medications.schema';
import { logMedication } from '@/lib/actions/medications.actions';

export interface MedicationLogFormProps {
  prescriptionId: string;
}

export function MedicationLogForm({ prescriptionId }: MedicationLogFormProps) {
  const [pendingAction, setPendingAction] = useState<'taken' | 'skipped' | null>(null);
  const form = useForm<LogMedicationInput>({
    resolver: zodResolver(logMedicationSchema),
    defaultValues: {
      prescriptionId,
      status: 'taken',
      notes: '',
    },
  });

  const onSubmit = async (data: LogMedicationInput) => {
    const result = await logMedication(data);
    if (!result.success) {
      form.setError('root', { message: result.error ?? 'Unable to log medication.' });
      setPendingAction(null);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2" noValidate>
      <input type="hidden" value={prescriptionId} {...form.register('prescriptionId')} />
      <button
        type="submit"
        onClick={() => {
          form.setValue('status', 'taken');
          setPendingAction('taken');
        }}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && pendingAction === 'taken' ? (
          <span className="flex items-center gap-1">
            Saving
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Taken'
        )}
      </button>
      <button
        type="submit"
        onClick={() => {
          form.setValue('status', 'skipped');
          setPendingAction('skipped');
        }}
        className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors duration-150 hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && pendingAction === 'skipped' ? (
          <span className="flex items-center gap-1">
            Saving
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Skipped'
        )}
      </button>
      {form.formState.errors.root && (
        <p role="alert" className="text-xs text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
    </form>
  );
}
