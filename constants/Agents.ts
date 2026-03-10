export const Agents = {
    financial: {
        slug: 'financial',
        name: 'Financier',
        icon: '💰',
        color: '#4ADE80',
        keywords: ['gasto', 'gastei', 'receita', 'salário', 'paguei', 'comprei', 'financeiro', 'dinheiro', 'conta', 'boleto'],
    },
    calendar: {
        slug: 'calendar',
        name: 'Secretary',
        icon: '📅',
        color: '#3366FF',
        keywords: ['agenda', 'reunião', 'compromisso', 'agende', 'marque', 'evento', 'horário', 'amanhã'],
    },
    email: {
        slug: 'email',
        name: 'Postman',
        icon: '✉️',
        color: '#FFB833',
        keywords: ['email', 'e-mail', 'mensagem', 'inbox', 'envie', 'responda', 'rascunho'],
    },
    general: {
        slug: 'general',
        name: 'General',
        icon: '🤖',
        color: '#8888A0',
        keywords: [],
    },
} as const;

export type AgentSlug = keyof typeof Agents;
export type AgentInfo = typeof Agents[AgentSlug];
