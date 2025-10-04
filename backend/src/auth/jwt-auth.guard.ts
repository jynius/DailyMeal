import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppLoggerService } from '../common/logger.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = AppLoggerService.getLogger('JwtAuthGuard');

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Authentication attempt for ${request.method} ${request.url}`);
    this.logger.trace(`Authorization header: ${request.headers.authorization ? 'present' : 'missing'}`);
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`Authentication failed: ${err?.message || info?.message || 'Unknown error'}`);
      throw err || new Error('Unauthorized');
    }
    
    this.logger.debug(`User ${user.email} authenticated for request`);
    return user;
  }
}