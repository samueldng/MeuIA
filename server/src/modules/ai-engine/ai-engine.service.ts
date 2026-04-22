import { Injectable, Logger } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { FinanceService } from '../finance/finance.service';
import { CalendarService } from '../calendar/calendar.service';

export interface AiProcessInput {
  userId: string;
  conversationId: string;
  message: string;
  aiName: string;
  history: Array<{ role: string; content: string }>;
}

export interface AiProcessResult {
  resposta: string;
  agent: string;
}

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);
  private readonly llm: ChatGroq;

  constructor(
    private readonly financeService: FinanceService,
    private readonly calendarService: CalendarService,
  ) {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      maxTokens: 1024,
    });
  }

  async processMessage(input: AiProcessInput): Promise<AiProcessResult> {
    // Step 1: Classify intent
    const intent = await this.classifyIntent(input.message);
    this.logger.debug(`Intent classified: ${intent} for message: "${input.message.slice(0, 50)}..."`);

    // Step 2: Route to appropriate worker
    switch (intent) {
      case 'financial':
        return this.financialWorker(input);
      case 'calendar':
        return this.calendarWorker(input);
      default:
        return this.generalWorker(input);
    }
  }

  /**
   * Router Node — classifies user intent into agent categories
   */
  private async classifyIntent(message: string): Promise<string> {
    const response = await this.llm.invoke([
      new SystemMessage(
        `Você é um classificador de intenções. Analise a mensagem do usuário e responda APENAS com uma das categorias:
- "financial" → se menciona dinheiro, gastos, ganhos, salário, contas, boletos, investimentos, extrato, saldo
- "calendar" → se menciona agenda, compromisso, reunião, evento, horário, marcar, agendar
- "general" → para qualquer outro assunto

Responda APENAS a categoria, sem explicação.`,
      ),
      new HumanMessage(message),
    ]);

    const intent = (response.content as string).trim().toLowerCase();

    if (['financial', 'calendar', 'general'].includes(intent)) {
      return intent;
    }
    return 'general';
  }

  /**
   * Financial Worker — handles finance-related queries with tool calling
   */
  private async financialWorker(input: AiProcessInput): Promise<AiProcessResult> {
    // Get financial context for the LLM
    const summary = await this.financeService.getSummary(input.userId);
    const recentEntries = await this.financeService.findAll(input.userId);
    const last10 = recentEntries.slice(0, 10);

    const financialContext = `
CONTEXTO FINANCEIRO DO USUÁRIO:
- Receitas totais: R$${summary.income.toFixed(2)}
- Despesas totais: R$${summary.expense.toFixed(2)}
- Saldo atual: R$${summary.balance.toFixed(2)}
- Total de lançamentos: ${summary.count}

ÚLTIMOS 10 LANÇAMENTOS:
${last10.map((l) => `- ${l.tipo}: R$${Number(l.valor).toFixed(2)} | ${l.categoria} | ${l.descricao ?? '—'}`).join('\n')}
`;

    // Check if user wants to CREATE a new entry
    const actionCheck = await this.detectFinancialAction(input.message);

    if (actionCheck) {
      try {
        await this.financeService.create(input.userId, {
          tipo: actionCheck.tipo,
          valor: actionCheck.valor,
          categoria: actionCheck.categoria,
          descricao: actionCheck.descricao,
        });
        this.logger.log(
          `Created lancamento: ${actionCheck.tipo} R$${actionCheck.valor} - ${actionCheck.categoria}`,
        );
      } catch (err) {
        this.logger.error('Failed to create lancamento', err);
      }
    }

    const messages = [
      new SystemMessage(
        `Você é ${input.aiName}, uma assistente pessoal especialista em finanças. Seja amigável, proativa e encorajadora.

${financialContext}

Diretrizes:
1. Se o usuário mencionar um gasto/ganho, confirme o registro.
2. Sugira categorias quando possível.
3. Dê dicas de economia para gastos altos.
4. Comemore conquistas financeiras.
5. Sempre converta vírgulas para pontos em valores (7,80 → 7.80).
6. Responda em português brasileiro.`,
      ),
      ...input.history.map((h) =>
        h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content),
      ),
      new HumanMessage(input.message),
    ];

    const response = await this.llm.invoke(messages);

    return {
      resposta: response.content as string,
      agent: 'financial',
    };
  }

  /**
   * Detect if user is reporting a financial transaction
   */
  private async detectFinancialAction(
    message: string,
  ): Promise<{ tipo: 'gasto' | 'ganho'; valor: number; categoria: string; descricao?: string } | null> {
    const response = await this.llm.invoke([
      new SystemMessage(
        `Analise a mensagem e determine se o usuário está reportando uma transação financeira.
Se SIM, responda em JSON estrito: {"tipo":"gasto"|"ganho","valor":NUMBER,"categoria":"STRING","descricao":"STRING"}
Se NÃO (é uma pergunta, consulta ou conversa geral), responda: null

IMPORTANTE: valor deve ser número com ponto decimal (não vírgula). Exemplo: 7.80
Responda APENAS o JSON ou null, sem explicação.`,
      ),
      new HumanMessage(message),
    ]);

    const text = (response.content as string).trim();
    if (text === 'null' || text === '') return null;

    try {
      return JSON.parse(text);
    } catch {
      this.logger.warn(`Failed to parse financial action: ${text}`);
      return null;
    }
  }

  /**
   * Calendar Worker — handles scheduling-related queries
   */
  private async calendarWorker(input: AiProcessInput): Promise<AiProcessResult> {
    const events = await this.calendarService.findAll(input.userId);
    
    // Check if user wants to CREATE an event
    const actionCheck = await this.detectCalendarAction(input.message);
    if (actionCheck) {
      try {
        await this.calendarService.create(input.userId, {
          title: actionCheck.title,
          startAt: actionCheck.startAt,
          endAt: actionCheck.endAt,
          allDay: actionCheck.allDay,
        });
        this.logger.log(`Created appointment: ${actionCheck.title}`);
      } catch (err) {
        this.logger.error('Failed to create appointment', err);
      }
    }

    const calendarContext = `
AGENDA DO USUÁRIO:
${events.map(e => `- ${e.title} | Inicio: ${e.startAt.toISOString()} | Fim: ${e.endAt?.toISOString() ?? 'N/A'}`).join('\n')}
`;

    const messages = [
      new SystemMessage(
        `Você é ${input.aiName}, uma assistente de agenda pessoal. Ajude o usuário a organizar compromissos, reuniões e eventos.

${calendarContext}

Diretrizes:
1. Confirme datas e horários antes de agendar.
2. Sugira horários otimizados quando possível.
3. Se você acabou de criar um compromisso, confirme a criação e mostre os detalhes.
4. Responda em português brasileiro.`,
      ),
      ...input.history.map((h) =>
        h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content),
      ),
      new HumanMessage(input.message),
    ];

    const response = await this.llm.invoke(messages);

    return {
      resposta: response.content as string,
      agent: 'calendar',
    };
  }

  /**
   * Detect if user wants to schedule an event
   */
  private async detectCalendarAction(
    message: string,
  ): Promise<{ title: string; startAt: string; endAt?: string; allDay?: boolean } | null> {
    const response = await this.llm.invoke([
      new SystemMessage(
        `Analise a mensagem e determine se o usuário quer agendar/criar um compromisso.
Se SIM, responda em JSON estrito: {"title":"STRING","startAt":"ISO_DATE_STRING","endAt":"ISO_DATE_STRING" (opcional),"allDay":BOOLEAN}
Se NÃO, responda: null

Responda APENAS o JSON ou null, sem explicação.`,
      ),
      new HumanMessage(message),
    ]);

    const text = (response.content as string).trim();
    if (text === 'null' || text === '') return null;

    try {
      return JSON.parse(text);
    } catch {
      this.logger.warn(`Failed to parse calendar action: ${text}`);
      return null;
    }
  }

  /**
   * General Worker — handles general conversation
   */
  private async generalWorker(input: AiProcessInput): Promise<AiProcessResult> {
    const messages = [
      new SystemMessage(
        `Você é ${input.aiName}, uma assistente pessoal inteligente e amigável. Responda de forma útil e em português brasileiro.

Você pode ajudar com:
- Finanças (diga que você gerencia gastos e ganhos)
- Agenda (diga que você ajuda a organizar compromissos)
- Perguntas gerais

Seja concisa mas simpática.`,
      ),
      ...input.history.map((h) =>
        h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content),
      ),
      new HumanMessage(input.message),
    ];

    const response = await this.llm.invoke(messages);

    return {
      resposta: response.content as string,
      agent: 'general',
    };
  }
}
