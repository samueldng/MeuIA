import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';
import { create } from 'zustand';

interface AuthState {
    user: { id: string; email: string } | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isOnboarded: boolean;

    setUser: (user: AuthState['user']) => void;
    setProfile: (profile: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    fetchProfile: () => Promise<void>;
    updateAIName: (name: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isOnboarded: false,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile, isOnboarded: !!profile?.ai_name }),
    setLoading: (isLoading) => set({ isLoading }),

    fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!error && data) {
            set({ profile: data, isOnboarded: !!data.ai_name });
        }
    },

    updateAIName: async (aiName: string) => {
        const { user, profile } = get();
        if (!user) return;

        if (profile) {
            await supabase
                .from('profiles')
                .update({ ai_name: aiName, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
        } else {
            await supabase.from('profiles').insert({
                user_id: user.id,
                name: user.email.split('@')[0],
                ai_name: aiName,
            });
        }

        await get().fetchProfile();
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null, isOnboarded: false });
    },
}));
