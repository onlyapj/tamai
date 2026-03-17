import { supabase } from './supabaseClient';

/**
 * Maps Base44 PascalCase entity names to Supabase snake_case table names.
 */
const TABLE_MAP = {
  Habit: 'habits',
  HabitLog: 'habit_logs',
  MoodEntry: 'mood_entries',
  HealthLog: 'health_logs',
  ADHDProfile: 'adhd_profiles',
  ADHDLog: 'adhd_logs',
  WellnessRecommendation: 'wellness_recommendations',
  Task: 'tasks',
  SharedProject: 'shared_projects',
  Goal: 'goals',
  Transaction: 'transactions',
  Budget: 'budgets',
  Investment: 'investments',
  InvestmentContribution: 'investment_contributions',
  InvestmentTransaction: 'investment_transactions',
  Team: 'teams',
  TeamMember: 'team_members',
  User: 'app_users',
  Feedback: 'feedback',
  Notification: 'notifications',
  EventTemplate: 'event_templates',
  MeetingSummary: 'meeting_summaries',
  JournalEntry: 'journal_entries',
};

/**
 * Translates Base44's sort convention ("-date" = descending) to Supabase order() params.
 */
function parseSortField(sortField) {
  if (!sortField) return null;
  const desc = sortField.startsWith('-');
  const column = desc ? sortField.slice(1) : sortField;
  const FIELD_MAP = {
    created_date: 'created_at',
  };
  return { column: FIELD_MAP[column] || column, ascending: !desc };
}

/**
 * Creates an entity proxy that mimics the Base44 entity API surface:
 *   .create(data), .list(sort, limit), .filter(criteria, sort, limit),
 *   .get(id), .update(id, data), .delete(id), .subscribe(callback)
 */
function createEntityProxy(tableName) {
  return {
    async create(data) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Strip out any created_by field (Base44 pattern) — we use user_id instead
      const { created_by, ...rest } = data;
      const { data: result, error } = await supabase
        .from(tableName)
        .insert({ ...rest, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async bulkCreate(items) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const rows = items.map(({ created_by, ...rest }) => ({
        ...rest,
        user_id: user.id,
      }));
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(rows)
        .select();
      if (error) throw error;
      return result;
    },

    async list(sortField, limit) {
      let query = supabase.from(tableName).select('*');
      const sort = parseSortField(sortField);
      if (sort) query = query.order(sort.column, { ascending: sort.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async filter(criteria, sortField, limit) {
      let query = supabase.from(tableName).select('*');
      for (const [key, value] of Object.entries(criteria)) {
        // Map created_by (email) to user_id lookup if needed
        if (key === 'created_by') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            query = query.eq('user_id', user.id);
          }
          continue;
        }
        query = query.eq(key, value);
      }
      const sort = parseSortField(sortField);
      if (sort) query = query.order(sort.column, { ascending: sort.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      // Strip created_by from updates
      const { created_by, ...rest } = updates;
      const { data, error } = await supabase
        .from(tableName)
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`${tableName}_changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => callback(payload)
        )
        .subscribe();
      // Return unsubscribe function (matches Base44 pattern)
      return () => supabase.removeChannel(channel);
    },
  };
}

// Build entities object using Proxy for lazy creation
const entityCache = {};
export const entities = new Proxy(
  {},
  {
    get(_, entityName) {
      if (!entityCache[entityName]) {
        const tableName = TABLE_MAP[entityName];
        if (!tableName) {
          console.warn(`[entities] Unknown entity: ${entityName}`);
          return undefined;
        }
        entityCache[entityName] = createEntityProxy(tableName);
      }
      return entityCache[entityName];
    },
  }
);

// asServiceRole is an alias — RLS replaces the need for service role in Supabase
export const asServiceRole = { entities };
