/**
 * Express Request 타입 확장
 * Passport JWT에서 주입하는 user 객체 타입 정의
 */

import { User } from '../entities/user.entity'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export {}
