-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 008_reviews_ratings_and_qa_system.sql
-- Description: Complete Product Reviews, Ratings Distribution, Helpful Voting,
--              Moderation Flags, Staff Responses, and Product Q&A System.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Extend Reviews Table with Moderation, Voting, and Variants
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS helpful_votes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unhelpful_votes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_reply TEXT,
  ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_replied_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Review Helpful / Unhelpful Votes Table
CREATE TABLE IF NOT EXISTS review_votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  TEXT, -- For guests or anonymous voters
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_review_user_vote UNIQUE (review_id, user_id),
  CONSTRAINT uq_review_session_vote UNIQUE (review_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);

-- 3. Review Moderation Reports Table
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

-- 4. Product Questions & Answers (Q&A)
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

-- 5. Automatic Rating Aggregates Function & Trigger on Products Table
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

-- 6. Row Level Security (RLS) Policies for Reviews & Q&A
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_answers ENABLE ROW LEVEL SECURITY;

-- Review Votes Policies
CREATE POLICY "Public read review votes" ON review_votes FOR SELECT USING (TRUE);
CREATE POLICY "Users and guests create review votes" ON review_votes FOR INSERT WITH CHECK (TRUE);

-- Review Reports Policies
CREATE POLICY "Users and guests submit review reports" ON review_reports FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins view and manage review reports" ON review_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'support_agent'))
);

-- Questions & Answers Policies
CREATE POLICY "Public read approved questions" ON product_questions FOR SELECT USING (status = 'approved');
CREATE POLICY "Public create questions" ON product_questions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage all questions" ON product_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'support_agent'))
);

CREATE POLICY "Public read approved answers" ON product_answers FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins manage all answers" ON product_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'support_agent'))
);
