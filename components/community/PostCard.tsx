'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleLike, createReply } from '@/lib/actions/community.actions';
import { POST_CATEGORY_LABELS } from '@/lib/validations/community.schema';

export interface CommunityReply {
  id: string;
  content: string;
  created_at: string;
  profiles: { first_name: string; last_name: string } | null;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  like_count: number;
  is_pinned: boolean;
  created_at: string;
  profiles: { first_name: string; last_name: string } | null;
  community_replies?: CommunityReply[];
  userLiked?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  diabetes: 'bg-blue-100 text-blue-800',
  heart_health: 'bg-red-100 text-red-800',
  weight_management: 'bg-purple-100 text-purple-800',
  mental_health: 'bg-teal-100 text-teal-800',
  medications: 'bg-orange-100 text-orange-800',
  exercise: 'bg-green-100 text-green-800',
  nutrition: 'bg-lime-100 text-lime-800',
  success_story: 'bg-yellow-100 text-yellow-800',
  question: 'bg-pink-100 text-pink-800',
  general: 'bg-gray-100 text-gray-700',
};

function ReplyForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createReply({ postId, content });
      if (!result.success) {
        setError(result.error ?? 'Failed to post reply.');
      } else {
        setContent('');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 rounded-lg border border-input px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={!content.trim() || submitting}
        className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? '...' : 'Reply'}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </form>
  );
}

export function PostCard({ post }: { post: CommunityPost }) {
  const router = useRouter();
  const [showReplies, setShowReplies] = useState(false);
  const [liking, setLiking] = useState(false);

  const authorName = post.profiles
    ? `${post.profiles.first_name} ${post.profiles.last_name[0]}.`
    : 'Anonymous';

  const replyCount = post.community_replies?.length ?? 0;

  const handleLike = async () => {
    setLiking(true);
    await toggleLike(post.id);
    setLiking(false);
    router.refresh();
  };

  return (
    <div
      className={`rounded-lg border bg-card p-5 shadow-card ${post.is_pinned ? 'border-primary/40' : 'border-border'}`}
    >
      {post.is_pinned && (
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-primary">
          <span>📌</span> Pinned
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.general}`}
            >
              {POST_CATEGORY_LABELS[post.category] ?? post.category}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-snug text-foreground">{post.title}</h3>
        </div>
      </div>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {post.content}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>By {authorName}</span>
        <span>{new Date(post.created_at).toLocaleDateString('en-US')}</span>

        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1 transition-colors hover:text-primary ${post.userLiked ? 'font-semibold text-primary' : ''}`}
        >
          <span>♥</span> {post.like_count}
        </button>

        <button
          onClick={() => setShowReplies((v) => !v)}
          className="transition-colors hover:text-primary"
        >
          💬 {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
        </button>
      </div>

      {showReplies && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {(post.community_replies ?? []).map((reply) => (
            <div key={reply.id} className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-sm text-foreground">{reply.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {reply.profiles
                  ? `${reply.profiles.first_name} ${reply.profiles.last_name[0]}.`
                  : 'Anonymous'}{' '}
                · {new Date(reply.created_at).toLocaleDateString('en-US')}
              </p>
            </div>
          ))}
          <ReplyForm postId={post.id} />
        </div>
      )}
    </div>
  );
}
