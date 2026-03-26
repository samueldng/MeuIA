import type { Lancamento } from '@/types';
import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL ?? '';
const N8N_ENV = process.env.EXPO_PUBLIC_N8N_ENV ?? 'production';
const WEBHOOK_PATH = N8N_ENV === 'test' ? '/webhook-test' : '/webhook';

const api = axios.create({
    baseURL: N8N_WEBHOOK_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Timeout: o servidor demorou para responder.'));
        }
        if (!error.response) {
            return Promise.reject(new Error('Sem conexão com o servidor.'));
        }
        return Promise.reject(error);
    }
);

interface SendMessagePayload {
    mensagem: string;
    nome_ia: string;
    usuario: string;
}

export async function sendMessage(payload: SendMessagePayload) {
    // Uses the endpoint depending on N8N_ENV configuration
    const response = await api.post(`${WEBHOOK_PATH}/chat`, payload);
    return response.data;
}

export async function sendAudio(payload: SendMessagePayload) {
    // Temporarily reusing the payload struct if they expect audio base64 as 'mensagem' text
    const response = await api.post(`${WEBHOOK_PATH}/chat`, payload);
    return response.data;
}

export async function fetchLancamentos(userId: string): Promise<Lancamento[]> {
    const response = await api.get(`${WEBHOOK_PATH}/lancamentos`, {
        params: { usuario: userId },
    });
    const raw = response.data;

    // Debug: log what n8n actually returns
    console.log('[fetchLancamentos] raw response:', JSON.stringify(raw).slice(0, 500));

    // n8n can return: an array, a single object, or wrapped in a key
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
        // Check common wrapper keys
        const inner = raw.data ?? raw.items ?? raw.rows ?? raw.results;
        if (Array.isArray(inner)) return inner;
        // Single object with expected fields → wrap in array
        if ('valor' in raw && 'tipo' in raw) return [raw];
    }
    return [];
}

export default api;
