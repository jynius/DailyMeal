import { Search, Clock, MapPin } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function SearchPage() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">검색</h1>
      </header>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="메뉴, 장소, 메모를 검색해보세요"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Recent Searches */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          최근 검색어
        </h3>
        
        <div className="space-y-3">
          {['파스타', '홍대', '김치찌개'].map((term, index) => (
            <div 
              key={index}
              className="flex items-center justify-between bg-white p-3 rounded-lg border"
            >
              <div className="flex items-center">
                <Clock size={16} className="text-gray-400 mr-3" />
                <span className="text-gray-700">{term}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Locations */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          인기 장소
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {['강남역', '홍대', '명동', '이태원'].map((location, index) => (
            <button 
              key={index}
              className="bg-white p-4 rounded-lg border hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center">
                <MapPin size={16} className="text-blue-500 mr-2" />
                <span className="text-gray-700 font-medium">{location}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}