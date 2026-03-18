import { supabase } from './supabaseClient';

/**
 * Simple database helpers for CRUD operations.
 * All queries are scoped to the authenticated user via RLS.
 */
export const db = {
  async list(table, { orderBy, ascending = false, limit } = {}) {
    let query = supabase.from(table).select('*');
    if (orderBy) query = query.order(orderBy, { ascending });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async get(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(table, row) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from(table)
      .insert({ ...row, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(table, id, updates) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  async filter(table, filters, { orderBy, ascending = false, limit } = {}) {
    let query = supabase.from(table).select('*');
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    if (orderBy) query = query.order(orderBy, { ascending });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};
