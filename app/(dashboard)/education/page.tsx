import type { Metadata } from 'next';
import { EDUCATION_ARTICLES, EDUCATION_CATEGORIES } from '@/lib/constants/education.content';
import { EducationLibrary } from '@/components/education/EducationLibrary';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Education | HealthOS' };
}

export default function EducationPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Health Education</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evidence-based articles to help you understand and manage your condition.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Articles
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{EDUCATION_ARTICLES.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Topics
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{EDUCATION_CATEGORIES.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avg. read time
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {Math.round(
              EDUCATION_ARTICLES.reduce((s, a) => s + a.readTime, 0) / EDUCATION_ARTICLES.length,
            )}{' '}
            min
          </p>
        </div>
      </div>

      <EducationLibrary articles={EDUCATION_ARTICLES} categories={EDUCATION_CATEGORIES} />
    </main>
  );
}
