import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { PostCard, type CommunityPost } from '@/components/community/PostCard';
import { CreatePostForm } from '@/components/community/CreatePostForm';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Community | HealthOS' };
}

export default async function CommunityPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select(
        `
        id,
        title,
        content,
        category,
        like_count,
        is_pinned,
        created_at,
        profiles ( first_name, last_name ),
        community_replies (
          id,
          content,
          created_at,
          profiles ( first_name, last_name )
        )
      `,
      )
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    if (postsError) {
      logServerError(postsError, { action: 'CommunityPage.posts', userId: user.id });
    }

    const { data: userLikes } = await supabase
      .from('community_likes')
      .select('post_id')
      .eq('user_id', user.id);

    const likedPostIds = new Set((userLikes ?? []).map((l) => l.post_id));

    const enrichedPosts = ((posts as unknown as CommunityPost[]) ?? []).map((p) => ({
      ...p,
      userLiked: likedPostIds.has(p.id),
    }));

    const totalPosts = enrichedPosts.length;
    const totalReplies = enrichedPosts.reduce((s, p) => s + (p.community_replies?.length ?? 0), 0);

    return (
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Community</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Share experiences and support others living with chronic conditions.
            </p>
          </div>
          <CreatePostForm />
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <strong>Community guidelines:</strong> Be respectful and supportive. Do not share
            personal medical advice. This forum does not replace professional care.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Posts
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalPosts}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Replies
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalReplies}</p>
          </div>
        </div>

        <section className="space-y-4">
          {enrichedPosts.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/40 p-12 text-center">
              <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            enrichedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'CommunityPage' });
    throw new Error('Unable to load community at this time.');
  }
}
