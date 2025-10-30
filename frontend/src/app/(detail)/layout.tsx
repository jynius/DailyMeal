'use client'

import { Header } from '@/components/header'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { mealRecordsApi } from '@/lib/api'

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

const DetailLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const [title, setTitle] = useState('')

  useEffect(() => {
    const fetchTitle = async () => {
      const pathSegments = pathname.split('/').filter(Boolean)
      const id = pathSegments.length > 1 ? pathSegments[1] : undefined
      const newTitle = await getHeaderTitle(pathname, id)
      setTitle(newTitle)
    }

    fetchTitle()
  }, [pathname])

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <Header title={title} showBackButton />
      <main className="flex-1 w-full">{children}</main>
    </div>
  )
}

export default DetailLayout
