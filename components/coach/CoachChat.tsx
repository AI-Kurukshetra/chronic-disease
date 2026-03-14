'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { CrisisAlert } from '@/components/coach/CrisisAlert';
import { ChatMessage } from '@/components/coach/ChatMessage';
import { ChatInput } from '@/components/coach/ChatInput';

const toInitialMessages = (
  initial: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Array<{ id: string; role: 'user' | 'assistant'; content: string }> =>
  initial.map((message, index) => ({
    id: `seed-${index}`,
    role: message.role,
    content: message.content,
  }));

export interface CoachChatProps {
  conversationId?: string;
  initialMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function CoachChat({ conversationId, initialMessages = [] }: CoachChatProps) {
  const [crisisDetected, setCrisisDetected] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    initialMessages: toInitialMessages(initialMessages),
    body: { conversationId },
    onResponse: async (response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = (await response.json()) as { crisis?: boolean };
        if (data.crisis) {
          setCrisisDetected(true);
        }
      }
    },
  });

  const visibleMessages = messages.flatMap((message) =>
    message.role === 'user' || message.role === 'assistant'
      ? [
          {
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
          },
        ]
      : [],
  );

  if (crisisDetected) {
    return <CrisisAlert onDismiss={() => setCrisisDetected(false)} />;
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-card">
      <div
        className="flex-1 space-y-4 overflow-y-auto p-4"
        role="log"
        aria-label="Conversation with health coach"
        aria-live="polite"
      >
        {visibleMessages.map((message) => (
          <ChatMessage
            key={message.id}
            message={{
              role: message.role,
              content: message.content,
              ...(message.createdAt ? { createdAt: message.createdAt } : {}),
            }}
          />
        ))}
        {isLoading && <ChatMessage message={{ role: 'assistant', content: '' }} isLoading />}
        {error && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Something went wrong loading this data.
          </div>
        )}
      </div>
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
