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

  // 나를 제외한 접속자 수
  const otherUsers = Math.max(0, connectedUsers - 1)

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
      {/* 통합 알림 버튼 - 우측 상단 */}
      <div className="fixed top-6 right-4 z-50">
        <button type="button" title="통합 알림 버튼"
          onClick={() => setIsOpen(!isOpen)}
          className="relative shadow-lg hover:shadow-xl border rounded-full transition-all flex items-center justify-center"
          style={{ minWidth: 'auto', minHeight: 'auto', width: '36px', height: '36px', padding: '0' }}
        >
          <Bell size={20} className={isConnected ? 'text-green-600' : 'text-gray-400'} />
          
          {/* 알림 개수 뱃지 (우측 상단) */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center font-bold px-1 border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* 접속자 수 뱃지 (우측 하단) - 나 제외 */}
          {isConnected && otherUsers > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center font-bold px-1 border-2 border-white">
              {otherUsers > 99 ? '99+' : otherUsers}
            </div>
          )}
          
          {/* 실시간 활동 펄스 애니메이션 */}
          {isConnected && realtimeActivities.length > 0 && (
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
          )}
        </button>
      </div>

      {/* 알림 패널 */}
      {isOpen && (
        <div className="fixed top-20 right-4 w-80 max-h-[500px] bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`} />
              <h3 className="font-semibold">실시간 활동</h3>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {isConnected ? `${otherUsers}명 접속중` : '오프라인'}
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