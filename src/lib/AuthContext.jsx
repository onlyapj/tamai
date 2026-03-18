import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();
const STORAGE_KEY = 'tamai-auth';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Direct fetch helpers that bypass the Supabase JS client
async function supabaseFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${SUPABASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error_description || 'Request failed');
  return data;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildUser = (authSession) => {
    const u = authSession.user;
    return {
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || '',
      theme: 'light',
      currency: 'USD',
      account_type: 'individual',
    };
  };

  const fetchProfile = useCallback(async (authSession) => {
    const token = authSession.access_token;
    const userId = authSession.user.id;

    try {
      // Fetch profile from Supabase REST API directly
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const profiles = await res.json();

      if (Array.isArray(profiles) && profiles.length > 0) {
        setUser({ ...profiles[0], id: userId, email: authSession.user.email });
      } else {
        // Try to create profile
        try {
          const createRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${token}`,
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              id: userId,
              email: authSession.user.email,
              full_name: authSession.user.user_metadata?.full_name || '',
            }),
          });
          const newProfiles = await createRes.json();
          if (Array.isArray(newProfiles) && newProfiles.length > 0) {
            setUser({ ...newProfiles[0], id: userId, email: authSession.user.email });
          } else {
            setUser(buildUser(authSession));
          }
        } catch {
          setUser(buildUser(authSession));
        }
      }
    } catch (err) {
      console.warn('Profile fetch failed, using minimal user:', err.message);
      setUser(buildUser(authSession));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check localStorage for existing session
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const authSession = JSON.parse(stored);
        if (authSession.access_token && authSession.user) {
          setSession(authSession);
          fetchProfile(authSession);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored session:', e);
    }
    setLoading(false);
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    const data = await supabaseFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
    await fetchProfile(data);
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const data = await supabaseFetch('/auth/v1/signup', {
      method: 'POST',
      body: { email, password, data: { full_name: fullName } },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
    await fetchProfile(data);
    return data;
  };

  const updateProfile = async (updates) => {
    if (!user || !session) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updates),
        }
      );
      const profiles = await res.json();
      if (Array.isArray(profiles) && profiles.length > 0) {
        setUser((prev) => ({ ...prev, ...profiles[0] }));
      }
      return { data: profiles[0], error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
