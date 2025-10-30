import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class ConfigService {
  private readonly secrets: Record<string, string> = {};

  constructor(private readonly nestConfigService: NestConfigService) {}

  get(key: string): string | undefined {
    // 1. Secrets Manager 값 우선 (프로덕션에서)
    if (this.secrets[key]) {
      return this.secrets[key];
    }
    // 2. 환경 변수 (process.env) 차선
    return this.nestConfigService.get<string>(key);
  }

  async loadFromSecretsManager(secretName: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Secrets Manager: Skipping in non-production environment.');
      return;
    }

    const region = process.env.AWS_REGION || 'ap-northeast-2';
    const client = new SecretsManagerClient({ region });

    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const data = await client.send(command);

      if (data.SecretString) {
        const secretValues = JSON.parse(data.SecretString);
        for (const key in secretValues) {
          this.secrets[key] = secretValues[key];
        }
        console.log(`Secrets Manager: Successfully loaded secrets from ${secretName}`);
      }
    } catch (error) {
      console.error('Secrets Manager: Error retrieving secrets:', error);
      // 프로덕션 환경에서 시크릿 로드 실패 시 프로세스를 종료하여 불안정한 상태 방지
      process.exit(1);
    }
  }
}
