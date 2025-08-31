"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useBanners } from "@/hooks/use-api"
import { BannerImage } from "@/lib/types"
import { HeroDefaultImage } from "@/components/default-image"

type HeroImageType = {
  id: string
  src: string
  alt: string
  heroRow: 'top' | 'bottom' | null
}

// Fisher-Yates shuffle algorithm for arrays
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface MovingImageBannerProps {
  className?: string
}

export default function MovingImageBanner({ className }: MovingImageBannerProps) {
  const [displayImages, setDisplayImages] = useState<HeroImageType[]>([])
  const { banners, refetch } = useBanners() // 获取真实banner数据，包括refetch功能

  useEffect(() => {
    // 只使用数据库中的Hero区域banner图片
    const heroBanners = banners?.filter(banner => banner.showOnHero && banner.isActive) || []
    
    // 将banner数据转换为HeroImageType格式
    const heroImages: HeroImageType[] = heroBanners.map(banner => ({
      id: banner.id,
      src: banner.imageUrl,
      alt: banner.title,
      heroRow: banner.heroRow
    }))
    
    // 只显示数据库中的真实数据，不再填充默认图片
    setDisplayImages(shuffleArray(heroImages))
  }, [banners])

  // 每10秒自动刷新一次数据，确保能获取到最新上传的图片
  useEffect(() => {
    const interval = setInterval(() => {
      refetch?.()
    }, 10000) // 10秒刷新一次

    return () => clearInterval(interval)
  }, [refetch])

  if (displayImages.length === 0) {
    // 如果没有hero图片数据，显示默认的Hello Kitty图片
    const defaultHeroImages: HeroImageType[] = [
      {
        id: 'default-top-1',
        src: '/hello-kitty-coloring-page.png',
        alt: 'Hello Kitty 默认图片 1',
        heroRow: 'top'
      },
      {
        id: 'default-top-2', 
        src: '/hello-kitty-coloring-page.png',
        alt: 'Hello Kitty 默认图片 2',
        heroRow: 'top'
      },
      {
        id: 'default-bottom-1',
        src: '/hello-kitty-coloring-page.png', 
        alt: 'Hello Kitty 默认图片 3',
        heroRow: 'bottom'
      },
      {
        id: 'default-bottom-2',
        src: '/hello-kitty-coloring-page.png',
        alt: 'Hello Kitty 默认图片 4', 
        heroRow: 'bottom'
      }
    ]
    setDisplayImages(defaultHeroImages)
  }

  // 分离上下排图片，严格根据heroRow字段分配
  const topRowImages = displayImages.filter(img => img.heroRow === 'top')
  const bottomRowImages = displayImages.filter(img => img.heroRow === 'bottom')
  
  // 如果某一排没有指定图片，则平均分配剩余图片
  const unassignedImages = displayImages.filter(img => !img.heroRow || (img.heroRow !== 'top' && img.heroRow !== 'bottom'))
  
  // 将未分配的图片平均分配到上下排
  const halfPoint = Math.ceil(unassignedImages.length / 2)
  topRowImages.push(...unassignedImages.slice(0, halfPoint))
  bottomRowImages.push(...unassignedImages.slice(halfPoint))

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-gradient-to-r from-pink-100 to-blue-100",
        className
      )}
    >
      {/* Top row - scrolling left */}
      <div className="absolute top-12 left-0 w-full overflow-hidden">
        {topRowImages.length > 0 && (
          <div className="flex animate-marquee-left">
            {/* 重复足够多次确保屏幕永远被填满 */}
            {Array.from({ length: 20 }).map((_, repeatIndex) =>
              topRowImages.map((image, imageIndex) => (
                <div key={`top-${image.id}-${repeatIndex}-${imageIndex}`} className="flex-none mx-2">
                  <HeroDefaultImage
                    src={image.src}
                    alt={image.alt}
                    className="rounded-lg shadow-lg w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48"
                    priority={repeatIndex < 2 && imageIndex < 4}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom row - scrolling right */}
      <div className="absolute bottom-12 left-0 w-full overflow-hidden">
        {bottomRowImages.length > 0 && (
          <div className="flex animate-marquee-right">
            {/* 重复足够多次确保屏幕永远被填满 */}
            {Array.from({ length: 20 }).map((_, repeatIndex) =>
              bottomRowImages.map((image, imageIndex) => (
                <div key={`bottom-${image.id}-${repeatIndex}-${imageIndex}`} className="flex-none mx-2">
                  <HeroDefaultImage
                    src={image.src}
                    alt={image.alt}
                    className="rounded-lg shadow-lg w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48"
                    priority={repeatIndex < 2 && imageIndex < 4}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

