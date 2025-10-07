import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MealShareButton } from '@/components/meal-share-button'

interface MealPageProps {
  params: { id: string }
}

interface MealData {
  id: string
  title: string
  description: string
  imageUrl: string
  calories: number
  createdAt: string
  user: {
    id: string
    name: string
    profileImage?: string
  }
  tags: string[]
}

// 🔥 SSR: 서버에서 메타데이터 생성 (공유 최적화)
export async function generateMetadata({ params }: MealPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const meal = await fetchMealData(resolvedParams.id)
    
    if (!meal) {
      return {
        title: 'Meal Not Found - DailyMeal',
        description: 'The meal you are looking for could not be found.'
      }
    }

    return {
      title: `${meal.user.name}님의 ${meal.title} - DailyMeal`,
      description: `${meal.description} | 칼로리: ${meal.calories}kcal | ${meal.tags.join(', ')}`,
      
      // Open Graph (Facebook, 카카오톡 등)
      openGraph: {
        title: `${meal.user.name}님의 맛있는 식사`,
        description: `${meal.title}\n${meal.description}\n📊 칼로리: ${meal.calories}kcal`,
        images: [
          {
            url: meal.imageUrl.startsWith('http') 
              ? meal.imageUrl 
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${meal.imageUrl}`,
            width: 1200,
            height: 630,
            alt: meal.title,
          }
        ],
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/meal/${resolvedParams.id}`,
        siteName: 'DailyMeal',
        type: 'article',
        publishedTime: meal.createdAt,
      },
      
      // Twitter
      twitter: {
        card: 'summary_large_image',
        title: `${meal.user.name}님의 ${meal.title}`,
        description: meal.description,
        images: [meal.imageUrl.startsWith('http') 
          ? meal.imageUrl 
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${meal.imageUrl}`
        ],
      },
      
      // 추가 SEO
      keywords: ['식단', '음식', '칼로리', '건강', ...meal.tags],
      authors: [{ name: meal.user.name }],
      category: 'Food & Health',
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error)
    return {
      title: 'Error - DailyMeal',
      description: 'An error occurred while loading the meal information.'
    }
  }
}

async function fetchMealData(id: string): Promise<MealData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/meal-records/${id}`, {
      // SSR에서는 캐시를 사용하지 않음 (최신 데이터)
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.log(`API Response: ${response.status} ${response.statusText}`)
      // 404인 경우 샘플 데이터 반환
      if (response.status === 404) {
        return {
          id: id,
          title: '크림파스타',
          description: '맛있는 크림파스타를 먹었습니다. 부드러운 크림소스와 알단테 면이 정말 좋았어요!',
          imageUrl: '/uploads/sample-pasta.jpg',
          calories: 650,
          tags: ['파스타', '이탈리안', '크림'],
          user: {
            id: 'sample-user',
            name: '샘플 사용자',
            profileImage: '/default-profile.jpg'
          },
          createdAt: new Date().toISOString()
        }
      }
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch meal data:', error)
    // 네트워크 오류시에도 샘플 데이터 반환
    return {
      id: id,
      title: '김치찌개',
      description: '집에서 만든 김치찌개입니다. 엄마 손맛이 그리워서 만들어봤는데 성공했어요!',
      imageUrl: '/uploads/sample-kimchi.jpg', 
      calories: 420,
      tags: ['한식', '찌개', '집밥'],
      user: {
        id: 'demo-user',
        name: '데모 사용자',
        profileImage: '/default-profile.jpg'
      },
      createdAt: new Date().toISOString()
    }
  }
}

// 🔥 SSR: 서버에서 페이지 렌더링 (실시간 데이터)
export default async function MealPage({ params }: MealPageProps) {
  const resolvedParams = await params
  const meal = await fetchMealData(resolvedParams.id)
  
  if (!meal) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 뒤로 가기 버튼 */}
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 뒤로 가기
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 사용자 정보 */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              {meal.user.profileImage && (
                <Image
                  src={meal.user.profileImage}
                  alt={meal.user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <h3 className="font-semibold">{meal.user.name}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(meal.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {/* 음식 이미지 */}
          <div className="relative aspect-square">
            <Image
              src={meal.imageUrl.startsWith('http') 
                ? meal.imageUrl 
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${meal.imageUrl}`
              }
              alt={meal.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 음식 정보 */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{meal.title}</h1>
            <p className="text-gray-700 mb-4">{meal.description}</p>
            
            {/* 칼로리 정보 */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-blue-800 font-medium">📊 {meal.calories} kcal</span>
              </div>
            </div>

            {/* 태그 */}
            {meal.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {meal.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 공유 버튼 */}
        <MealShareButton meal={meal} />
      </div>
    </div>
  )
}