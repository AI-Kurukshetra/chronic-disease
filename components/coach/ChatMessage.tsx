import type { ReactNode } from 'react';

export interface ChatMessageProps {
  message: { role: 'user' | 'assistant'; content: string; createdAt?: string | Date };
  isLoading?: boolean;
  children?: ReactNode;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const timestamp =
    message.createdAt instanceof Date
      ? message.createdAt
      : message.createdAt
        ? new Date(message.createdAt)
        : null;

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
      aria-live={isLoading ? 'polite' : undefined}
    >
      <div>
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
            isUser
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm border border-border bg-card text-foreground'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          ) : (
            message.content
          )}
        </div>
        {timestamp && !isLoading && (
          <p
            className={`mt-1 text-xs text-muted-foreground ${isUser ? 'text-right' : 'text-left'}`}
          >
            {timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
