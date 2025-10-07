import Link from 'next/link'
import { Home, Plus, User, Search, MapPin } from 'lucide-react'

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 max-w-md mx-auto">
      <div className="flex justify-around">
        <Link 
          href="/" 
          className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-blue-500"
        >
          <Home size={20} />
          <span className="text-xs mt-1">홈</span>
        </Link>
        
        <Link 
          href="/search" 
          className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-blue-500"
        >
          <Search size={20} />
          <span className="text-xs mt-1">검색</span>
        </Link>
        
        <Link 
          href="/restaurants" 
          className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-blue-500"
        >
          <MapPin size={20} />
          <span className="text-xs mt-1">맛집</span>
        </Link>

        <Link 
          href="/add" 
          className="flex flex-col items-center py-2 px-3 text-blue-500"
        >
          <div className="bg-blue-500 p-2 rounded-full text-white mb-1">
            <Plus size={20} />
          </div>
          <span className="text-xs">기록</span>
        </Link>
        
        <Link 
          href="/profile" 
          className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-blue-500"
        >
          <User size={20} />
          <span className="text-xs mt-1">프로필</span>
        </Link>
      </div>
    </nav>
  )
}