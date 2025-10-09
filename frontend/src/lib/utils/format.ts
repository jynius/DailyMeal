// 숫자 포맷팅 유틸리티

/**
 * 숫자를 한국 원화 형식으로 포맷팅
 * @param value - 포맷팅할 숫자
 * @returns 1,000 형식의 문자열
 */
export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return num.toLocaleString('ko-KR')
}

/**
 * 포맷팅된 가격 문자열을 숫자로 변환
 * @param value - 포맷팅된 문자열 (예: "1,000")
 * @returns 숫자
 */
export function parsePrice(value: string): number {
  const num = parseFloat(value.replace(/,/g, ''))
  return isNaN(num) ? 0 : num
}
