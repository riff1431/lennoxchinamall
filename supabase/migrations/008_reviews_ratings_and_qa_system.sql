-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 008_reviews_ratings_and_qa_system.sql
-- Description: Complete Product Reviews, Ratings Distribution, Helpful Voting,
--              Moderation Flags, Activity Logs, Staff Responses, and Product Q&A System.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Extend Reviews Table with Moderation, Voting, and Variants
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS helpful_votes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unhelpful_votes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_reply TEXT,
  ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_replied_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_variant ON reviews(variant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured) WHERE is_featured = TRUE;

-- 2. Review Media Table
CREATE TABLE IF NOT EXISTS review_media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_media_review ON review_media(review_id);

-- 3. Review Helpful / Unhelpful Votes Table
CREATE TABLE IF NOT EXISTS review_votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  TEXT,
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_review_user_vote UNIQUE (review_id, user_id),
  CONSTRAINT uq_review_session_vote UNIQUE (review_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(user_id);

-- 4. Review Moderation Reports Table
CREATE TABLE IF NOT EXISTS review_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);

-- 5. Product Questions & Answers (Q&A)
CREATE TABLE IF NOT EXISTS product_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL DEFAULT 'Verified Customer',
  question      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'hidden', 'rejected')),
  helpful_votes INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_questions_product ON product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_questions_status ON product_questions(status);
CREATE INDEX IF NOT EXISTS idx_product_questions_user ON product_questions(user_id);

CREATE TABLE IF NOT EXISTS product_answers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id       UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  responder_name    TEXT NOT NULL DEFAULT 'Lennox Factory Support',
  is_official_staff BOOLEAN NOT NULL DEFAULT TRUE,
  answer            TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'hidden')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_answers_question ON product_answers(question_id);

-- 6. Question Votes Table
CREATE TABLE IF NOT EXISTS question_votes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_question_user_vote UNIQUE (question_id, user_id),
  CONSTRAINT uq_question_session_vote UNIQUE (question_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_question_votes_question ON question_votes(question_id);

-- 7. Question Reports Table
CREATE TABLE IF NOT EXISTS question_reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason        TEXT NOT NULL,
  details       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_reports_question ON question_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);

-- 8. Review Moderation & Audit Logs Table
CREATE TABLE IF NOT EXISTS review_moderation_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id     UUID REFERENCES reviews(id) ON DELETE CASCADE,
  question_id   UUID REFERENCES product_questions(id) ON DELETE CASCADE,
  admin_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  previous_state JSONB,
  new_state     JSONB,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_moderation_logs_review ON review_moderation_logs(review_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_logs_admin ON review_moderation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_logs_created ON review_moderation_logs(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- DATABASE FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- 9. Automatic Rating Aggregates Function & Trigger on Products Table
CREATE OR REPLACE FUNCTION update_product_rating_aggregates()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
  v_avg_rating NUMERIC(3, 2);
  v_count INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_product_id := OLD.product_id;
  ELSE
    v_product_id := NEW.product_id;
  END IF;

  SELECT
    COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 5.00),
    COUNT(*)
  INTO
    v_avg_rating,
    v_count
  FROM reviews
  WHERE product_id = v_product_id AND status = 'approved';

  UPDATE products
  SET
    avg_rating = v_avg_rating,
    review_count = v_count,
    updated_at = now()
  WHERE id = v_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_product_ratings ON reviews;
CREATE TRIGGER trg_update_product_ratings
AFTER INSERT OR UPDATE OF rating, status OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_aggregates();

-- 10. Automatic Vote Recalculation Trigger for Reviews
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_review_id UUID;
  v_helpful INT;
  v_unhelpful INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_review_id := OLD.review_id;
  ELSE
    v_review_id := NEW.review_id;
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'helpful'),
    COUNT(*) FILTER (WHERE vote_type = 'unhelpful')
  INTO
    v_helpful,
    v_unhelpful
  FROM review_votes
  WHERE review_id = v_review_id;

  UPDATE reviews
  SET
    helpful_votes = v_helpful,
    unhelpful_votes = v_unhelpful,
    updated_at = now()
  WHERE id = v_review_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_review_votes ON review_votes;
CREATE TRIGGER trg_update_review_votes
AFTER INSERT OR UPDATE OF vote_type OR DELETE ON review_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_vote_counts();

-- 11. Automatic Question Vote Recalculation Trigger
CREATE OR REPLACE FUNCTION update_question_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_question_id UUID;
  v_count INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_question_id := OLD.question_id;
  ELSE
    v_question_id := NEW.question_id;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM question_votes
  WHERE question_id = v_question_id;

  UPDATE product_questions
  SET
    helpful_votes = v_count,
    updated_at = now()
  WHERE id = v_question_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_question_votes ON question_votes;
CREATE TRIGGER trg_update_question_votes
AFTER INSERT OR DELETE ON question_votes
FOR EACH ROW
EXECUTE FUNCTION update_question_vote_counts();

-- 12. Helper Function: Check Verified Buyer Status
CREATE OR REPLACE FUNCTION is_verified_buyer(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = p_user_id
      AND oi.product_id = p_product_id
      AND o.status IN ('paid', 'processing', 'sourcing', 'purchased', 'shipped', 'delivered')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_moderation_logs ENABLE ROW LEVEL SECURITY;

-- Review Votes Policies
CREATE POLICY "Public read review votes" ON review_votes FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can create review votes" ON review_votes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users update own review votes" ON review_votes FOR UPDATE USING (
  user_id = (SELECT auth.uid()) OR user_id IS NULL
);
CREATE POLICY "Users delete own review votes" ON review_votes FOR DELETE USING (
  user_id = (SELECT auth.uid()) OR user_id IS NULL
);

-- Review Reports Policies
CREATE POLICY "Public create review reports" ON review_reports FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins view and manage review reports" ON review_reports FOR ALL USING (is_admin());

-- Questions & Answers Policies
CREATE POLICY "Public read approved questions" ON product_questions FOR SELECT USING (status = 'approved');
CREATE POLICY "Public create questions" ON product_questions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users view own questions" ON product_questions FOR SELECT USING (
  user_id = (SELECT auth.uid())
);
CREATE POLICY "Admins manage all questions" ON product_questions FOR ALL USING (is_admin());

CREATE POLICY "Public read approved answers" ON product_answers FOR SELECT USING (status = 'approved');
CREATE POLICY "Staff create answers" ON product_answers FOR INSERT WITH CHECK (is_admin() OR auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage all answers" ON product_answers FOR ALL USING (is_admin());

-- Question Votes Policies
CREATE POLICY "Public read question votes" ON question_votes FOR SELECT USING (TRUE);
CREATE POLICY "Anyone create question votes" ON question_votes FOR INSERT WITH CHECK (TRUE);

-- Question Reports Policies
CREATE POLICY "Public create question reports" ON question_reports FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage question reports" ON question_reports FOR ALL USING (is_admin());

-- Moderation Logs Policies
CREATE POLICY "Admins view and manage moderation logs" ON review_moderation_logs FOR ALL USING (is_admin());
