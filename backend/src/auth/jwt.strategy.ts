import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { AppLoggerService } from '../common/logger.service';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = AppLoggerService.getLogger('JwtStrategy');

  constructor(private authService: AuthService) {
    const jwtSecret = process.env.JWT_SECRET || 'dailymeal-fixed-secret-key';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    this.logger.info(
      `JWT Strategy initialized with secret: ${jwtSecret.substring(0, 10)}...`,
    );
  }

  async validate(payload: JwtPayload) {
    this.logger.debug('Validating JWT payload');
    this.logger.trace(`Payload details: ${JSON.stringify(payload)}`);

    try {
      const user = await this.authService.validateUser(payload.sub);
      this.logger.info(`User ${payload.email} authenticated successfully`);
      return user;
    } catch (error) {
      this.logger.error(
        `JWT validation failed for user ${payload.email}`,
        error as Error,
      );
      throw error;
    }
  }
}
