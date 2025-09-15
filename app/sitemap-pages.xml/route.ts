import { NextResponse } from 'next/server'

// Main pages sitemap (static + high-priority dynamic pages)
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coloringpagesprintable.net'
    const currentDate = new Date().toISOString()
    
    // High-priority static pages for maximum SEO value
    const pages = [
      {
        url: `${baseUrl}/`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 1.0,
        description: 'Homepage - Free Printable Coloring Pages'
      },
      {
        url: `${baseUrl}/library`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
        description: 'Main Library - All Coloring Pages'
      },
      {
        url: `${baseUrl}/fairy`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
        description: 'Fairy Coloring Pages Collection'
      },
      {
        url: `${baseUrl}/fairy-princess-coloring-pages`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
        description: 'Fairy Princess Coloring Pages'
      },
      {
        url: `${baseUrl}/tooth-fairy-coloring-pages`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
        description: 'Tooth Fairy Coloring Pages'
      },
      {
        url: `${baseUrl}/create`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
        description: 'Create Custom Coloring Pages'
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
        description: 'Coloring Tips and Guides Blog'
      },
      {
        url: `${baseUrl}/community`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.5,
        description: 'Community Coloring Gallery'
      }
    ]

    // Generate clean, SEO-optimized sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <!-- ${page.description} -->
  <url>
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
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Force cache refresh
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Robots-Tag': 'noindex',
        'Last-Modified': currentDate,
      },
    })

  } catch (error) {
    console.error('Pages sitemap generation error:', error)
    return new NextResponse('Pages sitemap generation failed', { status: 500 })
  }
}