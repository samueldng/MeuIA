import type { AgentSlug } from '@/constants/Agents';
import { ChatAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { ChatMessage, AiResponse } from '@/types';
import { create } from 'zustand';

interface ChatState {
    messages: ChatMessage[];
    activeAgent: AgentSlug;
    isTyping: boolean;

    addMessage: (message: ChatMessage) => void;
    setActiveAgent: (agent: AgentSlug) => void;
    sendTextMessage: (text: string, userId: string, aiName: string, userName: string) => Promise<void>;
    sendVoiceMessage: (audioBase64: string, userId: string, aiName: string, userName: string) => Promise<void>;
    loadHistory: (userId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    activeAgent: 'general',
    isTyping: false,

    addMessage: (message) =>
        set((state) => ({ messages: [message, ...state.messages] })),

    setActiveAgent: (activeAgent) => set({ activeAgent }),

    sendTextMessage: async (text, userId, aiName, userName) => {
        const userMessage: ChatMessage = {
            _id: Date.now().toString(),
            text,
            createdAt: new Date(),
            user: { _id: userId },
        };
        get().addMessage(userMessage);
        set({ isTyping: true });

        try {
            const response = await ChatAPI.sendMessage(text, aiName);
            const data = response.data as AiResponse;

            const aiMessage: ChatMessage = {
                _id: (Date.now() + 1).toString(),
                text: data.data.resposta,
                createdAt: new Date(),
                user: { _id: 'ai', name: aiName, avatar: '🤖' },
                agent: data.data.agent as AgentSlug,
            };

            get().addMessage(aiMessage);
            set({ activeAgent: data.data.agent as AgentSlug });
        } catch (error: any) {
            console.error('[sendTextMessage] error:', error);
            const errorMessage: ChatMessage = {
                _id: (Date.now() + 1).toString(),
                text: error.message || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
                createdAt: new Date(),
                user: { _id: 'ai', name: aiName },
            };
            get().addMessage(errorMessage);
        } finally {
            set({ isTyping: false });
        }
    },

    sendVoiceMessage: async (audioBase64, userId, aiName, userName) => {
        // NotImplementedYet on backend
        console.warn('Voice message not migrated yet');
    },

    loadHistory: async (userId) => {
        const { data } = await supabase
            .from('interactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) {
            const messages: ChatMessage[] = data.map((interaction) => ({
                _id: interaction.id,
                text: interaction.message,
                createdAt: new Date(interaction.created_at),
                user: {
                    _id: interaction.role === 'user' ? userId : 'ai',
                },
                agent: interaction.agent,
            }));
            set({ messages });
        }
    },
}));
