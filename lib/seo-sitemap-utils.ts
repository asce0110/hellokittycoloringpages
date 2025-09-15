// SEO Sitemap Utilities for Coloring Pages Website
// Advanced SEO optimization helpers

export interface SitemapUrl {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  alternates?: {
    languages: {
      [locale: string]: string
    }
  }
}

export interface ImageSitemapEntry {
  pageUrl: string
  images: {
    loc: string
    title: string
    caption: string
    geoLocation?: string
    license?: string
  }[]
}

// SEO-optimized URL generation
export function generateSEOUrl(title: string, id: string, baseUrl: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple consecutive hyphens
    .trim()
    .substring(0, 50) // Limit length for SEO best practices

  // Add SEO keyword suffix
  const seoSlug = `${slug}-coloring-pages`.replace(/^-+|-+$/g, '')
  return `${baseUrl}/${seoSlug}`
}

// Calculate SEO priority based on content type and metrics
export function calculateSEOPriority(
  contentType: 'homepage' | 'category' | 'individual' | 'blog' | 'utility',
  metrics?: {
    viewCount?: number
    shareCount?: number
    isNew?: boolean
    isFeatured?: boolean
  }
): number {
  let basePriority = 0.5

  // Base priority by content type
  switch (contentType) {
    case 'homepage':
      basePriority = 1.0
      break
    case 'category':
      basePriority = 0.8
      break
    case 'individual':
      basePriority = 0.6
      break
    case 'blog':
      basePriority = 0.7
      break
    case 'utility':
      basePriority = 0.3
      break
  }

  // Adjust based on metrics
  if (metrics) {
    if (metrics.isFeatured) basePriority += 0.1
    if (metrics.isNew) basePriority += 0.05
    if (metrics.viewCount && metrics.viewCount > 1000) basePriority += 0.1
    if (metrics.shareCount && metrics.shareCount > 50) basePriority += 0.05
  }

  return Math.min(1.0, Math.max(0.0, basePriority))
}

// Determine change frequency based on content type
export function getChangeFrequency(
  contentType: 'homepage' | 'category' | 'individual' | 'blog' | 'utility',
  isActive: boolean = true
): SitemapUrl['changeFrequency'] {
  if (!isActive) return 'yearly'

  switch (contentType) {
    case 'homepage':
      return 'weekly'
    case 'category':
      return 'weekly'
    case 'individual':
      return 'monthly'
    case 'blog':
      return 'monthly'
    case 'utility':
      return 'yearly'
    default:
      return 'monthly'
  }
}

// Generate XML-safe content
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Generate structured sitemap XML
export function generateSitemapXML(urls: SitemapUrl[]): string {
  const currentDate = new Date().toISOString()
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.url)}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>${url.alternates ? Object.entries(url.alternates.languages).map(([locale, altUrl]) => 
    `\n    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(altUrl)}" />`).join('') : ''}
  </url>`).join('\n')}
</urlset>`
}

// Generate image sitemap XML
export function generateImageSitemapXML(entries: ImageSitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(entry => `  <url>
    <loc>${escapeXml(entry.pageUrl)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>${entry.images.map(image => `
    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>
      <image:title>${escapeXml(image.title)}</image:title>
      <image:caption>${escapeXml(image.caption)}</image:caption>${image.geoLocation ? `
      <image:geo_location>${escapeXml(image.geoLocation)}</image:geo_location>` : ''}${image.license ? `
      <image:license>${escapeXml(image.license)}</image:license>` : ''}
    </image:image>`).join('')}
  </url>`).join('\n')}
</urlset>`
}

// SEO keyword targeting for coloring pages
export const SEO_KEYWORDS = {
  primary: [
    'coloring pages printable',
    'printable coloring pages', 
    'free coloring pages',
    'coloring pages for kids',
    'adult coloring pages'
  ],
  secondary: [
    'fairy coloring pages',
    'hello kitty coloring',
    'princess coloring pages',
    'animal coloring pages',
    'flower coloring pages'
  ],
  longTail: [
    'fairy princess coloring pages printable',
    'tooth fairy coloring pages free',
    'hello kitty drawings to color',
    'printable coloring sheets for kids',
    'free adult coloring pages pdf'
  ]
}

// Generate meta descriptions optimized for SEO
export function generateMetaDescription(
  pageType: string,
  title: string,
  keywords: string[] = []
): string {
  const baseDescriptions = {
    coloring: `Free printable ${title.toLowerCase()}. High-quality coloring pages perfect for kids and adults. Download and print instantly.`,
    category: `Discover our collection of ${title.toLowerCase()} printable coloring pages. Free downloads, perfect for creativity and relaxation.`,
    blog: `Learn about ${title.toLowerCase()}. Expert tips and guides for coloring enthusiasts of all ages.`
  }
  
  const base = baseDescriptions[pageType as keyof typeof baseDescriptions] || baseDescriptions.coloring
  const keywordPhrase = keywords.length > 0 ? ` Features ${keywords.slice(0, 3).join(', ')}.` : ''
  
  return (base + keywordPhrase).substring(0, 155) // SEO meta description limit
}