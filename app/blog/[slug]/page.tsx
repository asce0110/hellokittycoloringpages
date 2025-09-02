import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react'
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/blog/blog-utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `https://coloringpagesprintable.net/blog/${slug}`,
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    }
  }
}

function renderMarkdownContent(content: string) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 pl-6 space-y-2 list-disc text-gray-700 dark:text-gray-300">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 pl-6 space-y-2 list-decimal text-gray-700 dark:text-gray-300">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-gray-600 dark:text-gray-400">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          if (className?.includes('language-')) {
            return (
              <code className={`block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm ${className}`}>
                {children}
              </code>
            )
          }
          return (
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug, 3)

  // 构建结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "author": {
      "@type": "Organization",
      "name": "Coloring Pages Printable"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Coloring Pages Printable",
      "url": "https://coloringpagesprintable.net"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "url": `https://coloringpagesprintable.net/blog/${slug}`,
    "keywords": post.keywords.join(", "),
    "articleSection": post.category,
    "wordCount": post.content.split(/\s+/).length,
    "timeRequired": `PT${post.readTime}M`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://coloringpagesprintable.net/blog/${slug}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back to Blog */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <article className="mb-12">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              {post.featured && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Featured
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {post.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min read</span>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            {post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
            
            <Separator />
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300">
            {renderMarkdownContent(post.content)}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.slug} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {relatedPost.category}
                    </Badge>
                    <CardTitle className="text-base line-clamp-2">
                      <Link href={`/blog/${relatedPost.slug}`} className="hover:text-primary">
                        {relatedPost.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                      {relatedPost.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(relatedPost.date).toLocaleDateString()}</span>
                      <span>{relatedPost.readTime} min</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-8">
          <h2 className="text-xl font-bold mb-4">Ready to Start Coloring?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Put these tips into practice with our collection of printable coloring pages!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/library">Browse Coloring Pages</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/create">Create Custom Pages</Link>
            </Button>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/blog">
              View All Articles <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}