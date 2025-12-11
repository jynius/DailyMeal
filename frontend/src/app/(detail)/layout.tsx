'use client'

import { usePathname } from 'next/navigation'

const DetailLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full">{children}</main>
    </div>
  )
}

export default DetailLayout
