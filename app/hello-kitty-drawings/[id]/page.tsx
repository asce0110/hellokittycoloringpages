import { Metadata } from "next"
import { notFound } from "next/navigation"
import { 
  getHelloKittyDrawingById, 
  getAllHelloKittyDrawingIds,
  generateStructuredData,
  getIdFromLegacySlug,
  createDynamicHelloKittyDrawing
} from "@/lib/hello-kitty-drawings"
import { getDataBySlug, generateMetaTitle, generateMetaDescription, generateStructuredData as generateSeoStructuredData } from "@/lib/seo-url-generator"
import { parseSlugToBasicInfo, generateFallbackDrawingData, generateSeoMetaFromSlug, detectSlugType } from "@/lib/seo-slug-parser"
import { reconstructDataFromSlug, validateReconstructedData } from "@/lib/seo-url-reconstructor"
import { HelloKittyDrawingClient } from "./hello-kitty-drawing-client"

interface HelloKittyDrawingPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 静态生成所有Hello Kitty Drawings
export async function generateStaticParams() {
  const ids = getAllHelloKittyDrawingIds()
  
  // 只为数字ID生成静态页面
  // 语义化slug将使用动态路由处理
  return ids.map((id) => ({
    id: id.toString(),
  }))
}

// 启用动态路由支持，允许访问未预生成的slug
export const dynamicParams = true

// 生成SEO优化的metadata
export async function generateMetadata({ params, searchParams }: HelloKittyDrawingPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  let drawing = null
  
  // 🎯 最高优先级：从服务器获取SEO映射数据
  try {
    const seoResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/seo-url?slug=${resolvedParams.id}`, {
      cache: 'no-store' // 确保获取最新数据
    })
    
    if (seoResponse.ok) {
      const seoResult = await seoResponse.json()
      if (seoResult.success && seoResult.data) {
        drawing = createDynamicHelloKittyDrawing(
          seoResult.data.title,
          seoResult.data.imageUrl,
          seoResult.data.description,
          parseInt(resolvedParams.id.slice(-6)) || 999999
        )
        console.log('✅ 使用服务器SEO映射数据 (metadata):', {
          slug: resolvedParams.id,
          title: seoResult.data.title,
          imageUrl: seoResult.data.imageUrl.substring(0, 50) + '...'
        })
      }
    }
  } catch (error) {
    console.log('⚠️ 获取SEO映射失败，尝试其他方案:', error)
  }
  
  // 🔄 降级：检查URL参数中的真实数据
  if (!drawing && resolvedSearchParams.imageUrl && resolvedSearchParams.title) {
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
    
    drawing = createDynamicHelloKittyDrawing(
      realTitle,
      realImageUrl, 
      realDescription,
      parseInt(resolvedParams.id) || 999999
    )
    console.log('✅ 使用URL参数中的真实图片数据 (metadata):', {
      slug: resolvedParams.id,
      title: realTitle,
      imageUrl: realImageUrl.substring(0, 50) + '...'
    })
  }
  // 🚀 备用：检查是否为SEO友好的slug格式
  else if (getDataBySlug(resolvedParams.id)) {
    const seoData = getDataBySlug(resolvedParams.id)!
    // 使用SEO URL存储的数据
    drawing = createDynamicHelloKittyDrawing(
      seoData.title,
      seoData.imageUrl,
      seoData.description,
      parseInt(seoData.originalId || '999999')
    )
    console.log('✅ 使用SEO slug数据 (metadata):', {
      slug: resolvedParams.id,
      title: seoData.title,
      imageUrl: seoData.imageUrl.substring(0, 50) + '...'
    })
  }
  // 🔄 如果没有存储数据，但是是语义化slug，尝试重建真实数据
  else if (detectSlugType(resolvedParams.id) === 'semantic') {
    const reconstructedData = reconstructDataFromSlug(resolvedParams.id)
    
    if (reconstructedData.imageUrl && validateReconstructedData(reconstructedData)) {
      // 使用重建的真实图片数据
      drawing = createDynamicHelloKittyDrawing(
        reconstructedData.title,
        reconstructedData.imageUrl,
        reconstructedData.description,
        parseInt(Date.now().toString().slice(-6)) // 临时ID
      )
      console.log('✅ 使用重建的真实图片数据 (metadata):', {
        slug: resolvedParams.id,
        title: reconstructedData.title,
        imageUrl: reconstructedData.imageUrl.substring(0, 50) + '...',
        isReconstructed: reconstructedData.isReconstructed
      })
    } else {
      // 如果无法重建，使用回退数据
      const fallbackData = generateFallbackDrawingData(resolvedParams.id)
      drawing = createDynamicHelloKittyDrawing(
        fallbackData.title,
        fallbackData.imageUrl,
        fallbackData.description,
        fallbackData.id
      )
      console.log('🔄 使用语义化slug回退数据 (metadata):', {
        slug: resolvedParams.id,
        title: fallbackData.title,
        imageUrl: fallbackData.imageUrl
      })
    }
  }
  // 如果没有URL参数，尝试按数字ID查找模拟数据
  else {
    drawing = getHelloKittyDrawingById(parseInt(resolvedParams.id))
    
    // 如果仍然没找到，尝试legacy slug映射
    if (!drawing) {
      const legacyId = getIdFromLegacySlug(resolvedParams.id)
      if (legacyId) {
        drawing = getHelloKittyDrawingById(legacyId)
      }
    }
  }
  
  if (!drawing) {
    return {
      title: "Hello Kitty Drawing Not Found | AI Kitty Creator",
      description: "The requested Hello Kitty drawing could not be found.",
    }
  }
  
  return {
    title: drawing.metaTitle || `Hello Kitty Drawings #${drawing.id} - ${drawing.title} | Free Printable`,
    description: drawing.metaDescription || drawing.description,
    keywords: drawing.keywords?.join(', ') || drawing.tags.join(', '),
    openGraph: {
      title: `Hello Kitty Drawings #${drawing.id} - ${drawing.title}`,
      description: drawing.description,
      images: [
        {
          url: drawing.thumbnailUrl || drawing.imageUrl,
          width: 1024,
          height: 1024,
          alt: drawing.title,
        },
      ],
      type: 'article',
      siteName: 'AI Kitty Creator - Hello Kitty Drawings'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Hello Kitty Drawings #${drawing.id} - ${drawing.title}`,
      description: drawing.description,
      images: [drawing.thumbnailUrl || drawing.imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  }
}

export default async function HelloKittyDrawingPage({ params, searchParams }: HelloKittyDrawingPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  let drawing = null
  let structuredData = null
  
  // 🎯 最高优先级：从服务器获取SEO映射数据  
  try {
    const seoResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/seo-url?slug=${resolvedParams.id}`, {
      cache: 'no-store' // 确保获取最新数据
    })
    
    if (seoResponse.ok) {
      const seoResult = await seoResponse.json()
      if (seoResult.success && seoResult.data) {
        drawing = createDynamicHelloKittyDrawing(
          seoResult.data.title,
          seoResult.data.imageUrl,
          seoResult.data.description,
          parseInt(resolvedParams.id.slice(-6)) || 999999
        )
        
        // 使用SEO优化的结构化数据
        structuredData = generateSeoStructuredData({
          slug: resolvedParams.id,
          title: seoResult.data.title,
          imageUrl: seoResult.data.imageUrl,
          description: seoResult.data.description
        })
        
        console.log('✅ 使用服务器SEO映射数据 (页面组件):', {
          slug: resolvedParams.id,
          title: seoResult.data.title,
          imageUrl: seoResult.data.imageUrl.substring(0, 50) + '...'
        })
      }
    }
  } catch (error) {
    console.log('⚠️ 获取SEO映射失败，尝试其他方案:', error)
  }
  
  // 🔄 降级：检查URL参数中的真实数据
  if (!drawing && resolvedSearchParams.imageUrl && resolvedSearchParams.title) {
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
    
    drawing = createDynamicHelloKittyDrawing(
      realTitle,
      realImageUrl, 
      realDescription,
      parseInt(resolvedParams.id) || 999999
    )
    
    // 使用SEO优化的结构化数据
    structuredData = generateSeoStructuredData({
      slug: resolvedParams.id,
      title: decodeURIComponent(realTitle),
      imageUrl: decodeURIComponent(realImageUrl),
      description: realDescription ? decodeURIComponent(realDescription) : undefined
    })
    
    console.log('✅ 使用URL参数中的真实图片数据 (页面组件):', {
      slug: resolvedParams.id,
      title: realTitle,
      imageUrl: realImageUrl.substring(0, 50) + '...'
    })
  }
  // 🚀 备用：检查是否为SEO友好的slug格式
  else if (getDataBySlug(resolvedParams.id)) {
    const seoData = getDataBySlug(resolvedParams.id)!
    // 使用SEO URL存储的数据
    drawing = createDynamicHelloKittyDrawing(
      seoData.title,
      seoData.imageUrl,
      seoData.description,
      parseInt(seoData.originalId || '999999')
    )
    
    // 使用SEO优化的结构化数据
    structuredData = generateSeoStructuredData(seoData)
    
    console.log('✅ 使用SEO slug数据 (页面组件):', {
      slug: resolvedParams.id,
      title: seoData.title,
      imageUrl: seoData.imageUrl.substring(0, 50) + '...'
    })
  }
  // 🔄 如果没有存储数据，但是是语义化slug，尝试重建真实数据
  else if (detectSlugType(resolvedParams.id) === 'semantic') {
    const reconstructedData = reconstructDataFromSlug(resolvedParams.id)
    
    if (reconstructedData.imageUrl && validateReconstructedData(reconstructedData)) {
      // 使用重建的真实图片数据
      drawing = createDynamicHelloKittyDrawing(
        reconstructedData.title,
        reconstructedData.imageUrl,
        reconstructedData.description,
        parseInt(Date.now().toString().slice(-6)) // 临时ID
      )
      
      // 使用SEO优化的结构化数据
      structuredData = generateSeoStructuredData({
        slug: resolvedParams.id,
        title: reconstructedData.title,
        imageUrl: reconstructedData.imageUrl,
        description: reconstructedData.description
      })
      
      console.log('✅ 使用重建的真实图片数据 (页面组件):', {
        slug: resolvedParams.id,
        title: reconstructedData.title,
        imageUrl: reconstructedData.imageUrl.substring(0, 50) + '...',
        isReconstructed: reconstructedData.isReconstructed
      })
    } else {
      // 如果无法重建，使用回退数据
      const fallbackData = generateFallbackDrawingData(resolvedParams.id)
      drawing = createDynamicHelloKittyDrawing(
        fallbackData.title,
        fallbackData.imageUrl,
        fallbackData.description,
        fallbackData.id
      )
      
      // 使用SEO优化的结构化数据
      structuredData = generateSeoStructuredData({
        slug: resolvedParams.id,
        title: fallbackData.title,
        imageUrl: fallbackData.imageUrl,
        description: fallbackData.description
      })
      
      console.log('🔄 使用语义化slug回退数据 (页面组件):', {
        slug: resolvedParams.id,
        title: fallbackData.title,
        imageUrl: fallbackData.imageUrl
      })
    }
  }
  // 如果没有URL参数，尝试按数字ID查找模拟数据
  else {
    drawing = getHelloKittyDrawingById(parseInt(resolvedParams.id))
    
    // 如果仍然没找到，尝试legacy slug映射
    if (!drawing) {
      const legacyId = getIdFromLegacySlug(resolvedParams.id)
      if (legacyId) {
        drawing = getHelloKittyDrawingById(legacyId)
      }
    }
    
    if (drawing) {
      console.log('⚠️ 使用模拟数据，因为没有URL参数:', {
        id: resolvedParams.id,
        title: drawing.title,
        imageUrl: drawing.imageUrl
      })
    }
  }
  
  // 如果还是找不到页面，显示404
  if (!drawing) {
    notFound()
  }
  
  console.log('✅ Hello Kitty Drawing页面数据:', {
    id: drawing.id,
    title: drawing.title,
    imageUrl: drawing.imageUrl
  })
  
  // 生成结构化数据（如果还没有SEO结构化数据的话）
  if (!structuredData) {
    structuredData = generateStructuredData(drawing)
  }
  
  return (
    <>
      {/* JSON-LD结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <HelloKittyDrawingClient 
        drawing={drawing}
      />
    </>
  )
}