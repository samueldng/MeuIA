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
    mensagem: string;
    nome_ia: string;
    usuario: string;
}

export async function sendMessage(payload: SendMessagePayload) {
    // Uses the endpoint requested by user:
    // process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL + '/webhook/chat'
    // Depending on what is in .env, usually they define the root
    const response = await api.post('/webhook/chat', payload);
    return response.data;
}

export async function sendAudio(payload: SendMessagePayload) {
    // Temporarily reusing the payload struct if they expect audio base64 as 'mensagem' text
    const response = await api.post('/webhook/chat', payload);
    return response.data;
}

export default api;
