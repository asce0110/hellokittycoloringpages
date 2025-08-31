import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  keywords: string[]
  category: string
  readTime: number
  featured: boolean
  seoTitle: string
  metaDescription: string
  content: string
  relatedPosts?: string[]
}

export interface BlogPostMetadata {
  slug: string
  title: string
  description: string
  date: string
  keywords: string[]
  category: string
  readTime: number
  featured: boolean
  seoTitle: string
  metaDescription: string
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(name => name.endsWith('.mdx') || name.endsWith('.md'))
    .map(name => name.replace(/\.(mdx|md)$/, ''))
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    const fallbackPath = path.join(postsDirectory, `${slug}.md`)
    
    let fileContents: string
    
    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, 'utf8')
    } else if (fs.existsSync(fallbackPath)) {
      fileContents = fs.readFileSync(fallbackPath, 'utf8')
    } else {
      return null
    }

    const { data, content } = matter(fileContents)

    // 计算阅读时间 (基于250字/分钟)
    const wordsPerMinute = 250
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      keywords: data.keywords || [],
      category: data.category || 'general',
      readTime: data.readTime || readTime,
      featured: data.featured || false,
      seoTitle: data.seoTitle || data.title || '',
      metaDescription: data.metaDescription || data.description || '',
      content,
      relatedPosts: data.relatedPosts || []
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export function getAllPosts(): BlogPostMetadata[] {
  const slugs = getAllPostSlugs()
  const posts = slugs
    .map(slug => {
      const post = getPostBySlug(slug)
      if (!post) return null
      
      // 返回元数据，不包含内容
      const { content, ...metadata } = post
      return metadata
    })
    .filter((post): post is BlogPostMetadata => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export function getPostsByCategory(category: string): BlogPostMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.category === category)
}

export function getFeaturedPosts(): BlogPostMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.featured)
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPostMetadata[] {
  const currentPost = getPostBySlug(currentSlug)
  if (!currentPost) return []
  
  const allPosts = getAllPosts()
  
  // 优先返回同类别的文章
  const relatedByCategory = allPosts
    .filter(post => post.slug !== currentSlug && post.category === currentPost.category)
    .slice(0, limit)
  
  // 如果同类别文章不够，用其他文章补充
  if (relatedByCategory.length < limit) {
    const others = allPosts
      .filter(post => 
        post.slug !== currentSlug && 
        post.category !== currentPost.category &&
        !relatedByCategory.some(related => related.slug === post.slug)
      )
      .slice(0, limit - relatedByCategory.length)
    
    return [...relatedByCategory, ...others]
  }
  
  return relatedByCategory
}

export function generateBlogSitemap(): string {
  const posts = getAllPosts()
  const baseUrl = 'https://coloringpagesprintable.net'
  
  const urls = posts.map(post => {
    return `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${urls}
</urlset>`
}