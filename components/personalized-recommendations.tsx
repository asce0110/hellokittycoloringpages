"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge' 
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, Clock, TrendingUp, Trophy, Users, Calendar,
  Zap, Target, Brain, Heart
} from 'lucide-react'
import { 
  AIRecommendationEngine, 
  type PersonalizedRecommendations, 
  RecommendationItem,
  recommendationEngine
} from '@/lib/ai-recommendation-engine'

interface PersonalizedRecommendationsProps {
  userId: string
  onRecommendationSelect?: (item: RecommendationItem) => void
  className?: string
}

const SECTION_ICONS = {
  quickStart: Zap,
  featured: Sparkles, 
  trending: TrendingUp,
  personalized: Heart,
  challenges: Trophy,
  seasonal: Calendar,
  social: Users
}

const SECTION_TITLES = {
  quickStart: "Quick Start",
  featured: "Featured for You", 
  trending: "Trending Now",
  personalized: "Just for You",
  challenges: "Skill Challenges",
  seasonal: "Seasonal Picks",
  social: "Community Favorites"
}

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  complex: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
}

export function PersonalizedRecommendations({ 
  userId, 
  onRecommendationSelect,
  className = "" 
}: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<keyof PersonalizedRecommendations['recommendations']>('featured')

  useEffect(() => {
    // 模拟加载推荐数据
    setLoading(true)
    
    // 添加一些示例用户行为数据
    recommendationEngine.updateUserPreference(userId, {
      type: 'complete',
      item: {
        theme: 'nature-wilderness',
        style: 'line-art-minimal',
        mood: 'calm-peaceful',
        difficulty: 'easy',
        sessionTime: 12
      }
    })

    recommendationEngine.updateUserPreference(userId, {
      type: 'like',
      item: {
        theme: 'fantasy-worlds',
        style: 'cartoon-style', 
        mood: 'whimsical-quirky',
        difficulty: 'medium'
      }
    })

    setTimeout(() => {
      const recs = recommendationEngine.generateRecommendations(userId)
      setRecommendations(recs)
      setLoading(false)
    }, 1000)
  }, [userId])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gradient">
            Personalizing Your Experience...
          </h2>
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-primary animate-spin" />
            <span className="text-muted-foreground">AI is analyzing your preferences</span>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to generate recommendations</p>
      </div>
    )
  }

  const renderRecommendationCard = (item: RecommendationItem) => (
    <Card 
      key={item.id}
      className="group hover:shadow-xl transition-all duration-300 creative-shadow cursor-pointer"
      onClick={() => onRecommendationSelect?.(item)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: `hsl(var(--primary))`,
                opacity: item.confidence / 100
              }}
            />
            <span className="text-xs text-muted-foreground">
              {item.confidence}%
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge className={DIFFICULTY_COLORS[item.difficulty]}>
            {item.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {item.estimatedTime}min
          </Badge>
          {item.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        
        {item.reasoning && item.reasoning.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary">Why this is perfect for you:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {item.reasoning.slice(0, 2).map((reason, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-60" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onRecommendationSelect?.(item)
          }}
        >
          Start Creating
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with User Insights */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gradient">
          Your Personalized Creative Journey
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <div className="text-2xl font-bold text-primary">
                {recommendations.insights.creativityScore}
              </div>
              <div className="text-sm text-muted-foreground">Creativity Score</div>
              <Progress 
                value={recommendations.insights.creativityScore} 
                className="mt-2 h-2"
              />
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/10">
              <div className="text-2xl font-bold text-secondary">
                {recommendations.insights.diversityScore}
              </div>
              <div className="text-sm text-muted-foreground">Diversity Score</div>
              <Progress 
                value={recommendations.insights.diversityScore} 
                className="mt-2 h-2"
              />
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/10">
              <div className="text-lg font-bold text-accent-foreground">
                {recommendations.insights.userType}
              </div>
              <div className="text-sm text-muted-foreground">Your Type</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-lg font-bold capitalize">
                {recommendations.insights.progressTrend}
              </div>
              <div className="text-sm text-muted-foreground">Progress Trend</div>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {recommendations.insights.nextLevelSuggestion}
        </p>
      </div>

      {/* Recommendation Sections */}
      <Tabs value={selectedSection} onValueChange={(value) => setSelectedSection(value as any)}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          {Object.entries(recommendations.recommendations).map(([key, items]) => {
            if (items.length === 0) return null
            const IconComponent = SECTION_ICONS[key as keyof typeof SECTION_ICONS]
            return (
              <TabsTrigger key={key} value={key} className="text-xs">
                <IconComponent className="w-4 h-4 mr-1" />
                {SECTION_TITLES[key as keyof typeof SECTION_TITLES]}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(recommendations.recommendations).map(([section, items]) => {
          if (items.length === 0) return null
          
          return (
            <TabsContent key={section} value={section} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {React.createElement(SECTION_ICONS[section as keyof typeof SECTION_ICONS], {
                  className: "w-6 h-6 text-primary"
                })}
                <h3 className="text-xl font-bold">
                  {SECTION_TITLES[section as keyof typeof SECTION_TITLES]}
                </h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(renderRecommendationCard)}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* AI Insights Footer */}
      <div className="text-center space-y-4 p-6 rounded-lg gradient-creative/10 border border-primary/20">
        <h3 className="text-xl font-bold text-primary">
          🧠 AI-Powered Personalization
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <p className="font-semibold">Smart Learning</p>
            <p className="text-muted-foreground">AI learns from your every interaction to improve recommendations</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
              <Target className="w-4 h-4 text-secondary" />
            </div>
            <p className="font-semibold">Perfect Timing</p>
            <p className="text-muted-foreground">Recommendations adapt to your schedule and mood patterns</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="font-semibold">Always Fresh</p>
            <p className="text-muted-foreground">Content updates daily with new personalized suggestions</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {recommendations.timestamp.toLocaleString()}
        </p>
      </div>
    </div>
  )
}