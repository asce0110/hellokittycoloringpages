"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useBanners } from "@/hooks/use-api"
import { BannerImage } from "@/lib/types"

type Season = "winter" | "valentine" | "spring" | "summer" | "autumn" | "none"
type Category = "seasonal" | "evergreen"
type ImageType = {
  id: number
  src: string
  alt: string
  category: Category
  season?: Season
  heroRow?: 'top' | 'bottom' | null
}

// Full library of images with categories and seasons
const allImages: ImageType[] = [
  // Seasonal
  {
    id: 9,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+christmas+santa",
    alt: "Christmas Santa Kitty",
    category: "seasonal",
    season: "winter",
  },
  {
    id: 10,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+halloween+witch",
    alt: "Halloween Witch Kitty",
    category: "seasonal",
    season: "autumn",
  },
  {
    id: 11,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+easter+bunny",
    alt: "Easter Bunny Kitty",
    category: "seasonal",
    season: "spring",
  },
  {
    id: 12,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+valentine+angel",
    alt: "Valentine Angel Kitty",
    category: "seasonal",
    season: "valentine",
  },
  {
    id: 13,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+thanksgiving+pilgrim",
    alt: "Thanksgiving Pilgrim Kitty",
    category: "seasonal",
    season: "autumn",
  },
  {
    id: 14,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+summer+beach",
    alt: "Summer Beach Kitty",
    category: "seasonal",
    season: "summer",
  },
  {
    id: 15,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+winter+snowman",
    alt: "Winter Snowman Kitty",
    category: "seasonal",
    season: "winter",
  },
  {
    id: 16,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+spring+flowers",
    alt: "Spring Flowers Kitty",
    category: "seasonal",
    season: "spring",
  },
  // Evergreen
  {
    id: 1,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+princess",
    alt: "Princess Kitty",
    category: "evergreen",
  },
  {
    id: 2,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+astronaut",
    alt: "Astronaut Kitty",
    category: "evergreen",
  },
  { id: 3, src: "/hello-kitty-coloring-page.png?query=hello+kitty+pirate", alt: "Pirate Kitty", category: "evergreen" },
  { id: 4, src: "/hello-kitty-coloring-page.png?query=hello+kitty+chef", alt: "Chef Kitty", category: "evergreen" },
  { id: 5, src: "/hello-kitty-coloring-page.png?query=hello+kitty+doctor", alt: "Doctor Kitty", category: "evergreen" },
  {
    id: 6,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+firefighter",
    alt: "Firefighter Kitty",
    category: "evergreen",
  },
  {
    id: 7,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+teacher",
    alt: "Teacher Kitty",
    category: "evergreen",
  },
  { id: 8, src: "/hello-kitty-coloring-page.png?query=hello+kitty+artist", alt: "Artist Kitty", category: "evergreen" },
  {
    id: 17,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+knight",
    alt: "Knight Kitty",
    category: "evergreen",
  },
  { id: 18, src: "/hello-kitty-coloring-page.png?query=hello+kitty+fairy", alt: "Fairy Kitty", category: "evergreen" },
  {
    id: 19,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+mermaid",
    alt: "Mermaid Kitty",
    category: "evergreen",
  },
  {
    id: 20,
    src: "/hello-kitty-coloring-page.png?query=hello+kitty+wizard",
    alt: "Wizard Kitty",
    category: "evergreen",
  },
]

// Helper function to determine the current season
const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() // 0-11
  if (month === 11 || month === 0) return "winter" // Dec, Jan
  if (month === 1) return "valentine" // Feb
  if (month >= 2 && month <= 3) return "spring" // Mar, Apr
  if (month >= 4 && month <= 7) return "summer" // May, Jun, Jul, Aug
  if (month >= 8 && month <= 10) return "autumn" // Sep, Oct, Nov
  return "none"
}

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

interface MovingImageBannerProps {
  className?: string
}

export function MovingImageBanner({ className }: MovingImageBannerProps) {
  const [displayImages, setDisplayImages] = useState<ImageType[]>([])
  const { banners } = useBanners() // 获取真实banner数据

  useEffect(() => {
    // 获取Hero区域的banner图片
    const heroBanners = banners?.filter(banner => banner.showOnHero && banner.isActive) || []
    
    // 将banner数据转换为ImageType格式
    const heroImages: ImageType[] = heroBanners.map(banner => ({
      id: parseInt(banner.id.replace('hero-', '') || '0'),
      src: banner.imageUrl,
      alt: banner.title,
      category: "evergreen" as Category,
      heroRow: banner.heroRow
    }))
    
    // 如果没有足够的hero图片，用默认图片填充
    let imagesToShow = [...heroImages]
    if (imagesToShow.length < 12) {
      const currentSeason = getCurrentSeason()
      const seasonalImages = allImages.filter((img) => img.season === currentSeason)
      const evergreenImages = allImages.filter((img) => img.category === "evergreen")
      
      const defaultImages = seasonalImages.length > 0 
        ? [...seasonalImages, ...shuffleArray(evergreenImages).slice(0, 8 - seasonalImages.length)]
        : shuffleArray(evergreenImages).slice(0, 12)
      
      // 填充不足的位置
      const needed = 12 - imagesToShow.length
      imagesToShow = [...imagesToShow, ...shuffleArray(defaultImages).slice(0, needed)]
    }

    setDisplayImages(shuffleArray(imagesToShow))
  }, [banners])

  if (displayImages.length === 0) {
    return null // Don't render anything until images are ready
  }

  // 分离上下排图片，优先使用指定heroRow的图片
  const topRowImages = displayImages.filter(img => 
    (img as any).heroRow === 'top' || (!(img as any).heroRow && displayImages.indexOf(img) % 2 === 0)
  )
  const bottomRowImages = displayImages.filter(img => 
    (img as any).heroRow === 'bottom' || (!(img as any).heroRow && displayImages.indexOf(img) % 2 !== 0)
  )

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Top Row */}
      <div className="absolute top-12 left-0 w-full">
        <div className="flex animate-scroll-left">
          {[...topRowImages, ...topRowImages].map((image, index) => (
            <div
              key={`top-${image.id}-${index}`}
              className="flex-shrink-0 mx-4 opacity-30 hover:opacity-60 transition-opacity duration-500"
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                width={180}
                height={180}
                className="rounded-lg shadow-lg w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Bottom Row */}
      <div className="absolute bottom-12 right-0 w-full">
        <div className="flex animate-scroll-right">
          {[...bottomRowImages, ...bottomRowImages].reverse().map((image, index) => (
            <div
              key={`bottom-${image.id}-${index}`}
              className="flex-shrink-0 mx-4 opacity-30 hover:opacity-60 transition-opacity duration-500"
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                width={180}
                height={180}
                className="rounded-lg shadow-lg w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
