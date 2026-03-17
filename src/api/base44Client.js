import { supabase } from './supabaseClient';
import { entities, asServiceRole } from './entities';

/**
 * Auth compatibility layer.
 * Mimics base44.auth.{me, updateMe, logout, redirectToLogin}
 * by reading/writing the Supabase `profiles` table.
 */
const auth = {
  async me() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.warn('[auth.me] Profile fetch failed:', error.message);
      return null;
    }
    return { ...profile, id: authUser.id, email: authUser.email };
  },

  async updateMe(data) {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw { status: 401, message: 'Not authenticated' };

    const { data: result, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(redirectUrl) {
    if (redirectUrl) {
      localStorage.setItem('postLoginRedirect', redirectUrl);
    }
    window.location.href = '/Login';
  },
};

/**
 * Functions compatibility — routes to Supabase Edge Functions.
 * The actual Edge Functions are Phase 2; the routing is in place.
 */
const functions = {
  async invoke(name, params) {
    const { data, error } = await supabase.functions.invoke(name, { body: params });
    if (error) throw error;
    return { data };
  },
};

/**
 * Stubs for Phase 2 features. These log warnings when called.
 */
const integrations = {
  Core: {
    async InvokeLLM(params) {
      console.warn('[base44 compat] integrations.Core.InvokeLLM is not yet migrated (Phase 2)');
      return { response: '' };
    },
    async SendEmail(params) {
      console.warn('[base44 compat] integrations.Core.SendEmail is not yet migrated (Phase 2)');
    },
    async UploadFile(params) {
      console.warn('[base44 compat] integrations.Core.UploadFile is not yet migrated (Phase 2)');
      return { file_url: '' };
    },
    async ExtractDataFromUploadedFile(params) {
      console.warn('[base44 compat] integrations.Core.ExtractDataFromUploadedFile is not yet migrated (Phase 2)');
      return { data: '' };
    },
  },
};

const agents = {
  async createConversation(params) {
    console.warn('[base44 compat] agents.createConversation is not yet migrated (Phase 2)');
    return { id: null };
  },
  subscribeToConversation(id, callback) {
    console.warn('[base44 compat] agents.subscribeToConversation is not yet migrated (Phase 2)');
    return () => {};
  },
  async addMessage(conversation, message) {
    console.warn('[base44 compat] agents.addMessage is not yet migrated (Phase 2)');
  },
  getWhatsAppConnectURL(name) {
    console.warn('[base44 compat] agents.getWhatsAppConnectURL is not yet migrated (Phase 2)');
    return '#';
  },
};

const connectors = {
  async getAccessToken(name) {
    console.warn('[base44 compat] connectors.getAccessToken is not yet migrated (Phase 2)');
    return null;
  },
};

const appLogs = {
  logUserInApp(page) {
    // No-op — analytics can be added later
  },
};

export const base44 = {
  entities,
  asServiceRole,
  auth,
  functions,
  integrations,
  agents,
  appLogs,
  connectors,
};
