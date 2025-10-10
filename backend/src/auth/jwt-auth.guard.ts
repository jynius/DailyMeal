import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppLoggerService } from '../common/logger.service';
import { Request } from 'express';

interface AuthError extends Error {
  message: string;
}

interface AuthInfo {
  message?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = AppLoggerService.getLogger('JwtAuthGuard');

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    this.logger.debug(
      `Authentication attempt for ${request.method} ${request.url}`,
    );
    this.logger.trace(
      `Authorization header: ${request.headers.authorization ? 'present' : 'missing'}`,
    );

    return super.canActivate(context);
  }

  handleRequest<TUser = JwtPayload>(
    err: AuthError | null,
    user: TUser | false,
    info: AuthInfo,
  ): TUser {
    if (err || !user) {
      this.logger.warn(
        `Authentication failed: ${err?.message || info?.message || 'Unknown error'}`,
      );
      throw err || new UnauthorizedException('Unauthorized');
    }

    const jwtUser = user as unknown as JwtPayload;
    this.logger.debug(`User ${jwtUser.email} authenticated for request`);
    return user;
  }
}
