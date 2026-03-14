'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  VITAL_TYPES,
  VITAL_UNITS,
  vitalSignSchema,
  type VitalSignInput,
} from '@/lib/validations/vitals.schema';
import { logVitalSign } from '@/lib/actions/vitals.actions';

export function VitalSignForm() {
  const router = useRouter();
  const form = useForm<VitalSignInput>({
    resolver: zodResolver(vitalSignSchema),
    defaultValues: {
      type: 'blood_glucose',
      unit: VITAL_UNITS.blood_glucose,
      value: 0,
      notes: '',
    },
  });

  const selectedType = form.watch('type');

  useEffect(() => {
    form.setValue('unit', VITAL_UNITS[selectedType]);
  }, [form, selectedType]);

  const onSubmit = async (data: VitalSignInput) => {
    const result = await logVitalSign(data);
    if (!result.success) {
      form.setError('root', { message: result.error ?? 'Unable to log vital sign.' });
      return;
    }

    form.reset({
      type: selectedType,
      unit: VITAL_UNITS[selectedType],
      value: 0,
      notes: '',
    });

    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="type">
          Vital type
        </label>
        <select
          id="type"
          className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          {...form.register('type')}
        >
          {VITAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="value">
            Value
          </label>
          <input
            id="value"
            type="number"
            step="0.01"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.value
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.value ? 'value-error' : undefined}
            aria-invalid={!!form.formState.errors.value}
            {...form.register('value', { valueAsNumber: true })}
          />
          {form.formState.errors.value && (
            <p
              id="value-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.value.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="unit">
            Unit
          </label>
          <input
            id="unit"
            type="text"
            readOnly
            className="w-full rounded-lg border border-input bg-muted px-3 py-2.5 text-base text-muted-foreground"
            {...form.register('unit')}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
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
          <span className="flex items-center justify-center gap-1">
            Saving
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
            </span>
          </span>
        ) : (
          'Log vital'
        )}
      </button>
    </form>
  );
}
