import { Module, forwardRef } from '@nestjs/common';
import { AiEngineService } from './ai-engine.service';
import { FinanceModule } from '../finance/finance.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    forwardRef(() => FinanceModule),
    forwardRef(() => CalendarModule),
  ],
  providers: [AiEngineService],
  exports: [AiEngineService],
})
export class AiEngineModule {}
