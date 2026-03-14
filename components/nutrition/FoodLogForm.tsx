'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { foodLogSchema, type FoodLogFormData } from '@/lib/validations/nutrition.schema';
import { createFoodLog } from '@/lib/actions/nutrition.actions';

export function FoodLogForm() {
  const router = useRouter();
  const form = useForm<FoodLogFormData>({
    resolver: zodResolver(foodLogSchema),
    defaultValues: {
      mealType: 'breakfast',
      description: '',
      calories: undefined,
      proteinG: undefined,
      carbsG: undefined,
      fatG: undefined,
      loggedAt: '',
    },
  });

  const onSubmit = async (data: FoodLogFormData) => {
    try {
      const result = await createFoodLog(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to save meal.' });
        return;
      }
      form.reset({
        ...form.getValues(),
        description: '',
        calories: undefined,
        proteinG: undefined,
        carbsG: undefined,
        fatG: undefined,
        loggedAt: '',
      });
      router.refresh();
    } catch {
      form.setError('root', { message: 'Unable to save meal. Please try again.' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="mealType">
            Meal type
          </label>
          <select
            id="mealType"
            className="w-full rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-describedby={form.formState.errors.mealType ? 'mealType-error' : undefined}
            aria-invalid={!!form.formState.errors.mealType}
            {...form.register('mealType')}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          {form.formState.errors.mealType && (
            <p
              id="mealType-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.mealType.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="loggedAt">
            Logged at (optional)
          </label>
          <input
            id="loggedAt"
            type="datetime-local"
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.loggedAt
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.loggedAt ? 'loggedAt-error' : undefined}
            aria-invalid={!!form.formState.errors.loggedAt}
            {...form.register('loggedAt')}
          />
          {form.formState.errors.loggedAt && (
            <p
              id="loggedAt-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.loggedAt.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="description">
          Description
        </label>
        <input
          id="description"
          type="text"
          className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
            form.formState.errors.description
              ? 'border-destructive focus:ring-destructive'
              : 'border-input'
          }`}
          aria-describedby={form.formState.errors.description ? 'description-error' : undefined}
          aria-invalid={!!form.formState.errors.description}
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p
            id="description-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="calories">
            Calories
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
            aria-describedby={form.formState.errors.calories ? 'calories-error' : undefined}
            aria-invalid={!!form.formState.errors.calories}
            {...form.register('calories')}
          />
          {form.formState.errors.calories && (
            <p
              id="calories-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.calories.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="proteinG">
            Protein (g)
          </label>
          <input
            id="proteinG"
            type="number"
            min={0}
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.proteinG
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.proteinG ? 'proteinG-error' : undefined}
            aria-invalid={!!form.formState.errors.proteinG}
            {...form.register('proteinG')}
          />
          {form.formState.errors.proteinG && (
            <p
              id="proteinG-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.proteinG.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="carbsG">
            Carbs (g)
          </label>
          <input
            id="carbsG"
            type="number"
            min={0}
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.carbsG
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.carbsG ? 'carbsG-error' : undefined}
            aria-invalid={!!form.formState.errors.carbsG}
            {...form.register('carbsG')}
          />
          {form.formState.errors.carbsG && (
            <p
              id="carbsG-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.carbsG.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="fatG">
            Fat (g)
          </label>
          <input
            id="fatG"
            type="number"
            min={0}
            className={`w-full rounded-lg border px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.fatG
                ? 'border-destructive focus:ring-destructive'
                : 'border-input'
            }`}
            aria-describedby={form.formState.errors.fatG ? 'fatG-error' : undefined}
            aria-invalid={!!form.formState.errors.fatG}
            {...form.register('fatG')}
          />
          {form.formState.errors.fatG && (
            <p
              id="fatG-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-destructive"
            >
              {form.formState.errors.fatG.message}
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
          'Save meal'
        )}
      </button>
    </form>
  );
}
