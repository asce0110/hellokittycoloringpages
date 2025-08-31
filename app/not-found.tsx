"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BowIcon } from "@/components/icons/bow-icon"
import { Heart, Home, Library, Sparkles, ArrowLeft, Search } from "lucide-react"
import { useEffect, useState } from "react"

// 404 Page Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Not Found - Coloring Pages Printable",
  "description": "This page was not found. Explore our library of printable coloring pages or browse our collection.",
  "url": typeof window !== 'undefined' ? window.location.href : '',
  "mainEntity": {
    "@type": "Thing",
    "name": "404 Error",
    "description": "The requested page could not be found."
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://coloringpagesprintable.net"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Page Not Found",
        "item": "https://aikittycreator.com/404"
      }
    ]
  }
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  const [sparkleAnimation, setSparkleAnimation] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Set proper document title and meta tags for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Page Not Found (404) - Coloring Pages Printable | Free Printable Coloring Pages'
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Oops! This page could not be found! Explore our library of free printable coloring pages or browse our collection.')
      }
      
      // Add robots meta tag
      let robotsMeta = document.querySelector('meta[name="robots"]')
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta')
        robotsMeta.setAttribute('name', 'robots')
        robotsMeta.setAttribute('content', 'noindex, follow')
        document.head.appendChild(robotsMeta)
      } else {
        robotsMeta.setAttribute('content', 'noindex, follow')
      }
    }
    
    // Trigger sparkle animation periodically
    const interval = setInterval(() => {
      setSparkleAnimation(true)
      setTimeout(() => setSparkleAnimation(false), 1000)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Structured Data for SEO */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-background to-blue-50 dark:from-background dark:via-card dark:to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-8 h-8 bg-primary/20 rounded-full animate-bounce delay-100" />
        <div className="absolute top-32 right-20 w-6 h-6 bg-secondary/20 rounded-full animate-bounce delay-300" />
        <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-primary/30 rounded-full animate-bounce delay-500" />
        <div className="absolute bottom-40 right-1/3 w-10 h-10 bg-secondary/20 rounded-full animate-bounce delay-700" />
        
        {/* Floating Hearts */}
        <div className="absolute top-1/4 left-1/4 animate-fade-in-out delay-1000">
          <Heart className="w-4 h-4 text-primary/40" fill="currentColor" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-fade-in-out delay-2000">
          <Heart className="w-3 h-3 text-primary/30" fill="currentColor" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-fade-in-out delay-3000">
          <Heart className="w-5 h-5 text-secondary/40" fill="currentColor" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-2xl w-full space-y-8 text-center">
          
          {/* Hello Kitty 404 Illustration */}
          <div className="relative">
            <Card className="border-0 bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="relative flex flex-col items-center space-y-6">
                  
                  {/* Large 404 with Hello Kitty styling */}
                  <div className="relative">
                    <h1 className="text-8xl md:text-9xl font-black text-transparent bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text leading-none">
                      404
                    </h1>
                    
                    {/* Hello Kitty Bow */}
                    <div className="absolute -top-4 right-4 transform rotate-12">
                      <BowIcon className="w-16 h-16 text-primary animate-bounce" aria-label="Hello Kitty bow decoration" />
                    </div>
                    
                    {/* Sparkles */}
                    <div className={`absolute -top-6 left-8 transition-all duration-1000 ${sparkleAnimation ? 'scale-110 rotate-180' : 'scale-100 rotate-0'}`}>
                      <Sparkles className="w-8 h-8 text-secondary animate-pulse" aria-label="Sparkle decoration" />
                    </div>
                    <div className={`absolute -bottom-4 right-12 transition-all duration-1000 ${sparkleAnimation ? 'scale-110 -rotate-90' : 'scale-100 rotate-0'}`}>
                      <Sparkles className="w-6 h-6 text-primary animate-pulse delay-500" aria-label="Sparkle decoration" />
                    </div>
                  </div>

                  {/* Cute Message */}
                  <div className="space-y-3">
                    <Badge variant="secondary" className="px-4 py-2 text-sm font-medium" role="status" aria-live="polite">
                      <Heart className="w-4 h-4 mr-2" fill="currentColor" aria-label="Heart icon" />
                      Oops! Hello Kitty got lost
                    </Badge>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      Page Not Found
                    </h2>
                    
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                      This page seems to have wandered off to play with Hello Kitty! 
                      Don't worry, we'll help you find your way back to the magical world of coloring pages and creative fun.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Content Suggestions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Popular Hello Kitty Coloring Pages</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="outline" className="text-sm hover:bg-primary/10 transition-colors">
                <Link href="/library" className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" fill="currentColor" />
                  <span>Birthday Party</span>
                </Link>
              </Badge>
              <Badge variant="outline" className="text-sm hover:bg-primary/10 transition-colors">
                <Link href="/library" className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Princess Kitty</span>
                </Link>
              </Badge>
              <Badge variant="outline" className="text-sm hover:bg-primary/10 transition-colors">
                <Link href="/library" className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" fill="currentColor" />
                  <span>Cute Outfits</span>
                </Link>
              </Badge>
              <Badge variant="outline" className="text-sm hover:bg-primary/10 transition-colors">
                <Link href="/library" className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Easy Drawing</span>
                </Link>
              </Badge>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Go Home */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-primary/20 hover:border-primary/40">
              <CardContent className="p-6">
                <Link href="/" className="flex flex-col items-center space-y-3 text-center" aria-label="Go to homepage">
                  <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Home className="w-6 h-6 text-primary" aria-label="Home icon" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Go Home</h3>
                    <p className="text-sm text-muted-foreground">Discover featured content</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Browse Library */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-secondary/20 hover:border-secondary/40">
              <CardContent className="p-6">
                <Link href="/library" className="flex flex-col items-center space-y-3 text-center" aria-label="Browse coloring page library">
                  <div className="p-3 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition-colors">
                    <Library className="w-6 h-6 text-secondary" aria-label="Library icon" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Browse Library</h3>
                    <p className="text-sm text-muted-foreground">1000+ free coloring pages</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Create with AI */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-primary/20 hover:border-primary/40 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <Link href="/create" className="flex flex-col items-center space-y-3 text-center" aria-label="Create custom coloring pages with AI">
                  <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                    <Sparkles className="w-6 h-6 text-primary" aria-label="AI creation icon" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Create with AI</h3>
                    <p className="text-sm text-muted-foreground">Custom Hello Kitty art</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Additional Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="outline" 
              asChild
              className="group transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Link href="/" className="flex items-center space-x-2" aria-label="Go back to homepage">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-label="Back arrow" />
                <span>Go Back</span>
              </Link>
            </Button>
            
            <Button 
              asChild
              className="group transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <Link href="/library" className="flex items-center space-x-2" aria-label="Find and explore coloring pages">
                <Search className="w-4 h-4" aria-label="Search icon" />
                <span>Find Coloring Pages</span>
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" aria-label="Sparkle decoration" />
              </Link>
            </Button>
          </div>

          {/* Help Section */}
          <div className="pt-6">
            <Card className="bg-muted/50 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Need Help Finding Something?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try searching our library or browse by category. All our coloring pages are free to download and print!
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/library">Browse All Categories</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/hello-kitty-drawings">Hello Kitty Collection</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cute Footer Message */}
          <div className="pt-8 text-center">
            <p className="text-sm text-muted-foreground/80 flex items-center justify-center space-x-2">
              <Heart className="w-4 h-4 text-primary animate-pulse" fill="currentColor" aria-label="Heart decoration" />
              <span>Made with love for Hello Kitty fans everywhere</span>
              <Heart className="w-4 h-4 text-primary animate-pulse delay-500" fill="currentColor" aria-label="Heart decoration" />
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}