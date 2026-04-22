import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { QueueService } from '../../queue/queue.service';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly queue: QueueService,
  ) {}

  @Public()
  @Get()
  async check() {
    const checks: Record<string, string> = {};

    // PostgreSQL
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = 'ok';
    } catch {
      checks.postgres = 'error';
    }

    // Redis
    try {
      await this.redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    // BullMQ queues
    try {
      const queueHealth = await this.queue.getQueueHealth();
      checks.bullmq = `ok (waiting: ${queueHealth.waiting}, active: ${queueHealth.active}, dlq: ${queueHealth.dlqSize})`;
    } catch {
      checks.bullmq = 'error';
    }

    const allHealthy = Object.values(checks).every((v) => v.startsWith('ok'));

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      services: checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
