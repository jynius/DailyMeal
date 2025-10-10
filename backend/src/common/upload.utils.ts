import * as path from 'path';
import * as fs from 'fs';
import { createHash } from 'crypto';

/**
 * 업로드 파일 경로 생성 유틸리티
 * 파일을 날짜별/해시별로 분산 저장하여 파일 시스템 성능 최적화
 */

export interface UploadPathOptions {
  uploadDir: string; // 기본 업로드 디렉토리 (예: /data/upload)
  category: 'meals' | 'profiles'; // 파일 카테고리
  userId?: string; // 사용자 ID (선택)
  useDate?: boolean; // 날짜별 폴더 사용 여부 (기본: true)
  useUserHash?: boolean; // 사용자 해시 폴더 사용 여부 (기본: false)
}

/**
 * 사용자 ID를 해시하여 첫 2자리 반환 (00-ff)
 * 256개 폴더로 균등 분산
 */
function getUserHashPrefix(userId: string): string {
  const hash = createHash('md5').update(userId).digest('hex');
  return hash.substring(0, 2);
}

/**
 * 날짜 기반 경로 생성 (YYYY/MM/DD)
 */
function getDatePath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 업로드 파일 경로 생성
 * 
 * 예시:
 * - 식사 사진: /data/upload/meals/2025/10/11/abc123.jpg
 * - 프로필 사진: /data/upload/profiles/3a/user-123-timestamp.jpg
 * 
 * @returns { dirPath: 실제 저장 경로, urlPath: DB 저장 URL }
 */
export function createUploadPath(
  filename: string,
  options: UploadPathOptions,
): { dirPath: string; urlPath: string } {
  const {
    uploadDir,
    category,
    userId,
    useDate = true,
    useUserHash = false,
  } = options;

  const pathSegments: string[] = [category];

  // 날짜별 분산 (식사 사진에 주로 사용)
  if (useDate) {
    pathSegments.push(getDatePath());
  }

  // 사용자 해시 분산 (프로필 사진에 주로 사용)
  if (useUserHash && userId) {
    pathSegments.push(getUserHashPrefix(userId));
  }

  const subPath = path.join(...pathSegments);

  // 실제 파일 시스템 경로
  const dirPath = path.join(uploadDir, subPath);

  // URL 경로 (DB 저장용)
  const urlPath = `/uploads/${subPath}/${filename}`.replace(/\\/g, '/');

  return { dirPath, urlPath };
}

/**
 * 디렉토리가 없으면 생성
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 오래된 파일 정리 (선택적 기능)
 * 지정된 일수보다 오래된 파일 삭제
 */
export function cleanupOldFiles(
  dirPath: string,
  daysToKeep: number = 90,
): number {
  let deletedCount = 0;
  const now = Date.now();
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
        // 빈 디렉토리 삭제
        try {
          fs.rmdirSync(fullPath);
        } catch {
          // 비어있지 않으면 무시
        }
      } else {
        const stats = fs.statSync(fullPath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(fullPath);
          deletedCount++;
        }
      }
    }
  }

  scanDirectory(dirPath);
  return deletedCount;
}

/**
 * 파일 크기 제한 검증
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number = 5 * 1024 * 1024, // 5MB
): boolean {
  return fileSize <= maxSize;
}

/**
 * 이미지 파일 타입 검증
 */
export function validateImageType(mimetype: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  return allowedTypes.includes(mimetype);
}
