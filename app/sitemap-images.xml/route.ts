import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Image-specific sitemap for Google Images SEO
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coloringpagesprintable.net'
    const currentDate = new Date().toISOString()
    
    const imagePages: any[] = []
    
    try {
      if (supabaseAdmin) {
        // Get library images with metadata
        const { data: libraryImages, error } = await supabaseAdmin
          .from('library_images')
          .select('id, title, description, image_url, thumbnail_url, tags, category, difficulty, updated_at, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(500) // Reasonable limit for image sitemap

        if (!error && libraryImages) {
          libraryImages.forEach((image: any) => {
            const slug = generateSEOSlug(image.title, image.id)
            const pageUrl = `${baseUrl}/${slug}`
            
            // Ensure image URLs are absolute
            const imageUrl = image.image_url.startsWith('http') 
              ? image.image_url 
              : `${baseUrl}${image.image_url}`
            const thumbnailUrl = image.thumbnail_url?.startsWith('http')
              ? image.thumbnail_url
              : `${baseUrl}${image.thumbnail_url || image.image_url}`

            imagePages.push({
              pageUrl,
              imageUrl,
              thumbnailUrl,
              title: image.title,
              description: image.description || `Free printable ${image.title.toLowerCase()} coloring page`,
              caption: `${image.title} - Free Printable Coloring Page`,
              geoLocation: 'United States', // Adjust based on target market
              license: 'https://creativecommons.org/licenses/by/4.0/', // Adjust based on your licensing
              lastModified: image.updated_at || image.created_at,
              tags: image.tags.join(', '),
              category: image.category,
              difficulty: image.difficulty
            })
          })
        }
      }
    } catch (dbError) {
      console.warn('Database query failed for image sitemap:', dbError)
      
      // Fallback: Add some static image entries
      const fallbackImages = [
        { title: 'Hello Kitty Coloring Page', url: '/hello-kitty-coloring-page.png' },
        { title: 'Astronaut Cat Coloring Page', url: '/astronaut-cat-coloring-page.png' },
        { title: 'Cute Kitty Coloring Page', url: '/cute-kitty-coloring-page.png' }
      ]
      
      fallbackImages.forEach((img, index) => {
        const slug = generateSEOSlug(img.title, `fallback-${index}`)
        imagePages.push({
          pageUrl: `${baseUrl}/${slug}`,
          imageUrl: `${baseUrl}${img.url}`,
          thumbnailUrl: `${baseUrl}${img.url}`,
          title: img.title,
          description: `Free printable ${img.title.toLowerCase()}`,
          caption: `${img.title} - Free Printable`,
          lastModified: currentDate,
          tags: 'coloring page, printable, free',
          category: 'general',
          difficulty: 'easy'
        })
      })
    }

    // Generate image sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imagePages.map(page => `  <url>
    <loc>${page.pageUrl}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${page.imageUrl}</image:loc>
      <image:title>${escapeXml(page.title)}</image:title>
      <image:caption>${escapeXml(page.caption)}</image:caption>
      <image:geo_location>${page.geoLocation || 'United States'}</image:geo_location>
      <image:license>${page.license || 'https://creativecommons.org/licenses/by/4.0/'}</image:license>
    </image:image>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'X-Robots-Tag': 'noindex',
      },
    })

  } catch (error) {
    console.error('Image sitemap generation error:', error)
    return new NextResponse('Image sitemap generation failed', { status: 500 })
  }
}

// Generate SEO-friendly slug
function generateSEOSlug(title: string, id: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 60)
  
  return `${baseSlug}-coloring-pages`.replace(/^-+|-+$/g, '')
}

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}