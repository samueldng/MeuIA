import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create a conversation for the user.
   * For now, uses a single "default" conversation per user.
   * Will evolve to support multiple conversations in Fase 2.
   */
  async getOrCreateConversation(userId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { userId, title: 'Conversa Principal' },
    });
  }

  async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system' | 'tool',
    content: string,
    agentSlug?: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        agentSlug,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });
  }

  async getHistory(userId: string, limit = 50) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!conversation) return [];

    return this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Build chat history context for LLM (last N messages)
   */
  async buildLLMContext(
    conversationId: string,
    limit = 20,
  ): Promise<Array<{ role: string; content: string }>> {
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        role: { in: ['user', 'assistant'] },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { role: true, content: true },
    });

    return messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
  }
}
