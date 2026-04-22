import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

export interface ChatJobData {
  userId: string;
  conversationId: string;
  message: string;
  agentSlug?: string;
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: Redis;
  private readonly chatQueue: Queue<ChatJobData>;
  private readonly dlq: Queue<ChatJobData>;
  private chatWorker?: Worker<ChatJobData>;

  constructor() {
    this.connection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // Required by BullMQ
    });

    const prefix = process.env.BULL_QUEUE_PREFIX ?? 'meuia';

    // Main chat processing queue
    this.chatQueue = new Queue<ChatJobData>('chat-processing', {
      connection: this.connection,
      prefix,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // 2s → 4s → 8s
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: false, // Keep failed jobs for DLQ inspection
      },
    });

    // Dead Letter Queue for permanently failed jobs
    this.dlq = new Queue<ChatJobData>('chat-dlq', {
      connection: this.connection,
      prefix,
    });

    this.logger.log('✅ BullMQ queues initialized (chat-processing + chat-dlq)');
  }

  async addChatJob(data: ChatJobData): Promise<Job<ChatJobData>> {
    return this.chatQueue.add('process-message', data, {
      priority: data.agentSlug === 'general' ? 2 : 1, // Premium agents get higher priority
    });
  }

  /**
   * Register the worker that processes chat jobs.
   * Called by the AI Engine module once LangGraph is ready.
   */
  registerChatWorker(
    processor: (job: Job<ChatJobData>) => Promise<string>,
  ): void {
    this.chatWorker = new Worker<ChatJobData>(
      'chat-processing',
      async (job) => {
        try {
          const result = await processor(job);
          return result;
        } catch (error) {
          this.logger.error(
            `Job ${job.id} failed (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
            error instanceof Error ? error.message : String(error),
          );

          // If all retries exhausted, move to DLQ
          if (job.attemptsMade + 1 >= (job.opts.attempts ?? 3)) {
            await this.dlq.add('failed-message', job.data, {
              removeOnComplete: false,
            });
            this.logger.warn(
              `Job ${job.id} moved to DLQ after ${job.attemptsMade + 1} attempts`,
            );
          }

          throw error; // Re-throw to trigger BullMQ retry
        }
      },
      {
        connection: this.connection,
        prefix: process.env.BULL_QUEUE_PREFIX ?? 'meuia',
        concurrency: 10,
        limiter: {
          max: 50,
          duration: 60000, // 50 jobs per minute max
        },
      },
    );

    this.chatWorker.on('completed', (job) => {
      this.logger.debug(`Job ${job.id} completed`);
    });

    this.chatWorker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log('✅ Chat worker registered');
  }

  async getQueueHealth(): Promise<{
    waiting: number;
    active: number;
    failed: number;
    dlqSize: number;
  }> {
    const [waiting, active, failed, dlqWaiting] = await Promise.all([
      this.chatQueue.getWaitingCount(),
      this.chatQueue.getActiveCount(),
      this.chatQueue.getFailedCount(),
      this.dlq.getWaitingCount(),
    ]);
    return { waiting, active, failed, dlqSize: dlqWaiting };
  }

  async onModuleDestroy() {
    await this.chatWorker?.close();
    await this.chatQueue.close();
    await this.dlq.close();
    await this.connection.quit();
  }
}
