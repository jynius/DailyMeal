import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요 없는 공개 경로
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/share',  // /share로 시작하는 모든 경로
]

// 정적 파일 및 API 경로
const ignorePaths = [
  '/_next',
  '/api',
  '/favicon',        // 모든 favicon 파일
  '/manifest.json',
  '/sw.js',
  '/workbox',
  '/icon-',          // 모든 아이콘 파일
  '/.well-known',    // PWA 관련
]

// 정적 리소스 확장자
const staticExtensions = ['.png', '.svg', '.jpg', '.jpeg', '.webp', '.ico', '.gif']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 정적 파일 확장자 체크
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return NextResponse.next()
  }

  // 정적 파일 및 API는 건너뛰기
  if (ignorePaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 공유 페이지는 인증 불필요
  if (pathname.startsWith('/share/')) {
    return NextResponse.next()
  }

  // 공개 경로는 인증 불필요
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // 토큰 확인
  const token = request.cookies.get('token')?.value

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // 현재 경로를 returnUrl로 전달 (로그인 후 되돌아가기 위해)
    url.searchParams.set('returnUrl', pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
