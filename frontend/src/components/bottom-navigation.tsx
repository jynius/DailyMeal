'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, User, MapPin, Utensils, Users } from 'lucide-react'

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: '홈' },
    { href: '/feed', icon: Utensils, label: '피드' },
    { href: '/search', icon: MapPin, label: '맛집' },
    { href: '/users', icon: Users, label: '친구' },
    { href: '/profile', icon: User, label: '프로필' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* 중앙 플로팅 버튼 */}
      <Link 
        href="/add"
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 touch-target"
        style={{ bottom: `calc(4.5rem + env(safe-area-inset-bottom, 0px))` }}
      >
        <Plus size={20} className="drop-shadow-sm sm:w-6 sm:h-6" />
      </Link>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-2 py-2 shadow-lg z-40 pb-safe-bottom"
           style={{ paddingBottom: `max(0.5rem, env(safe-area-inset-bottom, 0px))` }}>
        <div className="flex justify-around items-center">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href)
            return (
              <Link 
                key={href}
                href={href} 
                className={`flex flex-col items-center py-2 px-2 sm:px-3 transition-all duration-200 touch-target relative ${
                  active 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                <div className={`transition-all duration-200 ${active ? 'transform -translate-y-1' : ''}`}>
                  <Icon 
                    size={18} 
                    className={`${active ? 'drop-shadow-sm' : ''} sm:w-5 sm:h-5`} 
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? 'text-blue-600' : ''} leading-tight`}>
                  {label}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}