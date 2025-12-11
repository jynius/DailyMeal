'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, MapPin } from 'lucide-react'

interface LocationVisitor {
  userId: string
  userName: string
  visitCount: number
}

interface LocationGroupInfoProps {
  locationGroupId: string
  restaurantName: string
}

export function LocationGroupInfo({ locationGroupId, restaurantName }: LocationGroupInfoProps) {
  const [visitors, setVisitors] = useState<LocationVisitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVisitors() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest<LocationVisitor[]>(
          `/locations/groups/${locationGroupId}/visitors`
        )
        setVisitors(data)
      } catch (err: any) {
        console.error('Failed to fetch visitors:', err)
        setError(err.message || '방문자 정보를 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }

    if (locationGroupId) {
      fetchVisitors()
    }
  }, [locationGroupId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            이 식당을 방문한 사람들
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !visitors || visitors.length === 0) {
    return null
  }

  // 본인 제외
  const otherVisitors = visitors.filter((v) => v.visitCount > 0)

  if (otherVisitors.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          이 식당을 방문한 친구들
        </CardTitle>
        <CardDescription>
          <MapPin className="inline h-4 w-4 mr-1" />
          {restaurantName}에 다녀간 사람들이에요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {otherVisitors.slice(0, 5).map((visitor) => (
            <div
              key={visitor.userId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {visitor.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{visitor.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {visitor.visitCount}번 방문
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{visitor.visitCount}회</Badge>
            </div>
          ))}
          {otherVisitors.length > 5 && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              외 {otherVisitors.length - 5}명
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
