-- Migration 05: Triggers
-- Database triggers for automation
-- Date: 2026-01-24

-- ============================================
-- 1. TRIGGER: Auto-create profile on user signup
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
