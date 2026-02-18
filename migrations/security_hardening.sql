-- =============================================================================
-- PaperEdge Security Hardening Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================================

-- ============================================
-- 1. Atomic vote count functions (race condition fix)
-- ============================================

CREATE OR REPLACE FUNCTION increment_vote_count(request_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE feature_requests
  SET vote_count = vote_count + 1,
      updated_at = now()
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_vote_count(request_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE feature_requests
  SET vote_count = GREATEST(0, vote_count - 1),
      updated_at = now()
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Verify RLS is enabled on all tables
-- ============================================

ALTER TABLE IF EXISTS public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.account_daily_pl ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bet_custom_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_request_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS policies for bug_reports
-- ============================================

-- Users can insert their own bug reports
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_insert_own_bug_reports' AND tablename = 'bug_reports') THEN
    CREATE POLICY users_insert_own_bug_reports ON bug_reports
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can view their own bug reports
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_select_own_bug_reports' AND tablename = 'bug_reports') THEN
    CREATE POLICY users_select_own_bug_reports ON bug_reports
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Admins can view all bug reports
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_select_all_bug_reports' AND tablename = 'bug_reports') THEN
    CREATE POLICY admin_select_all_bug_reports ON bug_reports
      FOR SELECT USING (
        (auth.jwt()->'user_metadata'->>'role') = 'admin'
      );
  END IF;
END $$;

-- Only admins can update bug report status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_update_bug_reports' AND tablename = 'bug_reports') THEN
    CREATE POLICY admin_update_bug_reports ON bug_reports
      FOR UPDATE USING (
        (auth.jwt()->'user_metadata'->>'role') = 'admin'
      );
  END IF;
END $$;

-- ============================================
-- 4. RLS policies for feature_requests
-- ============================================

-- Anyone authenticated can view feature requests (public voting board)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_select_feature_requests' AND tablename = 'feature_requests') THEN
    CREATE POLICY authenticated_select_feature_requests ON feature_requests
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Users can insert their own feature requests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_insert_own_feature_requests' AND tablename = 'feature_requests') THEN
    CREATE POLICY users_insert_own_feature_requests ON feature_requests
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Only admins can update feature request status/priority
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_update_feature_requests' AND tablename = 'feature_requests') THEN
    CREATE POLICY admin_update_feature_requests ON feature_requests
      FOR UPDATE USING (
        (auth.jwt()->'user_metadata'->>'role') = 'admin'
      );
  END IF;
END $$;

-- ============================================
-- 5. RLS policies for feature_request_votes
-- ============================================

-- Users can view their own votes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_select_own_votes' AND tablename = 'feature_request_votes') THEN
    CREATE POLICY users_select_own_votes ON feature_request_votes
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can insert their own votes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_insert_own_votes' AND tablename = 'feature_request_votes') THEN
    CREATE POLICY users_insert_own_votes ON feature_request_votes
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can delete their own votes (unvote)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_delete_own_votes' AND tablename = 'feature_request_votes') THEN
    CREATE POLICY users_delete_own_votes ON feature_request_votes
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 6. Unique constraint to prevent double-voting
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_user_feature_vote'
  ) THEN
    ALTER TABLE feature_request_votes
      ADD CONSTRAINT unique_user_feature_vote
      UNIQUE (user_id, feature_request_id);
  END IF;
END $$;

-- ============================================
-- 7. Diagnostic query — run this after the migration
--    to verify all policies are in place
-- ============================================

-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
