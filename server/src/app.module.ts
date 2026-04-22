import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';

// Infrastructure
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';

// Guards
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AiEngineModule } from './modules/ai-engine/ai-engine.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Infrastructure (Global)
    DatabaseModule,
    RedisModule,
    QueueModule,

    // Feature modules
    AuthModule,
    ChatModule,
    FinanceModule,
    CalendarModule,
    AiEngineModule,
    HealthModule,
  ],
  providers: [
    // Global auth guard — all routes require JWT unless @Public()
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
})
export class AppModule {}
