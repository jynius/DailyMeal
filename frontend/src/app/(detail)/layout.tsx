'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { useEffect, useState } from 'react'
import { mealRecordsApi } from '@/lib/api/client'

const getHeaderTitle = async (pathname: string, id?: string) => {
  if (pathname.startsWith('/add')) return '식사 사진 등록'
  if (pathname.startsWith('/meal') && id) return '식사 기록'
  if (pathname.startsWith('/restaurant') && id) {
    try {
      // 임시: meal record에서 레스토랑 이름을 가져옵니다.
      // 추후에는 restaurant API를 직접 호출해야 합니다.
      const meal = await mealRecordsApi.getOne(id)
      return meal.location || '맛집 정보'
    } catch {
      return '맛집 정보'
    }
  }
  return '상세'
}

export default function DetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [title, setTitle] = useState('로딩 중...')

  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)
    const id = parts.length > 1 ? parts[parts.length - 1] : undefined

    const fetchTitle = async () => {
      const newTitle = await getHeaderTitle(pathname, id)
      setTitle(newTitle)
    }

    fetchTitle()
  }, [pathname])

  // `add` 페이지는 동적 타이틀이 필요 없으므로,
  // 이 로직은 `meal/[id]` 와 `restaurant/[id]` 에 더 적합합니다.
  // 현재 구조에서는 모든 detail 페이지에 이 레이아웃이 적용됩니다.
  // 더 나은 방법은 각 페이지에서 metadata를 export하는 것입니다.
  // 여기서는 클라이언트 사이드에서 제목을 설정하는 방식을 유지합니다.

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <Header title={title} showBackButton />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
