/**
 * Database 쿼리 결과 타입 정의
 */

/**
 * 위치별 방문 횟수 조회 결과
 * locations.service.ts - getLocationVisitStats()
 */
export interface LocationVisitStats {
  ul_userId: string
  user_name: string
  visitCount: number
}

/**
 * Raw 쿼리 결과의 기본 타입
 */
export interface RawQueryResult {
  [key: string]: unknown
}
