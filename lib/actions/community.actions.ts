'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  createPostSchema,
  createReplySchema,
  type CreatePostFormData,
  type CreateReplyFormData,
} from '@/lib/validations/community.schema';
import { logServerError } from '@/lib/utils/errors';

export interface CommunityActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createPost(input: CreatePostFormData): Promise<CommunityActionResult> {
  try {
    const parsed = createPostSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Please sign in again to continue.' };
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        author_id: user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        category: parsed.data.category,
      })
      .select('id')
      .single();

    if (error) {
      logServerError(error, { action: 'createPost', userId: user.id });
      return { success: false, error: 'Unable to create post. Please try again.' };
    }

    revalidatePath('/community');
    return { success: true, id: data.id };
  } catch (error) {
    logServerError(error, { action: 'createPost' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function createReply(input: CreateReplyFormData): Promise<CommunityActionResult> {
  try {
    const parsed = createReplySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Please sign in again to continue.' };
    }

    const { error } = await supabase.from('community_replies').insert({
      post_id: parsed.data.postId,
      author_id: user.id,
      content: parsed.data.content,
    });

    if (error) {
      logServerError(error, { action: 'createReply', userId: user.id });
      return { success: false, error: 'Unable to post reply. Please try again.' };
    }

    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'createReply' });
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function toggleLike(postId: string): Promise<CommunityActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Please sign in again to continue.' };
    }

    const { data: existing } = await supabase
      .from('community_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('community_likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('community_likes').insert({ post_id: postId, user_id: user.id });
    }

    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    logServerError(error, { action: 'toggleLike' });
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
