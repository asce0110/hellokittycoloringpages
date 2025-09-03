"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Library, Sparkles, Palette, ImageIcon } from "lucide-react"
import { MobileContainer, MobileCardGrid, MobileTitle, MobileButtonGroup } from "@/components/mobile-layout"
import { SEOMobileTitle, SEOMobileDescription } from "@/components/seo-mobile-text"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface MobileHomeHeroProps {
  className?: string
}

export function MobileHomeHero({ className = "" }: MobileHomeHeroProps) {
  const isMobile = useIsMobile()

  return (
    <section className={cn("py-8 sm:py-12 lg:py-20", className)}>
      <MobileContainer>
        <div className="text-center space-y-4 sm:space-y-6">
          {/* 主标题 - 移动端优化 */}
          <SEOMobileTitle
            title="Free Printable Coloring Pages for Kids & Adults"
            mobileTitle="Free Coloring Pages"
            level={1}
            className="text-center"
          />
          
          {/* 描述 - 移动端简化 */}
          <SEOMobileDescription
            description="Discover thousands of high-quality printable coloring pages featuring Hello Kitty, animals, nature, and more. Perfect for kids, adults, and families!"
            mobileDescription="Thousands of free printable coloring pages for all ages!"
            className="text-center max-w-2xl mx-auto"
          />
          
          {/* 操作按钮 - 移动端优化 */}
          <MobileButtonGroup className="justify-center">
            <Button size={isMobile ? "sm" : "lg"} asChild className="min-w-[120px]">
              <Link href="/library">
                <Library className="mr-2 h-4 w-4" />
                Browse Gallery
              </Link>
            </Button>
            <Button 
              size={isMobile ? "sm" : "lg"} 
              variant="outline" 
              asChild 
              className="min-w-[120px]"
            >
              <Link href="/ai-coloring">
                <Sparkles className="mr-2 h-4 w-4" />
                {isMobile ? "AI Create" : "AI Generator"}
              </Link>
            </Button>
          </MobileButtonGroup>
        </div>
      </MobileContainer>
    </section>
  )
}

interface MobileFeatureCardProps {
  title: string
  mobileTitle?: string
  description: string
  mobileDescription?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  buttonText: string
  mobileButtonText?: string
  className?: string
}

export function MobileFeatureCard({
  title,
  mobileTitle,
  description,
  mobileDescription,
  href,
  icon: Icon,
  buttonText,
  mobileButtonText,
  className = ""
}: MobileFeatureCardProps) {
  const isMobile = useIsMobile()

  return (
    <Card className={cn("h-full group hover:shadow-lg transition-all duration-200", className)}>
      <CardContent className="p-4 sm:p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <SEOMobileTitle
            title={title}
            mobileTitle={mobileTitle}
            level={3}
            className="flex-1"
          />
        </div>
        
        <SEOMobileDescription
          description={description}
          mobileDescription={mobileDescription}
          className="flex-1 mb-4"
        />
        
        <Button asChild size={isMobile ? "sm" : "default"} className="w-full">
          <Link href={href}>
            {mobileButtonText && isMobile ? mobileButtonText : buttonText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

interface MobileHomeFeaturesProps {
  className?: string
}

export function MobileHomeFeatures({ className = "" }: MobileHomeFeaturesProps) {
  const features = [
    {
      title: "Art Gallery - Thousands of Designs",
      mobileTitle: "Art Gallery",
      description: "Browse our extensive collection of professionally designed coloring pages featuring Hello Kitty, animals, nature, and seasonal themes.",
      mobileDescription: "Browse thousands of professional designs",
      href: "/library",
      icon: ImageIcon,
      buttonText: "Explore Gallery",
      mobileButtonText: "Explore"
    },
    {
      title: "AI-Powered Coloring Generator",
      mobileTitle: "AI Generator",
      description: "Create unique, personalized coloring pages instantly using our advanced AI technology. Just describe what you want!",
      mobileDescription: "Create unique pages with AI instantly",
      href: "/ai-coloring",
      icon: Sparkles,
      buttonText: "Try AI Generator",
      mobileButtonText: "Try AI"
    },
    {
      title: "Professional AI Studio Tools",
      mobileTitle: "AI Studio",
      description: "Advanced creation tools for educators and professionals. Generate curriculum-aligned content and custom designs.",
      mobileDescription: "Advanced tools for professionals",
      href: "/create",
      icon: Palette,
      buttonText: "Access Studio",
      mobileButtonText: "Studio"
    }
  ]

  return (
    <section className={cn("py-8 sm:py-12 lg:py-16", className)}>
      <MobileContainer>
        <MobileTitle
          title="Why Choose Our Coloring Pages?"
          subtitle="Everything you need for creative fun"
          className="mb-8"
        />
        
        <MobileCardGrid cols="auto" className="max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <MobileFeatureCard key={index} {...feature} />
          ))}
        </MobileCardGrid>
      </MobileContainer>
    </section>
  )
}

interface MobileQuickStatsProps {
  className?: string
}

export function MobileQuickStats({ className = "" }: MobileQuickStatsProps) {
  const stats = [
    { number: "5000+", label: "Free Pages", mobileLabel: "Pages" },
    { number: "50+", label: "Categories", mobileLabel: "Categories" },
    { number: "100K+", label: "Happy Users", mobileLabel: "Users" },
    { number: "Daily", label: "New Content", mobileLabel: "Updates" }
  ]

  return (
    <section className={cn("py-6 sm:py-8 bg-muted/50", className)}>
      <MobileContainer>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">{stat.label}</span>
                <span className="sm:hidden">{stat.mobileLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </MobileContainer>
    </section>
  )
}

