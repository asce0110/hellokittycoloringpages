"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { convertCurrentUrlToSeo } from '@/lib/seo-url-generator'

/**
 * SEO URL重定向组件
 * 检测带查询参数的URL并自动重定向到SEO友好的URL
 */
export function SeoUrlRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  useEffect(() => {
    // 检查是否有查询参数
    const imageUrl = searchParams.get('imageUrl')
    const title = searchParams.get('title')
    
    // 如果有查询参数，说明是从库页面过来的，需要重定向
    if (imageUrl && title) {
      const currentUrl = `${window.location.origin}${pathname}?${searchParams.toString()}`
      
      console.log('🔄 检测到查询参数URL，准备重定向到SEO友好URL')
      console.log('原始URL:', currentUrl)
      
      try {
        const seoUrl = convertCurrentUrlToSeo(currentUrl)
        console.log('✅ 生成SEO URL:', seoUrl)
        
        // 使用replace而不是push，避免在历史记录中留下ugly URL
        router.replace(seoUrl)
        
        // 显示用户友好的提示
        console.log('🚀 SEO优化：重定向到干净URL')
        
      } catch (error) {
        console.error('❌ SEO URL生成失败:', error)
        // 如果重定向失败，继续使用当前URL（降级处理）
      }
    }
  }, [searchParams, pathname, router])
  
  // 这个组件不渲染任何内容，只负责重定向逻辑
  return null
}

/**
 * 检查当前URL是否为SEO友好格式
 */
export function isSeoFriendlyUrl(pathname: string, searchParams: URLSearchParams): boolean {
  // 如果有查询参数，说明不是SEO友好的
  const hasQueryParams = !!(searchParams.get('imageUrl') || searchParams.get('title'))
  
  // 如果路径包含语义化slug（不是纯数字），说明是SEO友好的
  const pathParts = pathname.split('/')
  const lastPart = pathParts[pathParts.length - 1]
  const isSemanticSlug = !!(lastPart && !(/^\d+$/.test(lastPart)) && lastPart.includes('-'))
  
  return !hasQueryParams && isSemanticSlug
}

/**
 * 生成canonical URL（用于SEO）
 */
export function getCanonicalUrl(pathname: string, searchParams: URLSearchParams): string {
  if (isSeoFriendlyUrl(pathname, searchParams)) {
    // 已经是SEO友好URL，直接返回
    return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${pathname}`
  } else {
    // 需要转换为SEO友好URL
    const imageUrl = searchParams.get('imageUrl')
    const title = searchParams.get('title')
    
    if (imageUrl && title) {
      const currentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${pathname}?${searchParams.toString()}`
      try {
        const seoUrl = convertCurrentUrlToSeo(currentUrl)
        return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${seoUrl}`
      } catch (error) {
        console.error('❌ 生成canonical URL失败:', error)
        return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${pathname}`
      }
    }
    
    return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${pathname}`
  }
}