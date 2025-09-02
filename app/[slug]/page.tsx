import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { 
  getColoringPageBySlug, 
  getAllColoringPageSlugs, 
  mapLegacySlugToNew,
  ColoringPageData 
} from "@/lib/coloring-data"
import { ColoringPageClient } from "./coloring-page-client"
import routeMonitor from "@/lib/route-monitoring"

interface SlugPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 定义所有静态路由，避免动态路由冲突
const STATIC_ROUTES = new Set([
  'admin', 'community', 'create', 'dashboard', 'hello-kitty-drawings', 
  'library', 'login', 'print-test', 'settings', 'smart-compression', 'upng-test',
  'api', 'color', // 包含旧的color路径用于重定向
  'debug', 'diagnosis', 'diagnostic', 'privacy', 'terms', 
  'test-favorites-fix', 'test-favorites',
  '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml', // Next.js内置路径
  'manifest.json', 'icon.png', 'apple-touch-icon.png', 'favicon.svg', 'apple-icon.svg' // PWA和图标文件
])

/**
 * 检查是否应该处理此slug作为着色页面
 * 避免与静态路由冲突
 */
function shouldHandleAsColoringPage(slug: string): boolean {
  // 如果是静态路由，不处理
  if (STATIC_ROUTES.has(slug)) {
    return false
  }
  
  // 如果是API路径，不处理
  if (slug.startsWith('api')) {
    return false
  }
  
  // 其他情况都视为潜在的着色页面slug
  return true
}

/**
 * 检测并处理旧的 /color/ 路径重定向
 * 如果访问的是 /color/something，重定向到 /something
 */
function handleColorRouteRedirect(slug: string): boolean {
  if (slug === 'color') {
    // 如果只是访问 /color，重定向到 /library
    redirect('/library')
    return true
  }
  return false
}

// 静态生成所有着色页面
export async function generateStaticParams() {
  const slugs = getAllColoringPageSlugs()
  
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

/**
 * 向后兼容性处理：检测旧格式URL并重定向到新格式
 */
function handleLegacyUrl(slug: string): { isLegacy: boolean; newSlug?: string } {
  // 检测旧格式：包含6位数字的URL
  const legacyPattern = /^(hello-kitty-.+)-(\d{6})$/
  const match = slug.match(legacyPattern)
  
  if (match) {
    console.log('🔄 检测到旧格式URL:', slug)
    const baseSlug = match[1]
    const legacyId = match[2]
    
    // 尝试找到对应的新URL
    // 这里可以根据需要实现更复杂的映射逻辑
    return {
      isLegacy: true,
      newSlug: baseSlug // 移除数字后缀
    }
  }
  
  return { isLegacy: false }
}

// 生成SEO metadata
export async function generateMetadata({ params, searchParams }: SlugPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  console.log('🔍 generateMetadata 被调用:', resolvedParams.slug)
  
  // 检查是否应该处理为着色页面
  if (!shouldHandleAsColoringPage(resolvedParams.slug)) {
    console.log('❌ generateMetadata: 不是着色页面路由:', resolvedParams.slug)
    return {
      title: "Page Not Found | Coloring Pages Printable",
      description: "The requested page could not be found.",
    }
  }
  
  // 🎯 优先使用SEO API，跳过静态数据查找以确保使用真实数据
  let coloringPage: ColoringPageData | null = null
  console.log('🔍 generateMetadata: 静态数据查找结果: 未找到')
  
  // 🎯 首先尝试从SEO URL存储中查找（通过API调用）
  if (!coloringPage) {
    try {
      console.log('🔍 generateMetadata: 尝试SEO API查找:', resolvedParams.slug)
      const seoResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/seo-url?slug=${encodeURIComponent(resolvedParams.slug)}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      console.log('🔍 generateMetadata: SEO API响应状态:', seoResponse.status)
      
      if (seoResponse.ok) {
        const seoResult = await seoResponse.json()
        console.log('🔍 generateMetadata: SEO API响应数据:', seoResult)
        const seoData = seoResult.data
        
        if (seoData) {
          coloringPage = {
            id: seoData.libraryImageId || resolvedParams.slug, // 🎯 优先使用真实图片ID
            slug: resolvedParams.slug,
            title: seoData.title,
            description: seoData.description || `Color the beautiful ${seoData.title} design`,
            imageUrl: seoData.imageUrl,
            thumbnailUrl: seoData.imageUrl,
            printUrl: seoData.imageUrl,
            category: 'Custom',
            tags: seoData.title.toLowerCase().split(' ').filter((word: string) => word.length > 2),
            difficulty: 'medium',
            featured: false,
            createdAt: new Date(),
            metaTitle: `${seoData.title} Coloring Page - Free Printable`,
            metaDescription: `Color the beautiful ${seoData.title} design! Free printable coloring page.`,
            libraryImageId: seoData.libraryImageId // 🎯 保存真实图片ID用于浏览量追踪
          }
          
          console.log('✅ generateMetadata: 从SEO存储API中找到页面数据:', {
            slug: resolvedParams.slug,
            title: seoData.title,
            imageUrl: seoData.imageUrl
          })
        }
      } else {
        console.log('⚠️ generateMetadata: SEO URL存储中未找到数据:', resolvedParams.slug)
      }
    } catch (error) {
      console.error('❌ generateMetadata: SEO URL查询失败:', error)
    }
  }
  
  // 🎯 如果还没找到，尝试从库数据中查找匹配的内容
  if (!coloringPage) {
    try {
      // 尝试通过API获取库数据并匹配slug
      const libraryResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/library-images?limit=100`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (libraryResponse.ok) {
        const libraryResult = await libraryResponse.json()
        const libraryImages = libraryResult.data || []
        
        // 尝试找到匹配的图片
        const matchingImage = libraryImages.find((img: any) => {
          const imageSlug = img.title.toLowerCase()
            .replace(/^hello\s+kitty\s+/i, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-') + '-coloring-pages'
          return imageSlug === resolvedParams.slug
        })
        
        if (matchingImage) {
          coloringPage = {
            id: matchingImage.id,
            slug: resolvedParams.slug,
            title: matchingImage.title,
            description: matchingImage.description || `Color the beautiful ${matchingImage.title} design`,
            imageUrl: matchingImage.imageUrl,
            thumbnailUrl: matchingImage.thumbnailUrl || matchingImage.imageUrl,
            printUrl: matchingImage.imageUrl,
            category: matchingImage.category,
            tags: matchingImage.tags || [],
            difficulty: matchingImage.difficulty || 'medium',
            featured: matchingImage.isFeatured || false,
            createdAt: new Date(matchingImage.createdAt),
            metaTitle: `${matchingImage.title} - Coloring Pages Printable | Free Download`,
            metaDescription: `Color the beautiful ${matchingImage.title} design! Free printable coloring page.`,
            libraryImageId: matchingImage.id
          }
          
          console.log('✅ generateMetadata: 从库数据中找到匹配的图片:', {
            slug: resolvedParams.slug,
            title: matchingImage.title,
            id: matchingImage.id
          })
        }
      }
    } catch (error) {
      console.error('❌ generateMetadata: 库数据查询失败:', error)
    }
  }

  // 处理旧URL重定向
  if (!coloringPage) {
    const newSlug = mapLegacySlugToNew(resolvedParams.slug)
    if (newSlug) {
      coloringPage = getColoringPageBySlug(newSlug)
    }
  }
  
  if (!coloringPage) {
    console.log('❌ generateMetadata: 最终未找到着色页面数据:', resolvedParams.slug)
    return {
      title: "Coloring Page Not Found | Coloring Pages Printable",
      description: "The requested coloring page could not be found.",
    }
  }
  
  console.log('✅ generateMetadata: 成功生成metadata:', {
    slug: resolvedParams.slug,
    title: coloringPage.title
  })
  
  return {
    title: coloringPage.metaTitle || `${coloringPage.title} - Coloring Pages Printable | Free Download`,
    description: coloringPage.metaDescription || coloringPage.description,
    keywords: coloringPage.tags.join(', '),
    openGraph: {
      title: coloringPage.title,
      description: coloringPage.description,
      images: [
        {
          url: coloringPage.thumbnailUrl || coloringPage.imageUrl,
          width: 1024,
          height: 1024,
          alt: coloringPage.title,
        },
      ],
    },
  }
}

export default async function SlugPage({ params, searchParams }: SlugPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  // 🔍 获取请求信息用于监控
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || undefined
  const xForwardedFor = headersList.get('x-forwarded-for')
  const ip = xForwardedFor?.split(',')[0] || headersList.get('x-real-ip') || undefined
  
  // 记录路由访问
  routeMonitor.logRouteAccess(resolvedParams.slug, userAgent, ip)
  
  // 检查并处理 /color 路径的重定向
  if (handleColorRouteRedirect(resolvedParams.slug)) {
    return null // redirect已经执行
  }
  
  // 检查是否应该处理为着色页面
  if (!shouldHandleAsColoringPage(resolvedParams.slug)) {
    routeMonitor.logNotFound(resolvedParams.slug, { reason: 'static_route_conflict' }, userAgent)
    notFound()
  }
  
  // 🔄 检查是否是旧格式URL
  const legacyCheck = handleLegacyUrl(resolvedParams.slug)
  let actualSlug = resolvedParams.slug
  
  if (legacyCheck.isLegacy && legacyCheck.newSlug) {
    console.log('🔄 处理旧格式URL:', {
      oldSlug: resolvedParams.slug,
      newSlug: legacyCheck.newSlug
    })
    // 尝试使用新格式的slug查找内容
    actualSlug = legacyCheck.newSlug
  }
  
  // 🧠 临时禁用简化路由器，使用原有的稳定逻辑
  // try {
  //   const { resolveSimpleRoute } = await import('@/lib/simple-router')
  //   const coloringPageData = await resolveSimpleRoute(actualSlug)
  //   
  //   if (coloringPageData) {
  //     console.log('✅ 简化路由成功:', {
  //       slug: actualSlug,
  //       title: coloringPageData.title
  //     })
  //     
  //     return (
  //       <ColoringPageClient 
  //         coloringPage={coloringPageData}
  //       />
  //     )
  //   }
  // } catch (error) {
  //   console.warn('⚠️ 简化路由失败，降级到原有逻辑:', error)
  // }

  // 🔄 降级到原有逻辑（保持向后兼容）
  let coloringPage: ColoringPageData | null = null
  
  // 🎯 首先尝试从SEO URL存储中查找（通过API调用）
  if (!coloringPage) {
    try {
      const seoResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/seo-url?slug=${encodeURIComponent(actualSlug)}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (seoResponse.ok) {
        const seoResult = await seoResponse.json()
        const seoData = seoResult.data
        
        // 记录SEO缓存命中
        routeMonitor.logSeoCacheHit(actualSlug, seoData.title)
        
        coloringPage = {
          id: seoData.libraryImageId || resolvedParams.slug, // 🎯 优先使用真实图片ID
          slug: resolvedParams.slug,
          title: seoData.title,
          description: seoData.description || `Color the beautiful ${seoData.title} design`,
          imageUrl: seoData.imageUrl,
          thumbnailUrl: seoData.imageUrl,
          printUrl: seoData.imageUrl,
          category: 'Custom',
          tags: seoData.title.toLowerCase().split(' ').filter((word: string) => word.length > 2),
          difficulty: 'medium',
          featured: false,
          createdAt: new Date(),
          metaTitle: `${seoData.title} Coloring Page - Free Printable`,
          metaDescription: `Color the beautiful ${seoData.title} design! Free printable coloring page.`,
          libraryImageId: seoData.libraryImageId // 🎯 保存真实图片ID用于浏览量追踪
        }
        
        console.log('✅ 从SEO存储API中找到页面数据:', {
          slug: resolvedParams.slug,
          title: seoData.title,
          imageUrl: seoData.imageUrl
        })
      } else {
        // 记录SEO缓存未命中
        routeMonitor.logSeoCacheMiss(actualSlug)
        console.log('⚠️ SEO URL存储中未找到数据:', resolvedParams.slug)
      }
    } catch (error) {
      routeMonitor.logError(actualSlug, error instanceof Error ? error : new Error('SEO URL查询失败'), { phase: 'seo_lookup' })
      console.error('❌ SEO URL查询失败:', error)
    }
  }
  
  // 🎯 如果还没找到，尝试从库数据中查找匹配的内容
  if (!coloringPage) {
    try {
      // 尝试通过API获取库数据并匹配slug
      const libraryResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/library-images?limit=100`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (libraryResponse.ok) {
        const libraryResult = await libraryResponse.json()
        const libraryImages = libraryResult.data || []
        
        // 尝试找到匹配的图片
        const matchingImage = libraryImages.find((img: any) => {
          const imageSlug = img.title.toLowerCase()
            .replace(/^hello\s+kitty\s+/i, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-') + '-coloring-pages'
          return imageSlug === actualSlug
        })
        
        if (matchingImage) {
          // 记录库数据匹配
          routeMonitor.logLibraryMatch(actualSlug, matchingImage.id, matchingImage.title)
          
          coloringPage = {
            id: matchingImage.id,
            slug: actualSlug,
            title: matchingImage.title,
            description: matchingImage.description || `Color the beautiful ${matchingImage.title} design`,
            imageUrl: matchingImage.imageUrl,
            thumbnailUrl: matchingImage.thumbnailUrl || matchingImage.imageUrl,
            printUrl: matchingImage.imageUrl,
            category: matchingImage.category,
            tags: matchingImage.tags || [],
            difficulty: matchingImage.difficulty || 'medium',
            featured: matchingImage.isFeatured || false,
            createdAt: new Date(matchingImage.createdAt),
            metaTitle: `${matchingImage.title} - Coloring Pages Printable | Free Download`,
            metaDescription: `Color the beautiful ${matchingImage.title} design! Free printable coloring page.`,
            libraryImageId: matchingImage.id
          }
          
          console.log('✅ 从库数据中找到匹配的图片:', {
            slug: actualSlug,
            title: matchingImage.title,
            id: matchingImage.id
          })
        }
      }
    } catch (error) {
      console.error('❌ 库数据查询失败:', error)
    }
  }

  // 🎯 如果还没找到且URL参数中有真实图片信息，使用URL参数
  if (!coloringPage && resolvedSearchParams.imageUrl && resolvedSearchParams.title) {
    const realImageUrl = Array.isArray(resolvedSearchParams.imageUrl) 
      ? resolvedSearchParams.imageUrl[0] 
      : resolvedSearchParams.imageUrl
    const realTitle = Array.isArray(resolvedSearchParams.title) 
      ? resolvedSearchParams.title[0] 
      : resolvedSearchParams.title
    const realDescription = resolvedSearchParams.description
      ? (Array.isArray(resolvedSearchParams.description) 
          ? resolvedSearchParams.description[0] 
          : resolvedSearchParams.description)
      : undefined
    
    // 创建真实数据的着色页面
    coloringPage = {
      id: resolvedParams.slug,
      slug: resolvedParams.slug,
      title: realTitle,
      description: realDescription || `Color the beautiful ${realTitle} design`,
      imageUrl: realImageUrl,
      thumbnailUrl: realImageUrl,
      printUrl: realImageUrl,
      category: 'Custom',
      tags: realTitle.toLowerCase().split(' ').filter((word: string) => word.length > 2),
      difficulty: 'medium',
      featured: false,
      createdAt: new Date(),
      metaTitle: `${realTitle} Coloring Page - Free Printable`,
      metaDescription: `Color the beautiful ${realTitle} design! Free printable coloring page.`
    }
    
    console.log('✅ 使用URL参数中的真实图片数据:', {
      slug: resolvedParams.slug,
      title: realTitle,
      imageUrl: realImageUrl,
      description: realDescription
    })
  } 
  // 处理旧URL重定向
  else if (!coloringPage) {
    const newSlug = mapLegacySlugToNew(resolvedParams.slug)
    if (newSlug) {
      coloringPage = getColoringPageBySlug(newSlug)
    }
  }
  
  // 如果还是找不到页面，显示404
  if (!coloringPage) {
    routeMonitor.logNotFound(actualSlug, { 
      reason: 'no_data_source_found',
      searchedSlug: actualSlug,
      originalSlug: resolvedParams.slug,
      wasLegacy: legacyCheck.isLegacy
    }, userAgent)
    notFound()
  }
  
  console.log('✅ 最终着色页面数据:', {
    slug: resolvedParams.slug,
    id: coloringPage.id,
    title: coloringPage.title,
    imageUrl: coloringPage.imageUrl
  })
  
  return (
    <ColoringPageClient 
      coloringPage={coloringPage}
    />
  )
}