import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AdminAuthState {
  admin: any | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role === 'admin') {
        set({ admin: session.user, session, isAuthenticated: true });
      } else {
        await supabase.auth.signOut();
      }
    }
    set({ isLoading: false });

    supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile?.role === 'admin') {
          set({ admin: session.user, session, isAuthenticated: true });
        } else {
          await supabase.auth.signOut();
          set({ admin: null, isAuthenticated: false });
        }
      } else {
        set({ admin: null, session: null, isAuthenticated: false });
      }
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin accounts only.');
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  },
}));
