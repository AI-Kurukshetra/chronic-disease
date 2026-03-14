'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  caregiverInviteSchema,
  type CaregiverInviteFormData,
  CAREGIVER_RELATIONSHIPS,
} from '@/lib/validations/caregivers.schema';
import { inviteCaregiver } from '@/lib/actions/caregivers.actions';

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: 'Spouse / Partner',
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  friend: 'Friend',
  other: 'Other',
};

export function CaregiverInviteForm() {
  const router = useRouter();
  const form = useForm<CaregiverInviteFormData>({
    resolver: zodResolver(caregiverInviteSchema),
    defaultValues: {
      caregiverEmail: '',
      caregiverName: '',
      relationship: 'other',
    },
  });

  const onSubmit = async (data: CaregiverInviteFormData) => {
    try {
      const result = await inviteCaregiver(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to send invitation.' });
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      form.setError('root', { message: 'Unable to send invitation. Please try again.' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor="caregiverName"
          >
            Caregiver name
          </label>
          <input
            id="caregiverName"
            type="text"
            placeholder="Full name"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.caregiverName ? 'border-destructive' : 'border-input'
            }`}
            {...form.register('caregiverName')}
          />
          {form.formState.errors.caregiverName && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.caregiverName.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor="caregiverEmail"
          >
            Email address
          </label>
          <input
            id="caregiverEmail"
            type="email"
            placeholder="email@example.com"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.caregiverEmail ? 'border-destructive' : 'border-input'
            }`}
            {...form.register('caregiverEmail')}
          />
          {form.formState.errors.caregiverEmail && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.caregiverEmail.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="relationship">
          Relationship
        </label>
        <select
          id="relationship"
          className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          {...form.register('relationship')}
        >
          {CAREGIVER_RELATIONSHIPS.map((rel) => (
            <option key={rel} value={rel}>
              {RELATIONSHIP_LABELS[rel]}
            </option>
          ))}
        </select>
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
        disabled={form.formState.isSubmitting}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {form.formState.isSubmitting ? 'Sending...' : 'Send invitation'}
      </button>
    </form>
  );
}
