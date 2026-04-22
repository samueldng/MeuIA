import { Controller, Post, Body, Get, Query, Logger } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { SendMessageDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly aiEngine: AiEngineService,
  ) {}

  /**
   * POST /api/v1/chat/message
   * Replaces: POST /webhook/chat
   *
   * Response format maintained for backward compatibility:
   * { resposta: string, agent?: string }
   */
  @Post('message')
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    // 1. Get or create conversation
    const conversation = await this.chatService.getOrCreateConversation(userId);

    // 2. Save user message
    await this.chatService.saveMessage(conversation.id, 'user', dto.mensagem);

    // 3. Build LLM context from history
    const history = await this.chatService.buildLLMContext(conversation.id);

    // 4. Process through LangGraph AI engine
    const result = await this.aiEngine.processMessage({
      userId,
      conversationId: conversation.id,
      message: dto.mensagem,
      aiName: dto.nome_ia ?? 'MeuIA',
      history,
    });

    // 5. Save assistant response
    await this.chatService.saveMessage(
      conversation.id,
      'assistant',
      result.resposta,
      result.agent,
    );

    // 6. Return in n8n-compatible format for seamless frontend migration
    return {
      resposta: result.resposta,
      agent: result.agent,
    };
  }

  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getHistory(userId, limit ?? 50);
  }
}
