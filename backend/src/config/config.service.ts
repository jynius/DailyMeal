import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class ConfigService {
  private readonly secrets: Record<string, string> = {};
  private uploadConfig?: {
    dir: string;
    maxFileSize: number;
    maxFiles: number;
  };

  constructor(private readonly nestConfigService: NestConfigService) {}

  get(key: string): string | undefined {
    // 1. Secrets Manager 값 우선 (프로덕션에서)
    if (this.secrets[key]) {
      return this.secrets[key];
    }
    // 2. 환경 변수 (process.env) 차선
    return this.nestConfigService.get<string>(key);
  }

  /**
   * Secrets Manager 사용 여부 확인
   */
  shouldUseSecretsManager(): boolean {
    return this.get('USE_SECRETS_MANAGER') === 'true';
  }

  /**
   * Secrets Manager 초기화 (필요시 자동으로 로드)
   */
  async initializeSecretsManager(): Promise<void> {
    if (!this.shouldUseSecretsManager()) {
      return;
    }

    const secretName = this.get('SECRETS_MANAGER_SECRET_NAME');
    if (!secretName) {
      console.warn('Secrets Manager: USE_SECRETS_MANAGER is true but SECRETS_MANAGER_SECRET_NAME is not defined');
      return;
    }

    await this.loadFromSecretsManager(secretName);
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

  /**
   * Upload 설정 가져오기 (검증 및 파싱 완료된 값)
   */
  getUploadConfig(): { dir: string; maxFileSize: number; maxFiles: number } {
    if (!this.uploadConfig) {
      const UPLOAD_DIR = this.get('UPLOAD_DIR');
      const UPLOAD_MAX_FILE_SIZE_STR = this.get('UPLOAD_MAX_FILE_SIZE');
      const UPLOAD_MAX_FILES_STR = this.get('UPLOAD_MAX_FILES');

      // 필수 환경 변수 검증
      if (!UPLOAD_DIR || !UPLOAD_MAX_FILE_SIZE_STR || !UPLOAD_MAX_FILES_STR) {
        throw new Error(
          'Upload configuration (UPLOAD_DIR, UPLOAD_MAX_FILE_SIZE, UPLOAD_MAX_FILES) is missing.'
        );
      }

      const maxFileSize = parseInt(UPLOAD_MAX_FILE_SIZE_STR, 10);
      const maxFiles = parseInt(UPLOAD_MAX_FILES_STR, 10);

      if (isNaN(maxFileSize) || isNaN(maxFiles)) {
        throw new Error('Upload configuration values must be valid numbers.');
      }

      // 캐싱 (한 번만 검증)
      this.uploadConfig = {
        dir: UPLOAD_DIR,
        maxFileSize,
        maxFiles,
      };
    }

    return this.uploadConfig;
  }

  /**
   * 이미지 URL 변환 (환경에 따라 절대/상대 경로)
   * - 개발: 절대 URL (http://localhost:8000/uploads/...)
   * - 프로덕션: 상대 경로 (/api/uploads/...) - Nginx가 프록시
   * 
   * @param photo 이미지 경로 (null 허용)
   * @returns 변환된 URL 또는 null
   */
  transformImageUrl(photo: string | null): string | null {
    if (!photo) return null;

    // 이미 절대 URL인 경우
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }

    // API_BASE_URL이 설정된 경우: 절대 URL 반환
    const baseUrl = this.get('API_BASE_URL');
    if (baseUrl) {
      return `${baseUrl}${photo}`;
    }

    // API_BASE_URL이 없는 경우: 상대 경로 반환
    // /uploads/... -> /api/uploads/...
    return photo.startsWith('/uploads') ? `/api${photo}` : photo;
  }

  /**
   * Frontend URL 가져오기 (공유 링크 생성 시 사용)
   */
  getFrontendUrl(): string {
    const frontendUrl = this.get('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is required');
    }
    return frontendUrl;
  }

  /**
   * CORS Origins 가져오기 (환경 변수에서)
   */
  getCorsOrigins(): string[] {
    const corsOrigins = this.get('CORS_ORIGINS');
    if (!corsOrigins) {
      // 기본값: localhost만 허용
      return ['http://localhost:3000'];
    }
    // 쉼표로 구분된 문자열을 배열로 변환
    return corsOrigins.split(',').map(origin => origin.trim());
  }

  /**
   * 필수 환경 변수 검증 (앱 시작 시 호출)
   */
  validateRequiredConfig(): void {
    const required = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
    const missing = required.filter(key => !this.get(key));
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
