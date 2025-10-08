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
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isNotificationEnabled: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'following' | 'followers'>('all')

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
          postsCount: 87,
          followersCount: 234,
          followingCount: 156,
          isFollowing: false,
          isNotificationEnabled: true
        },
        {
          id: '2',
          username: '요리하는준호',
          email: 'junho@example.com',
          bio: '집에서 요리하는 것을 좋아합니다 👨‍🍳',
          postsCount: 156,
          followersCount: 489,
          followingCount: 78,
          isFollowing: true,
          isNotificationEnabled: true
        },
        {
          id: '3',
          username: '건강식수연',
          email: 'suyeon@example.com',
          bio: '건강한 식습관 만들기 💚',
          postsCount: 43,
          followersCount: 123,
          followingCount: 89,
          isFollowing: false,
          isNotificationEnabled: false
        }
      ]
      
      let filteredUsers = sampleUsers
      
      switch (filter) {
        case 'following':
          filteredUsers = sampleUsers.filter(u => u.isFollowing)
          break
        case 'followers':
          // TODO: 실제 팔로워 목록 API
          break
      }
      
      setUsers(filteredUsers)
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      // TODO: 팔로우/언팔로우 API 호출
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isFollowing: !user.isFollowing,
              followersCount: user.isFollowing ? user.followersCount - 1 : user.followersCount + 1
            }
          : user
      ))
    } catch (error) {
      console.error('팔로우 처리 실패:', error)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">사용자</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="사용자 검색..."
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
              전체 사용자
            </Button>
            <Button
              variant={filter === 'following' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('following')}
            >
              팔로잉
            </Button>
            <Button
              variant={filter === 'followers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('followers')}
            >
              팔로워
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
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{user.username}</h4>
                    {user.bio && (
                      <p className="text-sm text-gray-600 line-clamp-1">{user.bio}</p>
                    )}
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span>게시물 {user.postsCount}</span>
                      <span>팔로워 {user.followersCount}</span>
                      <span>팔로잉 {user.followingCount}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user.isFollowing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNotificationToggle(user.id)}
                        className="p-2"
                      >
                        {user.isNotificationEnabled ? (
                          <Bell size={16} className="text-blue-500" />
                        ) : (
                          <BellOff size={16} className="text-gray-400" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollow(user.id)}
                      className="gap-2"
                    >
                      {user.isFollowing ? (
                        <>
                          <UserCheck size={14} />
                          팔로잉
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          팔로우
                        </>
                      )}
                    </Button>
                  </div>
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