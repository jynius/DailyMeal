'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, Search, Bell, BellOff } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'
import { Button } from '@/components/ui/button'
import { friendsApi } from '@/lib/api/friends'
import type { 
  User, 
  FriendRequest, 
  SentRequest, 
  SearchResult 
} from '@/lib/api/friends'

export default function UsersPage() {
  const [friends, setFriends] = useState<User[]>([])                    // 내 친구 목록
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])  // 받은 친구 요청
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([])        // 보낸 친구 요청
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])     // 검색 결과
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'search'>('friends')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // 병렬로 데이터 가져오기
      const [friendsData, receivedData, sentData] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getReceivedRequests(),
        friendsApi.getSentRequests(),
      ])
      
      setFriends(friendsData)
      setFriendRequests(receivedData)
      setSentRequests(sentData)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
      // 에러 발생 시 빈 배열로 초기화
      setFriends([])
      setFriendRequests([])
      setSentRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      const results = await friendsApi.searchUsers(query)
      setSearchResults(results)
      setActiveTab('search')
    } catch (error) {
      console.error('검색 실패:', error)
      setSearchResults([])
    }
  }

  const handleFriendAction = async (userId: string, action: 'request' | 'remove' | 'accept' | 'reject' | 'cancel') => {
    try {
      if (action === 'request') {
        // 친구 요청 보내기
        const targetUser = searchResults.find(u => u.id === userId)
        if (!targetUser) return
        
        await friendsApi.sendFriendRequest(targetUser.email)
        
        setSearchResults(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, friendshipStatus: 'pending_sent' as const }
            : user
        ))
        
        // 보낸 요청 목록 다시 불러오기
        const sentData = await friendsApi.getSentRequests()
        setSentRequests(sentData)
      } else if (action === 'remove') {
        // 친구 삭제
        await friendsApi.removeFriend(userId)
        setFriends(prev => prev.filter(friend => friend.id !== userId))
      } else if (action === 'accept') {
        // 친구 요청 수락
        const acceptedRequest = friendRequests.find(req => req.userId === userId)
        if (!acceptedRequest) return
        
        await friendsApi.acceptFriendRequest(acceptedRequest.id)
        
        setFriendRequests(prev => prev.filter(req => req.userId !== userId))
        setFriends(prev => [...prev, {
          id: acceptedRequest.userId,
          username: acceptedRequest.username,
          email: acceptedRequest.email,
          avatar: acceptedRequest.avatar,
          bio: acceptedRequest.bio,
          reviewsCount: acceptedRequest.reviewsCount,
          restaurantCount: acceptedRequest.restaurantCount,
          friendsCount: acceptedRequest.friendsCount,
          isFriend: true,
          isNotificationEnabled: false
        }])
      } else if (action === 'reject') {
        // 친구 요청 거절
        const rejectedRequest = friendRequests.find(req => req.userId === userId)
        if (!rejectedRequest) return
        
        await friendsApi.rejectFriendRequest(rejectedRequest.id)
        setFriendRequests(prev => prev.filter(req => req.userId !== userId))
      } else if (action === 'cancel') {
        // 보낸 친구 요청 취소
        const canceledRequest = sentRequests.find(req => req.friendId === userId)
        if (!canceledRequest) return
        
        await friendsApi.cancelFriendRequest(canceledRequest.id)
        setSentRequests(prev => prev.filter(req => req.friendId !== userId))
      }
    } catch (error) {
      console.error('친구 처리 실패:', error)
    }
  }

  const handleNotificationToggle = async (userId: string) => {
    try {
      const currentFriend = friends.find(f => f.id === userId)
      if (!currentFriend) return
      
      await friendsApi.toggleNotification(userId, !currentFriend.isNotificationEnabled)
      
      setFriends(prev => prev.map(friend => 
        friend.id === userId 
          ? { ...friend, isNotificationEnabled: !friend.isNotificationEnabled }
          : friend
      ))
    } catch (error) {
      console.error('알림 설정 실패:', error)
    }
  }

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
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
          {friendRequests.length > 0 && activeTab !== 'received' && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  새로운 친구 요청 {friendRequests.length}개
                </span>
                <button 
                  onClick={() => setActiveTab('received')}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  확인하기
                </button>
              </div>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름이나 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Tab Buttons */}
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={activeTab === 'friends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('friends')}
            >
              내 친구 ({friends.length})
            </Button>
            <Button
              variant={activeTab === 'received' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('received')}
              className="relative"
            >
              받은 요청
              {friendRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'sent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('sent')}
              className="relative"
            >
              보낸 요청
              {sentRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-500 text-white rounded-full">
                  {sentRequests.length}
                </span>
              )}
            </Button>
            {searchQuery && (
              <Button
                variant={activeTab === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('search')}
              >
                검색 결과
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-2">
        {activeTab === 'friends' && (
          <FriendsList 
            friends={filteredFriends}
            searchQuery={searchQuery}
            onRemove={(id) => handleFriendAction(id, 'remove')}
            onNotificationToggle={handleNotificationToggle}
          />
        )}
        
        {activeTab === 'received' && (
          <ReceivedRequestsList 
            requests={friendRequests}
            onAccept={(id) => handleFriendAction(id, 'accept')}
            onReject={(id) => handleFriendAction(id, 'reject')}
          />
        )}
        
        {activeTab === 'sent' && (
          <SentRequestsList 
            requests={sentRequests}
            onCancel={(id) => handleFriendAction(id, 'cancel')}
          />
        )}
        
        {activeTab === 'search' && (
          <SearchResultsList 
            results={searchResults}
            onSendRequest={(id) => handleFriendAction(id, 'request')}
          />
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

// 친구 목록 컴포넌트
function FriendsList({ 
  friends, 
  searchQuery,
  onRemove, 
  onNotificationToggle 
}: { 
  friends: User[]
  searchQuery: string
  onRemove: (id: string) => void
  onNotificationToggle: (id: string) => void
}) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchQuery ? '검색 결과가 없습니다' : '아직 친구가 없습니다'}
        </h3>
        <p className="text-gray-600">
          {searchQuery ? '다른 검색어를 시도해보세요' : '검색해서 친구를 추가해보세요!'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {friends.map(friend => (
        <div key={friend.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {friend.avatar ? (
                <img 
                  src={friend.avatar} 
                  alt={friend.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-gray-600">
                  {friend.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 truncate">{friend.username}</h4>
                <button
                  onClick={() => onNotificationToggle(friend.id)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  title={friend.isNotificationEnabled ? '알림 끄기' : '알림 켜기'}
                >
                  {friend.isNotificationEnabled ? (
                    <Bell size={18} className="text-blue-500" />
                  ) : (
                    <BellOff size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
              
              {friend.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{friend.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>평가 <strong className="text-gray-700">{friend.reviewsCount}</strong></span>
                <span>맛집 <strong className="text-gray-700">{friend.restaurantCount}</strong></span>
                <span>친구 <strong className="text-gray-700">{friend.friendsCount}</strong></span>
              </div>
            </div>
          </div>
          
          {/* Remove Button */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`${friend.username}님을 친구 목록에서 삭제하시겠습니까?`)) {
                  onRemove(friend.id)
                }
              }}
              className="w-full gap-2 text-green-600 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <UserCheck size={16} />
              ✓ 친구 (클릭하여 삭제)
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 받은 친구 요청 목록 컴포넌트
function ReceivedRequestsList({ 
  requests, 
  onAccept, 
  onReject 
}: { 
  requests: FriendRequest[]
  onAccept: (userId: string) => void
  onReject: (userId: string) => void
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlus size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          받은 친구 요청이 없습니다
        </h3>
        <p className="text-gray-600">
          새로운 친구 요청이 오면 여기에 표시됩니다
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        {requests.length}명이 친구 요청을 보냈습니다
      </div>
      {requests.map(request => (
        <div key={request.id} className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {request.avatar ? (
                <img 
                  src={request.avatar} 
                  alt={request.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-gray-600">
                  {request.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate mb-1">{request.username}</h4>
              <p className="text-xs text-gray-500 mb-1">{request.email}</p>
              
              {request.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{request.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>평가 <strong className="text-gray-700">{request.reviewsCount}</strong></span>
                <span>맛집 <strong className="text-gray-700">{request.restaurantCount}</strong></span>
                <span>친구 <strong className="text-gray-700">{request.friendsCount}</strong></span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => onAccept(request.userId)}
              className="flex-1 gap-2"
            >
              <UserCheck size={16} />
              수락
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(request.userId)}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              거절
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 보낸 친구 요청 목록 컴포넌트
function SentRequestsList({ 
  requests, 
  onCancel 
}: { 
  requests: SentRequest[]
  onCancel: (friendId: string) => void
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlus size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          보낸 친구 요청이 없습니다
        </h3>
        <p className="text-gray-600">
          검색을 통해 친구를 찾아 요청을 보내보세요
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        {requests.length}명에게 친구 요청을 보냈습니다
      </div>
      {requests.map(request => (
        <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {request.avatar ? (
                <img 
                  src={request.avatar} 
                  alt={request.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-gray-600">
                  {request.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate mb-1">{request.username}</h4>
              <p className="text-xs text-gray-500 mb-1">{request.email}</p>
              
              {request.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{request.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>평가 <strong className="text-gray-700">{request.reviewsCount}</strong></span>
                <span>맛집 <strong className="text-gray-700">{request.restaurantCount}</strong></span>
                <span>친구 <strong className="text-gray-700">{request.friendsCount}</strong></span>
              </div>
              
              {/* 요청 보낸 시간 */}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(request.createdAt).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric'
                })} 요청
              </p>
            </div>
          </div>
          
          {/* Cancel Button */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`${request.username}님에게 보낸 친구 요청을 취소하시겠습니까?`)) {
                  onCancel(request.friendId)
                }
              }}
              className="w-full text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              요청 취소
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 검색 결과 목록 컴포넌트
function SearchResultsList({ 
  results, 
  onSendRequest 
}: { 
  results: SearchResult[]
  onSendRequest: (id: string) => void
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          검색 결과가 없습니다
        </h3>
        <p className="text-gray-600">
          다른 검색어를 입력해보세요
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        {results.length}명의 사용자를 찾았습니다
      </div>
      {results.map(user => (
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
              <h4 className="font-semibold text-gray-900 truncate mb-1">{user.username}</h4>
              <p className="text-xs text-gray-500 mb-1">{user.email}</p>
              
              {user.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{user.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>평가 <strong className="text-gray-700">{user.reviewsCount}</strong></span>
                <span>맛집 <strong className="text-gray-700">{user.restaurantCount}</strong></span>
                <span>친구 <strong className="text-gray-700">{user.friendsCount}</strong></span>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            {user.friendshipStatus === 'accepted' ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full gap-2 text-green-600 border-green-300"
              >
                <UserCheck size={16} />
                ✓ 이미 친구
              </Button>
            ) : user.friendshipStatus === 'pending_sent' ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full gap-2 text-gray-500 border-gray-300"
              >
                <UserPlus size={16} />
                요청 보냄 (대기 중)
              </Button>
            ) : user.friendshipStatus === 'pending_received' ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full gap-2 text-blue-600 border-blue-300"
              >
                <UserPlus size={16} />
                상대방이 요청함 (요청 탭에서 수락)
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => onSendRequest(user.id)}
                className="w-full gap-2"
              >
                <UserPlus size={16} />
                친구 요청 보내기
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}