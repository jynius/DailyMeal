'use client'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'gray' | 'white'
  text?: string
  fullScreen?: boolean
  container?: 'page' | 'section' | 'none'  // 컨테이너 타입
  className?: string  // 추가 커스텀 클래스
}

export default function Spinner({ 
  size = 'md', 
  color = 'blue',
  text,
  fullScreen = false,
  container = 'none',
  className = ''
}: SpinnerProps) {
  // 크기별 클래스
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  // 색상별 클래스
  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-900',
    white: 'border-white'
  }

  // 컨테이너별 클래스
  const containerClasses = {
    page: 'max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center',
    section: 'flex items-center justify-center py-12',
    none: ''
  }

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]}`} />
  )

  // 컨테이너로 감싸기
  const content = text ? (
    <div className="text-center">
      <div className="mx-auto mb-4">{spinner}</div>
      <p className="text-gray-600">{text}</p>
    </div>
  ) : fullScreen ? (
    <div className="min-h-screen flex items-center justify-center">
      {spinner}
    </div>
  ) : (
    spinner
  )

  // 컨테이너가 지정된 경우
  if (container !== 'none') {
    return (
      <div className={`${containerClasses[container]} ${className}`}>
        {text ? (
          <div className="text-center">
            <div className="mx-auto mb-4">{spinner}</div>
            <p className="text-gray-600">{text}</p>
          </div>
        ) : (
          spinner
        )}
      </div>
    )
  }

  return content
}
