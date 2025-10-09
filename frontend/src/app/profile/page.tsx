'use client'

import { useState, useRef } from 'react'
import { User, Settings, Calendar, LogOut, Edit2, Camera, Save, X } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'
import { tokenManager } from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

export default function ProfilePage() {
  const router = useRouter()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false)
  
  // 프로필 데이터 (나중에 API에서 가져오기)
  const [profile, setProfile] = useState({
    name: '사용자님',
    email: 'user@example.com',
    bio: '맛집 탐방이 취미입니다 🍽️',
    avatar: null as string | null,
    stats: {
      totalReviews: 24,
      restaurantCount: 12,
      friendCount: 8,
    }
  })

  // 임시 편집 데이터
  const [editData, setEditData] = useState({
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    avatar: profile.avatar,
  })

  const handleLogout = () => {
    tokenManager.remove()
    router.push('/')
  }

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditData(prev => ({ ...prev, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    // TODO: API 호출하여 저장
    setProfile(prev => ({
      ...prev,
      name: editData.name,
      email: editData.email,
      bio: editData.bio,
      avatar: editData.avatar,
    }))
    setIsEditing(false)
    toast.success('프로필이 업데이트되었습니다', '저장 완료')
  }

  const handleCancel = () => {
    setEditData({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      avatar: profile.avatar,
    })
    setIsEditing(false)
  }

  const startEdit = () => {
    setEditData({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      avatar: profile.avatar,
    })
    setIsEditing(true)
  }
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header - 단순화 */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">프로필</h1>
      </header>

      {/* Profile Info */}
      <div className="bg-white p-6 border-b">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        
        <div className="flex items-start space-x-4">
          <div 
            onClick={handleImageClick}
            className={`relative w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ${
              isEditing ? 'cursor-pointer hover:opacity-80' : ''
            }`}
          >
            {(isEditing ? editData.avatar : profile.avatar) ? (
              <img 
                src={isEditing ? editData.avatar! : profile.avatar!}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User size={40} className="text-blue-500" />
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xl font-bold text-gray-900 w-full border-b border-gray-300 focus:border-blue-500 outline-none mb-2"
                  placeholder="이름"
                />
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="text-gray-600 text-sm w-full border-b border-gray-300 focus:border-blue-500 outline-none mb-2"
                  placeholder="이메일"
                />
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  className="text-gray-500 text-sm w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none resize-none"
                  placeholder="소개를 입력하세요"
                  rows={2}
                />
                
                {/* 편집 모드 버튼 */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <button
                    onClick={startEdit}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="프로필 편집"
                  >
                    <Edit2 size={18} className="text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-1">{profile.email}</p>
                <p className="text-gray-500 text-sm">{profile.bio}</p>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.stats.totalReviews}</div>
            <div className="text-sm text-gray-600">총 평가</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.stats.restaurantCount}</div>
            <div className="text-sm text-gray-600">맛집 수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.stats.friendCount}</div>
            <div className="text-sm text-gray-600">친구</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-1">
        {[
          { icon: Settings, label: '설정', href: '/settings', desc: '프라이버시, 알림, 장소 관리' },
          { icon: Calendar, label: '월간 통계', href: '/statistics', desc: '평가 분석 및 방문 기록' },
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <item.icon size={20} className="text-gray-600 mr-3" />
              <div className="text-left">
                <div className="text-gray-900 font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 pt-4">
        <button 
          onClick={handleLogout}
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