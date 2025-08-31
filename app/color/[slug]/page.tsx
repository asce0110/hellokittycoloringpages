import { redirect, permanentRedirect } from "next/navigation"

interface ColorRedirectPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * 旧的 /color/[slug] 路由重定向到新的 /[slug] 格式
 * 实现301永久重定向以保持SEO权重
 */
export default async function ColorRedirectPage({ params, searchParams }: ColorRedirectPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  // 构建重定向URL
  let redirectUrl = `/${resolvedParams.slug}`
  
  // 保留查询参数
  const searchParamsString = new URLSearchParams()
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParamsString.append(key, v))
      } else {
        searchParamsString.set(key, value)
      }
    }
  })
  
  if (searchParamsString.toString()) {
    redirectUrl += `?${searchParamsString.toString()}`
  }
  
  console.log('🔄 重定向旧URL:', {
    from: `/color/${resolvedParams.slug}`,
    to: redirectUrl
  })
  
  // 使用301永久重定向
  permanentRedirect(redirectUrl)
}