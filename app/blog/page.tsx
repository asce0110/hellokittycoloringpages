import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, ArrowRight, Star } from 'lucide-react'
import { getAllPosts, getFeaturedPosts } from '@/lib/blog/blog-utils'

export const metadata: Metadata = {
  title: 'Coloring Tips & Creativity Blog | Coloring Pages Printable',
  description: 'Expert coloring tips, creative techniques, and printable coloring page inspiration. Enhance your coloring skills with our comprehensive guides and tutorials.',
  keywords: 'coloring tips, coloring techniques, printable coloring pages, coloring tutorials, creative coloring, adult coloring, kids coloring guides',
  openGraph: {
    title: 'Coloring Tips & Creativity Blog',
    description: 'Expert coloring tips and creative techniques for printable coloring pages',
    type: 'website',
    url: 'https://coloringpagesprintable.net/blog',
  }
}

export default function BlogPage() {
  const allPosts = getAllPosts()
  const featuredPosts = getFeaturedPosts()
  
  const categories = Array.from(new Set(allPosts.map(post => post.category)))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Coloring Tips & Creative Inspiration
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Discover expert coloring techniques, creative ideas, and tips to make your printable coloring pages come alive with vibrant colors and artistic flair.
        </p>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Featured Articles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.slice(0, 3).map((post) => (
              <Card key={post.slug} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Featured
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/blog/${post.slug}`}>
                      Read More <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Categories Filter */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/blog">All Posts</Link>
          </Button>
          {categories.map((category) => (
            <Button key={category} asChild variant="outline" size="sm">
              <Link href={`/blog?category=${category}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* All Posts */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Latest Articles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post) => (
            <Card key={post.slug} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  {post.featured && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </div>
                
                {post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.keywords.slice(0, 3).map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/blog/${post.slug}`}>
                    Read More <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Coloring?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Browse our extensive collection of printable coloring pages and put these techniques to practice!
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
    </div>
  )
}