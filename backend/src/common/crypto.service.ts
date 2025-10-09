import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor() {
    // 환경 변수에서 키 가져오기, 없으면 기본값 사용 (프로덕션에서는 반드시 설정해야 함)
    const secretKey = process.env.ENCRYPTION_KEY || 'dailymeal-secret-key-32-chars!';
    this.key = crypto.scryptSync(secretKey, 'salt', 32);
    this.iv = Buffer.alloc(16, 0); // 초기화 벡터
  }

  /**
   * 데이터 암호화
   */
  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * 데이터 복호화
   */
  decrypt(encryptedText: string): string {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Invalid encrypted data');
    }
  }

  /**
   * 짧은 공유 ID 생성 (URL 친화적)
   */
  generateShareId(): string {
    return crypto.randomBytes(8).toString('base64url'); // 11자 URL-safe 문자열
  }
}
