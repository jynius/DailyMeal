'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, Search, Bell, BellOff } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  reviewsCount: number      // "평가" 수로 변경
  restaurantCount: number   // "맛집" 수로 통일
  friendsCount: number      // 친구 수 (양방향)
  isFriend: boolean         // 친구 여부 (양방향 관계)
  friendRequestStatus?: 'none' | 'sent' | 'received'  // 친구 요청 상태
  isNotificationEnabled: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<User[]>([])  // 받은 친구 요청
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'friends'>('all')

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // TODO: 실제 API 엔드포인트로 교체
      const sampleUsers: User[] = [
        {
          id: '1',
          username: '푸드러버민지',
          email: 'minji@example.com',
          bio: '맛집 탐방이 취미인 회사원 🍽️',
          reviewsCount: 87,
          restaurantCount: 23,
          friendsCount: 45,
          isFriend: false,
          friendRequestStatus: 'none',
          isNotificationEnabled: false
        },
        {
          id: '2',
          username: '요리하는준호',
          email: 'junho@example.com',
          bio: '집에서 요리하는 것을 좋아합니다 👨‍🍳',
          reviewsCount: 156,
          restaurantCount: 45,
          friendsCount: 89,
          isFriend: true,
          friendRequestStatus: 'none',
          isNotificationEnabled: true
        },
        {
          id: '3',
          username: '건강식수연',
          email: 'suyeon@example.com',
          bio: '건강한 식습관 만들기 💚',
          reviewsCount: 43,
          restaurantCount: 12,
          friendsCount: 34,
          isFriend: false,
          friendRequestStatus: 'sent',
          isNotificationEnabled: false
        }
      ]
      
      // 받은 친구 요청 샘플
      const sampleRequests: User[] = [
        {
          id: '4',
          username: '카페사랑지혜',
          email: 'jihye@example.com',
          bio: '커피 애호가 ☕',
          reviewsCount: 32,
          restaurantCount: 18,
          friendsCount: 23,
          isFriend: false,
          friendRequestStatus: 'received',
          isNotificationEnabled: false
        }
      ]
      
      setFriendRequests(sampleRequests)
      
      let filteredUsers = sampleUsers
      
      if (filter === 'friends') {
        filteredUsers = sampleUsers.filter(u => u.isFriend)
      }
      
      setUsers(filteredUsers)
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFriendAction = async (userId: string, action: 'add' | 'remove' | 'accept' | 'reject') => {
    try {
      // TODO: 친구 API 호출
      if (action === 'add') {
        // 친구 요청 보내기
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, friendRequestStatus: 'sent' as const }
            : user
        ))
      } else if (action === 'remove') {
        // 친구 삭제
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                isFriend: false,
                friendsCount: user.friendsCount - 1,
                isNotificationEnabled: false
              }
            : user
        ))
      } else if (action === 'accept') {
        // 친구 요청 수락
        setFriendRequests(prev => prev.filter(u => u.id !== userId))
        setUsers(prev => [...prev, {
          ...friendRequests.find(u => u.id === userId)!,
          isFriend: true,
          friendRequestStatus: 'none' as const
        }])
      } else if (action === 'reject') {
        // 친구 요청 거절
        setFriendRequests(prev => prev.filter(u => u.id !== userId))
      }
    } catch (error) {
      console.error('친구 처리 실패:', error)
    }
  }

  const handleNotificationToggle = async (userId: string) => {
    try {
      // TODO: 알림 설정 API 호출
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isNotificationEnabled: !user.isNotificationEnabled }
          : user
      ))
    } catch (error) {
      console.error('알림 설정 실패:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">친구</h1>
          
          {/* 친구 요청 알림 */}
          {friendRequests.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  새로운 친구 요청 {friendRequests.length}개
                </span>
                <button className="text-blue-600 text-sm font-medium">
                  보기
                </button>
              </div>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="친구 찾기..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              모든 사용자
            </Button>
            <Button
              variant={filter === 'friends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('friends')}
            >
              내 친구
            </Button>
          </div>
        </div>
      </header>

      {/* User List */}
      <div className="px-4 py-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '사용자가 없습니다'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? '다른 검색어를 시도해보세요' : '첫 번째 사용자가 되어보세요!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-gray-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{user.username}</h4>
                      {/* 알림 버튼 - 친구일 때만 */}
                      {user.isFriend && (
                        <button
                          onClick={() => handleNotificationToggle(user.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                        >
                          {user.isNotificationEnabled ? (
                            <Bell size={18} className="text-blue-500" />
                          ) : (
                            <BellOff size={18} className="text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {user.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{user.bio}</p>
                    )}
                    
                    {/* 통계 */}
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">평가</span>
                        <span className="font-semibold text-gray-700">{user.reviewsCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">맛집</span>
                        <span className="font-semibold text-gray-700">{user.restaurantCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">친구</span>
                        <span className="font-semibold text-gray-700">{user.friendsCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 친구 버튼 (아래로 분리) - 명확한 액션 표시 */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {user.isFriend ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFriendAction(user.id, 'remove')}
                      className="w-full gap-2 text-green-600 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                    >
                      <UserCheck size={16} />
                      ✓ 친구
                    </Button>
                  ) : user.friendRequestStatus === 'sent' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full gap-2 text-gray-500 border-gray-300"
                    >
                      <UserPlus size={16} />
                      요청 보냄
                    </Button>
                  ) : user.friendRequestStatus === 'received' ? (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleFriendAction(user.id, 'accept')}
                        className="flex-1 gap-2"
                      >
                        <UserCheck size={16} />
                        수락
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFriendAction(user.id, 'reject')}
                        className="flex-1 text-red-600 border-red-300"
                      >
                        거절
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleFriendAction(user.id, 'add')}
                      className="w-full gap-2"
                    >
                      <UserPlus size={16} />
                      + 친구 추가
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}