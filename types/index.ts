export interface ChatMessage {
    _id: string | number;
    text: string;
    createdAt: Date;
    user: {
        _id: string | number;
        name?: string;
        avatar?: string;
    };
    agent?: string;
    pending?: boolean;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    description: string | null;
    type: 'income' | 'expense';
    date: string;
    created_at: string;
}

export interface Lancamento {
    id?: number;
    usuario: string;
    tipo: 'gasto' | 'ganho';
    valor: number;
    categoria: string;
    descricao: string | null;
    data: string;
}

export interface UserProfile {
    id: string;
    user_id: string;
    name: string;
    ai_name: string | null;
    voice_preference: string;
    memory_limit: number;
    preferences: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface Interaction {
    id: string;
    user_id: string;
    role: 'user' | 'assistant' | 'system';
    message: string;
    agent: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface AiResponse {
    success: boolean;
    data: {
        resposta: string;
        agent: string;
    };
    timestamp: string;
}

export interface AgentRegistryEntry {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon: string;
    keywords: string[];
    n8n_webhook_url: string | null;
    is_active: boolean;
    created_at: string;
}
