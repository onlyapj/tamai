-- =============================================================================
-- Supabase SQL Schema
-- Complete database schema with enums, tables, RLS policies, indexes, triggers
-- =============================================================================

-- =============================================================================
-- ENUM TYPES (14)
-- =============================================================================

CREATE TYPE habit_category AS ENUM (
  'health', 'productivity', 'mindfulness', 'fitness', 'learning', 'social', 'other'
);

CREATE TYPE task_status AS ENUM (
  'pending', 'in_progress', 'completed', 'cancelled'
);

CREATE TYPE task_priority AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE goal_status AS ENUM (
  'active', 'completed', 'paused', 'at_risk'
);

CREATE TYPE transaction_type AS ENUM (
  'income', 'expense'
);

CREATE TYPE investment_type AS ENUM (
  'stock', 'etf', 'crypto', 'bond', 'mutual_fund', 'real_estate', 'other'
);

CREATE TYPE team_member_role AS ENUM (
  'owner', 'admin', 'member', 'viewer'
);

CREATE TYPE team_member_status AS ENUM (
  'invited', 'active', 'removed'
);

CREATE TYPE user_role AS ENUM (
  'user', 'admin', 'super_admin'
);

CREATE TYPE feedback_status AS ENUM (
  'new', 'reviewed', 'resolved', 'dismissed'
);

CREATE TYPE notification_type AS ENUM (
  'info', 'success', 'warning', 'error', 'alert'
);

CREATE TYPE recommendation_type AS ENUM (
  'habit', 'mood', 'health', 'productivity', 'social', 'other'
);

CREATE TYPE recommendation_priority AS ENUM (
  'low', 'medium', 'high'
);

CREATE TYPE account_type AS ENUM (
  'individual', 'business'
);

-- =============================================================================
-- UTILITY: update_updated_at() trigger function
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  currency text DEFAULT 'USD',
  account_type account_type DEFAULT 'individual',
  nav_order jsonb,
  notification_preferences jsonb,
  home_section_order jsonb,
  tutorial_completed boolean DEFAULT false,
  google_calendar_settings jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when auth.users row is inserted
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 1. HABITS
-- =============================================================================

CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category habit_category DEFAULT 'other',
  active boolean DEFAULT true,
  target_count integer,
  milestone_count integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_id_active ON habits(user_id, active);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_all_own" ON habits
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 2. HABIT_LOGS
-- =============================================================================

CREATE TABLE habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date date NOT NULL,
  completed boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_habit_logs_habit_id_date ON habit_logs(habit_id, date);
CREATE INDEX idx_habit_logs_user_id_date ON habit_logs(user_id, date);
CREATE UNIQUE INDEX idx_habit_logs_habit_id_date_unique ON habit_logs(habit_id, date);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_logs_all_own" ON habit_logs
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- 3. MOOD_ENTRIES
-- =============================================================================

CREATE TABLE mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  date date NOT NULL,
  activities jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mood_entries_user_id_date ON mood_entries(user_id, date);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mood_entries_all_own" ON mood_entries
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 4. HEALTH_LOGS
-- =============================================================================

CREATE TABLE health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  sleep_hours numeric,
  water_intake numeric,
  exercise_minutes integer,
  steps integer,
  weight numeric,
  notes text,
  energy_level integer,
  stress_level integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_health_logs_user_id_date ON health_logs(user_id, date);

ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_logs_all_own" ON health_logs
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER health_logs_updated_at
  BEFORE UPDATE ON health_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 5. ADHD_PROFILES
-- =============================================================================

CREATE TABLE adhd_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_adhd boolean DEFAULT false,
  adhd_type text,
  is_medicated boolean DEFAULT false,
  medication_name text,
  medication_dosage text,
  typical_focus_window integer DEFAULT 45,
  energy_crash_time time,
  hyperfocus_triggers jsonb DEFAULT '[]',
  distraction_triggers jsonb DEFAULT '[]',
  best_productivity_time text,
  preferred_break_activities jsonb DEFAULT '[]',
  diagnosis_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_adhd_profiles_user_id ON adhd_profiles(user_id);

ALTER TABLE adhd_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adhd_profiles_all_own" ON adhd_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER adhd_profiles_updated_at
  BEFORE UPDATE ON adhd_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 6. ADHD_LOGS
-- =============================================================================

CREATE TABLE adhd_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  focus_level integer,
  medication_taken boolean,
  notes text,
  energy_level integer,
  distractions jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_adhd_logs_user_id_date ON adhd_logs(user_id, date);

ALTER TABLE adhd_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adhd_logs_all_own" ON adhd_logs
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- 7. WELLNESS_RECOMMENDATIONS
-- =============================================================================

CREATE TABLE wellness_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type recommendation_type,
  title text NOT NULL,
  description text,
  reason text,
  priority recommendation_priority DEFAULT 'medium',
  action_items jsonb DEFAULT '[]',
  dismissed boolean DEFAULT false,
  generated_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_wellness_recommendations_user_id_dismissed ON wellness_recommendations(user_id, dismissed);

ALTER TABLE wellness_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wellness_recommendations_all_own" ON wellness_recommendations
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER wellness_recommendations_updated_at
  BEFORE UPDATE ON wellness_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 8. TASKS
-- =============================================================================

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  list_name text DEFAULT 'General',
  google_event_id text,
  google_calendar_id text,
  scheduled_time time,
  duration_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tasks_user_id_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_id_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_google_event_id ON tasks(google_event_id) WHERE google_event_id IS NOT NULL;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_all_own" ON tasks
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 9. TEAMS
-- =============================================================================

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  owner_email text NOT NULL,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_teams_owner_email ON teams(owner_email);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_owner_all" ON teams
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "teams_member_select" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 10. TEAM_MEMBERS
-- =============================================================================

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  role team_member_role DEFAULT 'member',
  status team_member_status DEFAULT 'invited',
  invited_date timestamptz DEFAULT now(),
  joined_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_email ON team_members(user_email);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_creator_all" ON team_members
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "team_members_self_select" ON team_members
  FOR SELECT USING (
    user_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 11. SHARED_PROJECTS
-- =============================================================================

CREATE TABLE shared_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  owner_email text,
  name text,
  description text,
  status text DEFAULT 'planning',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_shared_projects_team_id ON shared_projects(team_id);

ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_projects_owner_all" ON shared_projects
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "shared_projects_team_member_select" ON shared_projects
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

CREATE TRIGGER shared_projects_updated_at
  BEFORE UPDATE ON shared_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 12. GOALS
-- =============================================================================

CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  progress numeric DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status goal_status DEFAULT 'active',
  target_date date,
  category text,
  milestones jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_goals_user_id_status ON goals(user_id, status);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_all_own" ON goals
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 13. TRANSACTIONS
-- =============================================================================

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type transaction_type NOT NULL,
  category text,
  sub_category text,
  description text,
  date date NOT NULL,
  bank_transaction_id text,
  recurring boolean DEFAULT false,
  recurring_pattern text,
  paused boolean DEFAULT false,
  next_occurrence date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_transactions_user_id_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_id_recurring ON transactions(user_id, recurring) WHERE recurring = true;
CREATE INDEX idx_transactions_user_id_category ON transactions(user_id, category);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_all_own" ON transactions
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 14. BUDGETS
-- =============================================================================

CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month text NOT NULL,
  category text NOT NULL,
  monthly_limit numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_budgets_user_id_month ON budgets(user_id, month);
CREATE UNIQUE INDEX idx_budgets_user_id_month_category ON budgets(user_id, month, category);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_all_own" ON budgets
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 15. INVESTMENTS
-- =============================================================================

CREATE TABLE investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker text,
  name text,
  quantity numeric,
  type investment_type DEFAULT 'stock',
  current_price numeric,
  purchase_price numeric,
  purchase_date date,
  cost_basis numeric,
  current_value numeric,
  target_allocation numeric,
  rebalance_threshold numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_investments_user_id ON investments(user_id);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investments_all_own" ON investments
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 16. INVESTMENT_CONTRIBUTIONS
-- =============================================================================

CREATE TABLE investment_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES investments(id) ON DELETE CASCADE,
  amount numeric,
  frequency text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_investment_contributions_user_id ON investment_contributions(user_id);
CREATE INDEX idx_investment_contributions_user_id_active ON investment_contributions(user_id, is_active) WHERE is_active = true;

ALTER TABLE investment_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investment_contributions_all_own" ON investment_contributions
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER investment_contributions_updated_at
  BEFORE UPDATE ON investment_contributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 17. INVESTMENT_TRANSACTIONS
-- =============================================================================

CREATE TABLE investment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES investments(id) ON DELETE CASCADE,
  type text,
  amount numeric,
  quantity numeric,
  price numeric,
  date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX idx_investment_transactions_user_id_date ON investment_transactions(user_id, date);

ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investment_transactions_all_own" ON investment_transactions
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER investment_transactions_updated_at
  BEFORE UPDATE ON investment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 18. APP_USERS
-- =============================================================================

CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_app_users_user_id ON app_users(user_id);
CREATE INDEX idx_app_users_email ON app_users(email);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_users_admin_all" ON app_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users au
      WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "app_users_self_select" ON app_users
  FOR SELECT USING (user_id = auth.uid());

CREATE TRIGGER app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 19. FEEDBACK
-- =============================================================================

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  message text,
  status feedback_status DEFAULT 'new',
  rating text,
  comment text,
  conversation_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_feedback_status ON feedback(status);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_user_insert" ON feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "feedback_user_select" ON feedback
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "feedback_admin_all" ON feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users au
      WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 20. NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  type notification_type DEFAULT 'info',
  category text,
  title text NOT NULL,
  message text,
  action_url text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_email_read ON notifications(recipient_email, read);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_creator_all" ON notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "notifications_recipient_select" ON notifications
  FOR SELECT USING (
    recipient_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- =============================================================================
-- 21. EVENT_TEMPLATES
-- =============================================================================

CREATE TABLE event_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  description text,
  duration_minutes integer DEFAULT 30,
  scheduled_time time,
  priority task_priority DEFAULT 'medium',
  list_name text DEFAULT 'General',
  recurring_pattern text,
  reminder_minutes integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_event_templates_user_id ON event_templates(user_id);

ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_templates_all_own" ON event_templates
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER event_templates_updated_at
  BEFORE UPDATE ON event_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 22. MEETING_SUMMARIES
-- =============================================================================

CREATE TABLE meeting_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  meeting_title text,
  meeting_date date,
  notes text,
  summary text,
  key_decisions jsonb DEFAULT '[]',
  action_items jsonb DEFAULT '[]',
  discussion_points jsonb DEFAULT '[]',
  attendees jsonb DEFAULT '[]',
  sentiment_analysis jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_meeting_summaries_task_id ON meeting_summaries(task_id);
CREATE INDEX idx_meeting_summaries_user_id ON meeting_summaries(user_id);

ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_summaries_all_own" ON meeting_summaries
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER meeting_summaries_updated_at
  BEFORE UPDATE ON meeting_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 23. JOURNAL_ENTRIES
-- =============================================================================

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  title text,
  content text,
  mood text,
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_entries_user_id_date ON journal_entries(user_id, date);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_entries_all_own" ON journal_entries
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- REALTIME: Enable realtime on investments table
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE investments;
