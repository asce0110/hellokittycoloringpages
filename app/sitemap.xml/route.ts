import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// SEO-optimized sitemap generation for coloring pages website
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coloringpagesprintable.net'
    const currentDate = new Date().toISOString()
    
    // Core static pages with SEO priority
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 1.0
      },
      {
        url: `${baseUrl}/library`,
        lastModified: currentDate,
        changeFrequency: 'daily', 
        priority: 0.9
      },
      {
        url: `${baseUrl}/fairy`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/fairy-princess-coloring-pages`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/tooth-fairy-coloring-pages`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/create`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/community`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: 0.3
      }
    ]

    // Dynamic content from database
    let dynamicPages: any[] = []
    
    try {
      // Get library images for dynamic SEO URLs
      if (supabaseAdmin) {
        const { data: libraryImages, error } = await supabaseAdmin
          .from('library_images')
          .select('id, title, updated_at, created_at, tags, category')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1000) // Reasonable limit for sitemap

        if (!error && libraryImages) {
          // Generate SEO-friendly URLs for each coloring page
          libraryImages.forEach((image: any) => {
            const slug = generateSEOSlug(image.title, image.id)
            dynamicPages.push({
              url: `${baseUrl}/${slug}`,
              lastModified: image.updated_at || image.created_at,
              changeFrequency: 'monthly',
              priority: 0.6
            })
          })
        }

        // Get blog posts
        const { data: blogPosts, error: blogError } = await supabaseAdmin
          .from('blog_posts') // Assuming you have blog posts table
          .select('slug, updated_at, created_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(100)

        if (!blogError && blogPosts) {
          blogPosts.forEach((post: any) => {
            dynamicPages.push({
              url: `${baseUrl}/blog/${post.slug}`,
              lastModified: post.updated_at || post.created_at,
              changeFrequency: 'monthly',
              priority: 0.5
            })
          })
        }

        // Hello Kitty drawings section removed
        
      }
    } catch (dbError) {
      console.warn('Database query failed for sitemap, using static content only:', dbError)
      
      // Fallback: No additional static pages needed
    }

    // Combine all pages
    const allPages = [...staticPages, ...dynamicPages]

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'X-Robots-Tag': 'noindex', // Don't index the sitemap itself
      },
    })

  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Sitemap generation failed', { status: 500 })
  }
}

// Generate SEO-friendly slug from title and ID
function generateSEOSlug(title: string, id: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 60) // Limit length for SEO
  
  // Add "coloring-pages" suffix for SEO keyword targeting
  return `${baseSlug}-coloring-pages`.replace(/^-+|-+$/g, '') // Clean up edges
}

