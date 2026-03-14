'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPostSchema,
  type CreatePostFormData,
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
} from '@/lib/validations/community.schema';
import { createPost } from '@/lib/actions/community.actions';

export function CreatePostForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
    },
  });

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      const result = await createPost(data);
      if (!result.success) {
        form.setError('root', { message: result.error ?? 'Unable to create post.' });
        return;
      }
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      form.setError('root', { message: 'Unable to create post. Please try again.' });
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        + New post
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Create a post</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="w-full rounded-lg border border-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            {...form.register('category')}
          >
            {POST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {POST_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="What would you like to share or ask?"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.title ? 'border-destructive' : 'border-input'
            }`}
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            rows={4}
            placeholder="Share your experience, ask a question, or offer support..."
            className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
              form.formState.errors.content ? 'border-destructive' : 'border-input'
            }`}
            {...form.register('content')}
          />
          {form.formState.errors.content && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {form.formState.errors.content.message}
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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {form.formState.isSubmitting ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              form.reset();
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
