import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [forwardRef(() => AiEngineModule)],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
