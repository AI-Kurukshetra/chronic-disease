import type { ChangeEvent, FormEvent } from 'react';

export interface ChatInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="border-t border-border p-4">
      <div className="flex gap-3">
        <label className="sr-only" htmlFor="coach-input">
          Message to health coach
        </label>
        <textarea
          id="coach-input"
          value={value}
          onChange={onChange}
          rows={2}
          placeholder="Ask about your progress, diet, or symptoms..."
          className="flex-1 resize-none rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || value.trim().length === 0}
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              Sending
              <span className="flex gap-0.5">
                <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:0ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:100ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-primary-foreground [animation-delay:200ms]" />
              </span>
            </span>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </form>
  );
}
