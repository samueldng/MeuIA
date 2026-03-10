import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL ?? '';

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
    user_id: string;
    message: string;
    context?: Array<{ role: string; message: string }>;
    ai_name?: string;
}

interface SendAudioPayload {
    user_id: string;
    audio_base64: string;
    ai_name?: string;
}

export async function sendMessage(payload: SendMessagePayload) {
    const response = await api.post('/chat', payload);
    return response.data;
}

export async function sendAudio(payload: SendAudioPayload) {
    const response = await api.post('/voice', payload);
    return response.data;
}

export default api;
