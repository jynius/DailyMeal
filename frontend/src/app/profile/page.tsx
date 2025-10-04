import { User, Settings, Heart, Star, Calendar, LogOut } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function ProfilePage() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">프로필</h1>
      </header>

      {/* Profile Info */}
      <div className="bg-white p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">사용자님</h2>
            <p className="text-gray-600">user@example.com</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">총 기록</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4.2</div>
            <div className="text-sm text-gray-600">평균 별점</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">방문 장소</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-1">
        {[
          { icon: Settings, label: '설정', href: '/settings' },
          { icon: Heart, label: '즐겨찾기', href: '/favorites' },
          { icon: Star, label: '리뷰 관리', href: '/reviews' },
          { icon: Calendar, label: '월간 통계', href: '/statistics' },
        ].map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center justify-between bg-white p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <item.icon size={20} className="text-gray-600 mr-3" />
              <span className="text-gray-900">{item.label}</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 pt-4">
        <button 
          onClick={() => {
            const { tokenManager } = require('@/lib/api/client')
            tokenManager.remove()
            window.location.href = '/'
          }}
          className="w-full flex items-center justify-center bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} className="mr-2" />
          로그아웃
        </button>
      </div>

      <BottomNavigation />
    </div>
  )
}