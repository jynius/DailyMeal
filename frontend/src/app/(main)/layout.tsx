'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { BottomNavigation } from '@/components/bottom-navigation'

const getHeaderTitle = (pathname: string) => {
  if (pathname === '/') return 'DailyMeal'
  if (pathname.startsWith('/feed')) return '피드'
  if (pathname.startsWith('/restaurant')) return '맛집'
  if (pathname.startsWith('/statistics')) return '통계'
  return 'DailyMeal'
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const title = getHeaderTitle(pathname)
  const isHomePage = pathname === '/'

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <Header title={title} variant={isHomePage ? 'home' : 'default'} />
      <main className="flex-1 w-full">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}