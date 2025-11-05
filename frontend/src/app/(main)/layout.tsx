'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { BottomNavigation } from '@/components/bottom-navigation'
import { RealTimeNotifications } from '@/components/realtime-notifications'

const getHeaderTitle = (pathname: string) => {
  if (pathname === '/') return 'DailyMeal'
  if (pathname.startsWith('/feed')) return '피드'
  if (pathname.startsWith('/restaurant')) return '맛집'
  if (pathname.startsWith('/statistics')) return '통계'
  if (pathname.startsWith('/profile')) return '프로필'
  if (pathname.startsWith('/friends')) return '친구'
  if (pathname.startsWith('/settings')) return '설정'
  return 'DailyMeal'
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const title = getHeaderTitle(pathname)
  const isHomePage = pathname === '/'

  // 메인 네비게이션 경로 (하단 네비게이션에 있는 페이지들)
  const mainNavPaths = ['/', '/feed', '/restaurant', '/friends', '/profile']
  const isMainNavPage = mainNavPaths.some(
    (path) => pathname === path || (path !== '/' && pathname.startsWith(path + '/'))
  )

  // 서브 페이지는 뒤로가기 버튼 표시
  const showBackButton = !mainNavPaths.includes(pathname)

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <Header
        title={title}
        variant={isHomePage ? 'home' : 'default'}
        showBackButton={showBackButton}
      />
      <main className="flex-1 w-full">{children}</main>
      <BottomNavigation />
      <RealTimeNotifications />
    </div>
  )
}
