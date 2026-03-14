-- Peer Support Community

CREATE TYPE post_status AS ENUM ('active', 'hidden', 'removed');
CREATE TYPE post_category AS ENUM ('general', 'diabetes', 'heart_health', 'weight_management', 'mental_health', 'medications', 'exercise', 'nutrition', 'success_story', 'question');

CREATE TABLE community_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   post_category NOT NULL DEFAULT 'general',
  status     post_status NOT NULL DEFAULT 'active',
  is_pinned  BOOLEAN NOT NULL DEFAULT FALSE,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE community_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  status     post_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE community_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_community_likes_count
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER trg_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_community_replies_updated_at
  BEFORE UPDATE ON community_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active posts
CREATE POLICY "community_posts_authenticated_select"
  ON community_posts FOR SELECT
  USING (status = 'active' AND get_user_role() IN ('patient','provider','admin') AND auth.uid() IS NOT NULL);

-- Users can insert their own posts
CREATE POLICY "community_posts_insert"
  ON community_posts FOR INSERT
  WITH CHECK (author_id = auth.uid() AND get_user_role() IN ('patient','provider') AND auth.uid() IS NOT NULL);

-- Users can update/delete their own posts
CREATE POLICY "community_posts_author_update"
  ON community_posts FOR UPDATE
  USING (author_id = auth.uid() AND get_user_role() IN ('patient','provider'));

CREATE POLICY "community_posts_admin_all"
  ON community_posts FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "community_replies_authenticated_select"
  ON community_replies FOR SELECT
  USING (status = 'active' AND get_user_role() IN ('patient','provider','admin') AND auth.uid() IS NOT NULL);

CREATE POLICY "community_replies_insert"
  ON community_replies FOR INSERT
  WITH CHECK (author_id = auth.uid() AND get_user_role() IN ('patient','provider') AND auth.uid() IS NOT NULL);

CREATE POLICY "community_replies_author_update"
  ON community_replies FOR UPDATE
  USING (author_id = auth.uid() AND get_user_role() IN ('patient','provider'));

CREATE POLICY "community_replies_admin_all"
  ON community_replies FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "community_likes_authenticated_select"
  ON community_likes FOR SELECT
  USING (get_user_role() IN ('patient','provider','admin') AND auth.uid() IS NOT NULL);

CREATE POLICY "community_likes_insert"
  ON community_likes FOR INSERT
  WITH CHECK (user_id = auth.uid() AND get_user_role() IN ('patient','provider'));

CREATE POLICY "community_likes_delete"
  ON community_likes FOR DELETE
  USING (user_id = auth.uid() AND get_user_role() IN ('patient','provider'));

CREATE INDEX idx_community_posts_category ON community_posts(category, status, created_at DESC);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_replies_post ON community_replies(post_id, created_at);
CREATE INDEX idx_community_likes_post ON community_likes(post_id);
CREATE INDEX idx_community_likes_user ON community_likes(user_id);
