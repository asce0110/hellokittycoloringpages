"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ChevronUp, 
  ChevronDown, 
  Home, 
  Palette, 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  Tag,
  Lightbulb,
  Heart,
  Share2,
  Printer,
  Download
} from "lucide-react"
import { ColoringPageData } from "@/lib/coloring-data"
import { MobileSEOSidebar } from "./mobile-seo-sidebar"
import { SEORelatedContent } from "./seo-related-content"
import { cn } from "@/lib/utils"

interface ColoringPageSEOLayoutProps {
  coloringPage: ColoringPageData
  children: React.ReactNode
}

// Educational content generator
const generateEducationalContent = (page: ColoringPageData) => {
  const baseSkills = [
    "Hand-eye coordination development",
    "Color recognition and matching",
    "Creative thinking cultivation", 
    "Focus and patience training",
    "Fine motor skills improvement"
  ]

  const categorySpecificContent: Record<string, any> = {
    'Hello Kitty': {
      skills: [...baseSkills, "Character recognition and emotional expression", "Kawaii culture understanding"],
      story: "Hello Kitty is a classic cartoon character from Japan. By coloring her, children can develop their perception of beautiful things while learning the basics of color coordination.",
      tips: [
        "Use pink tones to express gentle and cute feelings",
        "Try different bow colors to make Hello Kitty more personalized",
        "Background colors can create different moods and atmospheres"
      ]
    },
    'Animals': {
      skills: [...baseSkills, "Animal recognition learning", "Nature observation ability"],
      story: "By coloring animals, children can not only learn about different animal characteristics but also develop love and protection awareness for nature.",
      tips: [
        "Observe real animal colors to develop observation skills",
        "Try creative color combinations to unleash imagination",
        "Learn about animal habits to increase knowledge"
      ]
    },
    'Custom': {
      skills: [...baseSkills, "Personalized creation", "Artistic expression ability"],
      story: "Unique designs provide unlimited possibilities for creative expression, encouraging children to break conventions and create their own artistic works.",
      tips: [
        "Don't stick to traditional colors, boldly try new combinations",
        "Add background elements to enrich the picture content",
        "Record your creative process to cultivate artistic thinking"
      ]
    }
  }

  return categorySpecificContent[page.category] || categorySpecificContent['Custom']
}

// Coloring tips database
const coloringTips = [
  {
    title: "Choose the Right Tools",
    content: "For online coloring, use the fill tool for large areas and the brush tool for details and edge refinement.",
    icon: "🎨"
  },
  {
    title: "Color Coordination Principles",
    content: "Try using adjacent colors to create harmony, or use contrasting colors for visual impact. Remember, there's no absolute right or wrong!",
    icon: "🌈"
  },
  {
    title: "Creating Depth",
    content: "Using colors of different shades can create depth and make the image more three-dimensional and rich.",
    icon: "✨"
  },
  {
    title: "Stay Patient",
    content: "Coloring is a relaxing process, don't rush. Taking your time will give you better results and more enjoyment.",
    icon: "🧘"
  }
]

// FAQ data
const coloringFAQs = [
  {
    question: "How to get the best coloring results?",
    answer: "We recommend using the fill tool for large areas, then using the brush tool for details. Choose harmonious color combinations and don't be afraid to try new color schemes."
  },
  {
    question: "Can I save my artwork?",
    answer: "Absolutely! After completing your coloring, click the download button to save as a PNG image. You can also print your artwork directly."
  },
  {
    question: "What age group are coloring pages suitable for?",
    answer: "Our coloring pages are suitable for all ages 3 and up. Simple designs work for young children, while complex details can challenge older users."
  },
  {
    question: "How do I start over with coloring?",
    answer: "Click the reset button to clear all colors and start fresh. You can also use the undo function to go back step by step."
  }
]

export function ColoringPageSEOLayout({ coloringPage, children }: ColoringPageSEOLayoutProps) {
  const [showTips, setShowTips] = useState(false)
  const [showEducational, setShowEducational] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  
  const educationalContent = generateEducationalContent(coloringPage)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Breadcrumb navigation - SEO friendly */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400" aria-label="Breadcrumb navigation">
          <Link href="/" className="hover:text-kitty-pink dark:hover:text-kitty-pink transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <span>›</span>
          <Link href="/library" className="hover:text-kitty-pink dark:hover:text-kitty-pink transition-colors">
            Coloring Library
          </Link>
          <span>›</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">{coloringPage.title}</span>
        </nav>
      </div>

      {/* Page title section - SEO optimized */}
      <section className="container mx-auto px-4 py-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {coloringPage.title} - Free Online Coloring
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {coloringPage.description || `Enjoy coloring this beautiful ${coloringPage.title} design! Perfect for all ages, it helps relax your mind while developing creativity and focus.`}
          </p>
          
          {/* Tags and meta info */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
              <Tag className="h-3 w-3" />
              {coloringPage.category}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700">
              <Star className="h-3 w-3" />
              {coloringPage.difficulty} level
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
              <Clock className="h-3 w-3" />
              15-30 minutes
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700">
              <Users className="h-3 w-3" />
              Ages 3+
            </Badge>
          </div>
        </div>
      </section>

      {/* Main content area */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Left: Coloring canvas */}
          <div className="space-y-6">
            {children}
            
            {/* Related content recommendations - moved here from bottom */}
            <div className="mt-8">
              <SEORelatedContent currentPage={coloringPage} />
            </div>
          </div>

          {/* Right: SEO content area */}
          <div className="space-y-6">
            {/* Coloring tips */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <Collapsible open={showTips} onOpenChange={setShowTips}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Coloring Tips
                      </CardTitle>
                      {showTips ? <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-4 space-y-4">
                      {coloringTips.map((tip, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <span>{tip.icon}</span>
                            {tip.title}
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {tip.content}
                          </p>
                          {index < coloringTips.length - 1 && <Separator className="dark:border-gray-600" />}
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* Educational benefits */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <Collapsible open={showEducational} onOpenChange={setShowEducational}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left hover:bg-green-50 dark:hover:bg-green-900/20">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <BookOpen className="h-5 w-5 text-green-500" />
                        Educational Benefits
                      </CardTitle>
                      {showEducational ? <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Skills Development</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {educationalContent.skills.map((skill: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator className="dark:border-gray-600" />
                      
                      <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Background Story</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {educationalContent.story}
                        </p>
                      </div>
                      
                      <Separator className="dark:border-gray-600" />
                      
                      <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Coloring Suggestions</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {educationalContent.tips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="h-1.5 w-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* Related pages */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Palette className="h-5 w-5 text-pink-500" />
                  Related Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/library?category=hello-kitty" className="block p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-100 dark:border-pink-800 hover:border-pink-200 dark:hover:border-pink-700 hover:shadow-sm transition-all">
                  <h4 className="font-medium text-pink-800 dark:text-pink-300">More Hello Kitty Pages</h4>
                  <p className="text-sm text-pink-700 dark:text-pink-400">Explore more adorable Hello Kitty designs</p>
                </Link>
                
                <Link href="/library?difficulty=easy" className="block p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-100 dark:border-green-800 hover:border-green-200 dark:hover:border-green-700 hover:shadow-sm transition-all">
                  <h4 className="font-medium text-green-800 dark:text-green-300">Beginner Friendly</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">Simple and easy coloring designs</p>
                </Link>
                
                <Link href="/create" className="block p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-100 dark:border-yellow-800 hover:border-yellow-200 dark:hover:border-yellow-700 hover:shadow-sm transition-all">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">AI Generated Pages</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Create unique personalized designs</p>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom detailed content area */}
        <div className="mt-12 space-y-8">
          {/* FAQ section */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <Collapsible open={showFAQ} onOpenChange={setShowFAQ}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Frequently Asked Questions</CardTitle>
                    {showFAQ ? <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {coloringFAQs.map((faq, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{faq.question}</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>

          {/* SEO content section */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  About {coloringPage.title} Coloring Page
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Why Choose Digital Coloring?</h3>
                    <p className="leading-relaxed mb-4">
                      Digital coloring offers many advantages over traditional paper coloring. You can easily undo mistakes, experiment with unlimited color combinations,
                      and never worry about running out of supplies. Our digital coloring tools provide a professional-grade experience
                      while maintaining the joy and relaxation benefits of traditional coloring.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Benefits of Coloring</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Reduces stress and anxiety levels</li>
                      <li>Improves focus and concentration</li>
                      <li>Stimulates creative brain regions</li>
                      <li>Enhances hand-eye coordination</li>
                      <li>Provides meditative relaxation experience</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Usage Tips</h3>
                    <p className="leading-relaxed mb-4">
                      Make the most of our coloring tools to create stunning artwork. The fill tool is perfect for quickly coloring large areas,
                      while the brush tool gives you precise control over every detail. Don't be afraid to experiment with bold color combinations —
                      that's the beauty of digital coloring!
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Share Your Artwork</h3>
                    <p className="leading-relaxed">
                      Once you've finished coloring, you can download high-quality PNG images to share your creations with friends and family.
                      You can also print them out to decorate your room or create personalized gifts. Every piece is a unique work of art!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Structured data Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": coloringPage.title,
            "description": coloringPage.description,
            "image": coloringPage.imageUrl,
            "creator": {
              "@type": "Organization",
              "name": "AI Kitty Creator"
            },
            "educationalAlignment": {
              "@type": "AlignmentObject",
              "alignmentType": "Educational Value",
              "educationalFramework": "Creativity Development"
            },
            "audience": {
              "@type": "EducationalAudience",
              "educationalRole": "Children and Adults"
            },
            "keywords": coloringPage.tags?.join(",") || "coloring,coloring pages,Hello Kitty,online coloring,free"
          })
        }}
      />
      
      {/* Mobile SEO sidebar */}
      <MobileSEOSidebar 
        coloringPage={coloringPage}
        educationalContent={educationalContent}
        coloringTips={coloringTips}
        coloringFAQs={coloringFAQs}
      />
    </div>
  )
}