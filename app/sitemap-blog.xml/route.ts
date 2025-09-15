import { NextResponse } from 'next/server'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

// Blog-specific sitemap for better SEO organization
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coloringpagesprintable.net'
    
    // Get blog posts from content directory
    const blogPosts: any[] = []
    
    try {
      const contentDir = join(process.cwd(), 'content', 'blog')
      const files = readdirSync(contentDir)
      
      files
        .filter(file => file.endsWith('.mdx'))
        .forEach(file => {
          try {
            const filePath = join(contentDir, file)
            const fileContent = readFileSync(filePath, 'utf8')
            const { data: frontMatter } = matter(fileContent)
            
            const slug = file.replace('.mdx', '')
            
            blogPosts.push({
              url: `${baseUrl}/blog/${slug}`,
              lastModified: frontMatter.updatedAt || frontMatter.publishedAt || new Date().toISOString(),
              changeFrequency: 'monthly',
              priority: frontMatter.featured ? 0.8 : 0.6,
              title: frontMatter.title,
              description: frontMatter.description
            })
          } catch (fileError) {
            console.warn(`Error processing blog file ${file}:`, fileError)
          }
        })
    } catch (dirError) {
      console.warn('Blog content directory not found:', dirError)
      
      // Fallback: Add known blog posts
      const knownPosts = [
        'printable-coloring-pages-benefits',
        'complete-guide-printable-coloring-pages-beginners', 
        'educational-benefits-printable-coloring-pages-children',
        'age-appropriate-coloring-pages-guide-printable',
        'coloring-techniques-beginners',
        'creative-coloring-techniques-tools-printable-pages',
        'printable-vs-digital-coloring-pages-comparison'
      ]
      
      knownPosts.forEach(slug => {
        blogPosts.push({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'monthly',
          priority: 0.6
        })
      })
    }

    // Sort by priority and date
    blogPosts.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    })

    // Generate blog-specific sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- Blog index page -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
${blogPosts.map(post => `  <!-- Blog post: ${post.title || 'Blog post'} -->
  <url>
    <loc>${post.url}</loc>
    <lastmod>${post.lastModified}</lastmod>
    <changefreq>${post.changeFrequency}</changefreq>
    <priority>${post.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=7200, s-maxage=7200', // Cache for 2 hours
        'X-Robots-Tag': 'noindex',
      },
    })

  } catch (error) {
    console.error('Blog sitemap generation error:', error)
    return new NextResponse('Blog sitemap generation failed', { status: 500 })
  }
}