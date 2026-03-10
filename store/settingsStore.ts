import { supabase } from '@/lib/supabase';
import { create } from 'zustand';

interface SettingsState {
    aiName: string;
    voicePreference: string;
    memoryLimit: number;

    setAIName: (name: string) => void;
    setVoicePreference: (voice: string) => void;
    setMemoryLimit: (limit: number) => void;
    syncToSupabase: (userId: string) => Promise<void>;
    loadFromSupabase: (userId: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    aiName: '',
    voicePreference: 'default',
    memoryLimit: 50,

    setAIName: (aiName) => set({ aiName }),
    setVoicePreference: (voicePreference) => set({ voicePreference }),
    setMemoryLimit: (memoryLimit) => set({ memoryLimit }),

    syncToSupabase: async (userId) => {
        const { aiName, voicePreference, memoryLimit } = get();
        await supabase
            .from('profiles')
            .update({
                ai_name: aiName,
                voice_preference: voicePreference,
                memory_limit: memoryLimit,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
    },

    loadFromSupabase: async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('ai_name, voice_preference, memory_limit')
            .eq('user_id', userId)
            .single();

        if (data) {
            set({
                aiName: data.ai_name ?? '',
                voicePreference: data.voice_preference ?? 'default',
                memoryLimit: data.memory_limit ?? 50,
            });
        }
    },
}));
