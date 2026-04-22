import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensure user exists in our PostgreSQL database.
   * Called on first authenticated request — syncs Supabase user to local DB.
   */
  async ensureUser(supabaseId: string, email: string) {
    const existing = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: { profile: true },
    });

    if (existing) return existing;

    this.logger.log(`Creating local user for Supabase ID: ${supabaseId}`);

    return this.prisma.user.create({
      data: {
        supabaseId,
        email,
        name: email.split('@')[0],
        profile: {
          create: {
            voicePreference: 'default',
            memoryLimit: 50,
          },
        },
      },
      include: { profile: true },
    });
  }

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
      include: { profile: true, subscription: { include: { plan: true } } },
    });
  }
}
