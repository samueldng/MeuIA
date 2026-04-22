import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.3.206:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Timeout rigoroso para evitar UI travada (15s)
});

// Interceptor de Requisição: Injeta o Bearer Token do Supabase dinamicamente
api.interceptors.request.use(
  async (config) => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    if (error) {
      console.error('[API Setup] Erro ao recuperar sessão do Supabase:', error.message);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: Tratamento centralizado de exceções
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se o token expirar (401), podemos implementar a lógica de refresh aqui no futuro
    if (error.response?.status === 401) {
      console.warn('[API Auth] Token expirado ou inválido. Redirecionando para login...');
      // Lógica do Zustand para deslogar o usuário iria aqui
    }
    
    // Formata o erro para o Zustand consumir de forma limpa
    const customError = new Error(error.response?.data?.message || 'Erro na comunicação com o servidor');
    return Promise.reject(customError);
  }
);

// --- Contratos de API (Endpoints atualizados para o NestJS) ---

export const ChatAPI = {
  sendMessage: (content: string, agentSlug?: string) => 
    api.post('/chat/message', { mensagem: content, nome_ia: agentSlug }),
};

export const FinanceAPI = {
  getEntries: () => api.get('/finance/entries'),
  closeMonth: () => api.post('/finance/close-month'),
};

export const CalendarAPI = {
  getEvents: () => api.get('/calendar/events'),
};

export default api;