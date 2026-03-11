import type { AgentSlug } from '@/constants/Agents';
import { sendAudio, sendMessage } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { ChatMessage, N8NResponse } from '@/types';
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
            const response: N8NResponse = await sendMessage({
                mensagem: text,
                nome_ia: aiName,
                usuario: userId,
            });

            const aiMessage: ChatMessage = {
                _id: (Date.now() + 1).toString(),
                text: response.resposta,
                createdAt: new Date(),
                user: { _id: 'ai', name: aiName, avatar: '🤖' },
                agent: 'general',
            };

            get().addMessage(aiMessage);
            set({ activeAgent: 'general' });
        } catch (error) {
            const errorMessage: ChatMessage = {
                _id: (Date.now() + 1).toString(),
                text: 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
                createdAt: new Date(),
                user: { _id: 'ai', name: aiName },
            };
            get().addMessage(errorMessage);
        } finally {
            set({ isTyping: false });
        }
    },

    sendVoiceMessage: async (audioBase64, userId, aiName, userName) => {
        set({ isTyping: true });

        try {
            const response: N8NResponse = await sendAudio({
                mensagem: audioBase64,
                nome_ia: aiName,
                usuario: userId,
            });

            const aiMessage: ChatMessage = {
                _id: Date.now().toString(),
                text: response.resposta,
                createdAt: new Date(),
                user: { _id: 'ai', name: aiName },
                agent: 'general',
            };

            get().addMessage(aiMessage);
            set({ activeAgent: 'general' });
        } catch (error) {
            const errorMessage: ChatMessage = {
                _id: Date.now().toString(),
                text: 'Não consegui processar o áudio. Tente novamente.',
                createdAt: new Date(),
                user: { _id: 'ai', name: aiName },
            };
            get().addMessage(errorMessage);
        } finally {
            set({ isTyping: false });
        }
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
