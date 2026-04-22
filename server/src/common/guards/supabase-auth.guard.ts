import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export interface SupabaseJwtPayload {
  sub: string;        // Supabase user ID
  email: string;
  role: string;       // 'authenticated'
  aud: string;
  iat: number;
  exp: number;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly jwtSecret: string;

  constructor(private readonly reflector: Reflector) {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET environment variable is required');
    }
    this.jwtSecret = secret;
  }

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido');
    }

    const token = authHeader.slice(7);

    try {
      // OFFLINE validation — pure mathematical signature check
      // No HTTP round-trip to Supabase API
      const payload = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
        audience: 'authenticated',
      }) as SupabaseJwtPayload;

      // Attach user to request for downstream use
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Token inválido');
      }
      this.logger.error('JWT verification failed', error);
      throw new UnauthorizedException('Falha na autenticação');
    }
  }
}
