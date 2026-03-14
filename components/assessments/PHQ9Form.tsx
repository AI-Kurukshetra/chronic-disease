'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitAssessment } from '@/lib/actions/assessments.actions';

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed. Or so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];

const RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

function getSeverityLabel(score: number): { label: string; color: string } {
  if (score <= 4) return { label: 'Minimal depression', color: 'text-green-700' };
  if (score <= 9) return { label: 'Mild depression', color: 'text-yellow-700' };
  if (score <= 14) return { label: 'Moderate depression', color: 'text-orange-700' };
  if (score <= 19) return { label: 'Moderately severe depression', color: 'text-red-600' };
  return { label: 'Severe depression', color: 'text-red-800' };
}

export function PHQ9Form() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = PHQ9_QUESTIONS.every((_, i) => responses[`q${i}`] !== undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAssessment('phq9', responses);
      if (!res.success) {
        setError(res.error ?? 'Failed to submit.');
      } else {
        setResult({ score: res.score ?? 0 });
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const { label, color } = getSeverityLabel(result.score);
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-foreground">PHQ-9 Complete</p>
        <p className="mt-1 text-4xl font-bold text-foreground">{result.score} / 27</p>
        <p className={`mt-1 text-sm font-medium ${color}`}>{label}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Please share your results with your care team. This tool screens for depression — it is
          not a diagnosis.
        </p>
        <button
          onClick={() => {
            setResult(null);
            setResponses({});
          }}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Take again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the
        following?
      </p>

      {PHQ9_QUESTIONS.map((question, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-sm font-medium text-foreground">
            <span className="mr-2 text-muted-foreground">{i + 1}.</span>
            {question}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RESPONSE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer flex-col items-center rounded-lg border p-2.5 text-center text-xs transition-colors ${
                  responses[`q${i}`] === opt.value
                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name={`q${i}`}
                  value={opt.value}
                  className="sr-only"
                  onChange={() => setResponses((prev) => ({ ...prev, [`q${i}`]: opt.value }))}
                />
                <span className="text-lg font-bold">{opt.value}</span>
                <span className="mt-1">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive-light px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!allAnswered || submitting}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit PHQ-9'}
      </button>

      {!allAnswered && (
        <p className="text-xs text-muted-foreground">Please answer all questions to submit.</p>
      )}
    </form>
  );
}
