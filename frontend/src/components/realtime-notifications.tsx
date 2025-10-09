'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Users, Camera, MapPin, Heart, MessageCircle } from 'lucide-react'
import { useSocket } from '@/contexts/socket-context'
import { Button } from '@/components/ui/button'

export function RealTimeNotifications() {
  const { notifications, clearNotifications, connectedUsers, isConnected } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_MEAL':
        return <Camera size={16} className="text-blue-500" />
      case 'NEW_RESTAURANT':
        return <MapPin size={16} className="text-green-500" />
      case 'LIKE_UPDATE':
        return <Heart size={16} className="text-red-500" />
      case 'NEW_COMMENT':
        return <MessageCircle size={16} className="text-purple-500" />
      default:
        return <Bell size={16} className="text-gray-500" />
    }
  }

  const getNotificationMessage = (notification: { type: string; data: Record<string, unknown> }) => {
    switch (notification.type) {
      case 'NEW_MEAL':
        return `새로운 식사: ${notification.data.name || '알 수 없음'}`
      case 'NEW_RESTAURANT':
        return `새로운 음식점: ${notification.data.name || '알 수 없음'}`
      case 'LIKE_UPDATE':
        return `좋아요가 ${notification.data.likes || 0}개가 되었습니다`
      case 'NEW_COMMENT':
        return '새로운 댓글이 달렸습니다'
      default:
        return '새로운 알림이 있습니다'
    }
  }

  const formatTime = (timestamp: string) => {
    // 클라이언트에서만 실행되도록 체크
    if (typeof window === 'undefined') {
      return '로딩...'
    }
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  return (
    <>
      {/* Floating 상태 표시 - 우측 상단에 나란히 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* 연결 상태 + 사용자 수 통합 */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
          isConnected 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-500 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-white animate-pulse' : 'bg-white/70'
          }`} />
          <span>{isConnected ? '연결됨' : '오프라인'}</span>
          {isConnected && (
            <>
              <div className="w-px h-3 bg-white/30" />
              <Users size={12} />
              <span>{connectedUsers}</span>
            </>
          )}
        </div>

        {/* 알림 버튼 - 높이 통일 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-white text-gray-700 shadow-lg hover:shadow-xl border hover:bg-gray-50 rounded-full transition-all flex items-center justify-center"
          style={{ minWidth: 'auto', minHeight: 'auto', width: '28px', height: '28px', padding: '0' }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium" style={{ fontSize: '10px' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>
      </div>

      {/* 알림 패널 */}
      {isOpen && (
        <div className="fixed top-20 right-4 w-80 max-h-96 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">실시간 알림</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Button
                  onClick={clearNotifications}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  모두 지우기
                </Button>
              )}
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="w-6 h-6"
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">아직 알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 배경 클릭으로 닫기 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}