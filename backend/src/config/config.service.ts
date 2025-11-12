import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'

@Injectable()
export class ConfigService {
  private uploadConfig?: {
    dir: string
    maxFileSize: number
    maxFiles: number
  }

  constructor(private readonly nestConfigService: NestConfigService) {}

  get(key: string): string | undefined {
    return this.nestConfigService.get<string>(key)
  }

  /**
   * Upload 설정 가져오기 (검증 및 파싱 완료된 값)
   */
  getUploadConfig(): { dir: string; maxFileSize: number; maxFiles: number } {
    if (!this.uploadConfig) {
      const UPLOAD_DIR = this.get('UPLOAD_DIR')
      const UPLOAD_MAX_FILE_SIZE_STR = this.get('UPLOAD_MAX_FILE_SIZE')
      const UPLOAD_MAX_FILES_STR = this.get('UPLOAD_MAX_FILES')

      // 필수 환경 변수 검증
      if (!UPLOAD_DIR || !UPLOAD_MAX_FILE_SIZE_STR || !UPLOAD_MAX_FILES_STR) {
        throw new Error(
          'Upload configuration (UPLOAD_DIR, UPLOAD_MAX_FILE_SIZE, UPLOAD_MAX_FILES) is missing.'
        )
      }

      const maxFileSize = Number.parseInt(UPLOAD_MAX_FILE_SIZE_STR, 10)
      const maxFiles = Number.parseInt(UPLOAD_MAX_FILES_STR, 10)

      if (Number.isNaN(maxFileSize) || Number.isNaN(maxFiles)) {
        throw new TypeError('Upload configuration values must be valid numbers.')
      }

      // 캐싱 (한 번만 검증)
      this.uploadConfig = {
        dir: UPLOAD_DIR,
        maxFileSize,
        maxFiles,
      }
    }

    return this.uploadConfig
  }

  /**
   * 이미지 URL 변환 (환경에 따라 절대/상대 경로)
   * - 개발: IMAGE_BASE_URL=http://localhost:8000 → http://localhost:8000/uploads/...
   * - 프로덕션: IMAGE_BASE_URL=(빈값) → /uploads/... (Nginx가 서빙)
   *
   * @param photo 이미지 경로 (null 허용)
   * @returns 변환된 URL 또는 null
   */
  transformImageUrl(photo: string | null): string | null {
    if (!photo) return null

    // 이미 절대 URL인 경우
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo
    }

    // IMAGE_BASE_URL이 있으면 붙이고, 없으면 상대 경로 그대로 반환
    const baseUrl = this.get('IMAGE_BASE_URL') || ''
    return `${baseUrl}${photo}`
  }

  /**
   * Frontend URL 가져오기 (내부 통신용)
   */
  getFrontendUrl(): string {
    const frontendUrl = this.get('FRONTEND_URL')
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is required')
    }
    return frontendUrl
  }

  /**
   * CORS Origins 가져오기 (환경 변수에서)
   */
  getCorsOrigins(): string[] {
    const corsOrigins = this.get('CORS_ORIGINS')
    if (!corsOrigins) {
      // 기본값: localhost만 허용
      return ['http://localhost:3000']
    }
    // 쉼표로 구분된 문자열을 배열로 변환
    return corsOrigins.split(',').map((origin) => origin.trim())
  }

  /**
   * 필수 환경 변수 검증 (앱 시작 시 호출)
   */
  validateRequiredConfig(): void {
    const required = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME']
    const missing = required.filter((key) => !this.get(key))

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}
