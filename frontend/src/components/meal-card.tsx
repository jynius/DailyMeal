import { Star, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface MealCardProps {
  id: string
  name: string
  photo?: string
  location?: string
  rating: number
  memo?: string
  createdAt: string
  price?: number
}

export function MealCard({
  id,
  name,
  photo,
  location,
  rating,
  memo,
  createdAt,
  price,
}: MealCardProps) {
  return (
    <Link href={`/meal/${id}`} className="block">
      <div className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Photo */}
      <div className="aspect-square relative bg-gray-100">
        {photo ? (
          <Image
            src={photo.startsWith('http') ? photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photo}`}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
          <div className="flex items-center ml-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={
                  i < rating 
                    ? "text-yellow-400 fill-current" 
                    : "text-gray-300"
                } 
              />
            ))}
          </div>
        </div>
        
        {location && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        
        {price && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">₩{price.toLocaleString()}</span>
          </div>
        )}
        
        {memo && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {memo}
          </p>
        )}
        
        <div className="flex items-center text-xs text-gray-400">
          <Clock size={12} className="mr-1" />
          {createdAt}
        </div>
      </div>
    </div>
    </Link>
  )
}