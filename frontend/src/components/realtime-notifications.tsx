'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Users, Camera, MapPin, Heart, MessageCircle, Zap } from 'lucide-react'
import { useSocket } from '@/contexts/socket-context'
import { Button } from '@/components/ui/button'

export function RealTimeNotifications() {
  const { notifications, clearNotifications, connectedUsers, isConnected } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 실시간 활동 필터링 (NEW_MEAL, NEW_RESTAURANT)
  const realtimeActivities = notifications.filter(n => 
    ['NEW_MEAL', 'NEW_RESTAURANT'].includes(n.type)
  ).slice(0, 10)

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
      <div className="fixed top-8 right-4 z-50 flex items-center gap-2">
        {/* 연결 상태 + 사용자 수 - 버튼으로 변경 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all hover:shadow-xl ${
            isConnected 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
          style={{ minHeight: 'auto', height: '28px' }}
        >
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-white animate-pulse' : 'bg-white/70'
          }`} />
          <span>{isConnected ? '연결됨' : '오프라인'}</span>
          {isConnected && (
            <>
              <div className="w-px h-3 bg-white/30" />
              <Users size={12} />
              <span>{connectedUsers}</span>
              {/* 실시간 활동 뱃지 */}
              {realtimeActivities.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white animate-pulse">
                  {realtimeActivities.length}
                </div>
              )}
            </>
          )}
        </button>

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
        <div className="fixed top-16 right-4 w-80 max-h-[500px] bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">실시간 활동</h3>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {connectedUsers}명 접속중
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* 알림 목록 */}
          <div className="overflow-y-auto max-h-[420px]">
            {realtimeActivities.length === 0 ? (
              <div className="p-8 text-center">
                <Users size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  아직 실시간 활동이 없습니다
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  곧 새로운 활동이 표시됩니다
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {realtimeActivities.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-2">
                      <Zap size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.type === 'NEW_MEAL'
                            ? `새로운 식사: ${notification.data.name || '알 수 없음'}`
                            : `새로운 음식점: ${notification.data.name || '알 수 없음'}`
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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