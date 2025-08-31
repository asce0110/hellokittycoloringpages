"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  THEME_CATEGORIES, 
  STYLE_CATEGORIES, 
  MOOD_CATEGORIES,
  POPULAR_COMBINATIONS,
  generateCreativePrompt,
  CategoryCombination
} from '@/lib/creative-taxonomy'

interface CreativeCategoryExplorerProps {
  onCategorySelect?: (theme: string, style: string, mood: string) => void
  onCombinationSelect?: (combination: CategoryCombination) => void  
  className?: string
}

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  complex: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
}

export function CreativeCategoryExplorer({ 
  onCategorySelect, 
  onCombinationSelect,
  className = "" 
}: CreativeCategoryExplorerProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>("")
  const [selectedStyle, setSelectedStyle] = useState<string>("")
  const [selectedMood, setSelectedMood] = useState<string>("")

  const handleCreateCustom = () => {
    if (selectedTheme && selectedStyle && selectedMood) {
      onCategorySelect?.(selectedTheme, selectedStyle, selectedMood)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient">
          Explore Creative Possibilities
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover infinite combinations with our three-dimensional content system: 
          Theme × Style × Mood = Unlimited Creativity!
        </p>
      </div>

      <Tabs defaultValue="combinations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="combinations">Popular Combos</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
          <TabsTrigger value="moods">Moods</TabsTrigger>
        </TabsList>

        {/* Popular Combinations Tab */}
        <TabsContent value="combinations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_COMBINATIONS.map((combo) => (
              <Card 
                key={combo.name}
                className="group hover:shadow-xl transition-all duration-300 creative-shadow cursor-pointer"
                onClick={() => onCombinationSelect?.(combo)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {combo.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-creative-pulse" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={DIFFICULTY_COLORS[combo.difficulty]}>
                      {combo.difficulty}
                    </Badge>
                    {combo.keywords.slice(0, 2).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {combo.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 rounded bg-primary/10">
                      <div className="font-semibold text-primary">Theme</div>
                      <div className="mt-1 capitalize">{combo.theme.replace('-', ' ')}</div>
                    </div>
                    <div className="text-center p-2 rounded bg-secondary/10">
                      <div className="font-semibold text-secondary">Style</div>
                      <div className="mt-1 capitalize">{combo.style.replace('-', ' ')}</div>
                    </div>
                    <div className="text-center p-2 rounded bg-accent/10">
                      <div className="font-semibold text-accent-foreground">Mood</div>
                      <div className="mt-1 capitalize">{combo.mood.replace('-', ' ')}</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCombinationSelect?.(combo)
                    }}
                  >
                    Create This Style
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEME_CATEGORIES.map((theme) => (
              <Card 
                key={theme.name}
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedTheme === theme.name ? 'ring-2 ring-primary creative-glow' : 'creative-shadow'
                }`}
                onClick={() => setSelectedTheme(selectedTheme === theme.name ? "" : theme.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl">
                      {theme.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {theme.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {theme.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {theme.items.slice(0, 4).map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Styles Tab */}
        <TabsContent value="styles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STYLE_CATEGORIES.map((style) => (
              <Card 
                key={style.name}
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedStyle === style.name ? 'ring-2 ring-secondary creative-glow' : 'creative-shadow'
                }`}
                onClick={() => setSelectedStyle(selectedStyle === style.name ? "" : style.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-2xl text-white font-bold">
                      📝
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-secondary transition-colors">
                        {style.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {style.keywords.slice(0, 4).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Moods Tab */}
        <TabsContent value="moods" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOOD_CATEGORIES.map((mood) => (
              <Card 
                key={mood.name}
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedMood === mood.name ? 'ring-2 ring-accent creative-glow' : 'creative-shadow'
                }`}
                onClick={() => setSelectedMood(selectedMood === mood.name ? "" : mood.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-2xl">
                      😊
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-accent transition-colors">
                        {mood.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {mood.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {mood.keywords.slice(0, 4).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Custom Combination Builder */}
      {(selectedTheme || selectedStyle || selectedMood) && (
        <div className="p-6 rounded-lg gradient-creative/10 border border-primary/20 space-y-4">
          <h3 className="text-xl font-bold text-center">Create Custom Combination</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded border">
              <div className="font-semibold text-primary mb-2">Theme</div>
              <div className="text-sm">
                {selectedTheme || "Choose a theme"}
              </div>
            </div>
            <div className="text-center p-3 rounded border">
              <div className="font-semibold text-secondary mb-2">Style</div>
              <div className="text-sm">
                {selectedStyle || "Choose a style"}
              </div>
            </div>
            <div className="text-center p-3 rounded border">
              <div className="font-semibold text-accent mb-2">Mood</div>
              <div className="text-sm">
                {selectedMood || "Choose a mood"}
              </div>
            </div>
          </div>

          {selectedTheme && selectedStyle && selectedMood && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Preview: {generateCreativePrompt(selectedTheme, selectedStyle, selectedMood, "custom artwork").substring(0, 100)}...
              </p>
              <Button 
                onClick={handleCreateCustom}
                className="gradient-creative text-white hover:opacity-90"
                size="lg"
              >
                🎨 Create This Unique Combination
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Information Section */}
      <div className="text-center space-y-4 p-6 rounded-lg bg-muted/20">
        <h3 className="text-xl font-bold">
          🧬 The Science of Creative Combinations
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary font-bold">
              6
            </div>
            <p className="font-semibold">Theme Categories</p>
            <p className="text-muted-foreground">From fantasy worlds to urban life</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mx-auto text-secondary font-bold">
              6
            </div>
            <p className="font-semibold">Style Options</p>
            <p className="text-muted-foreground">From minimal lines to detailed realism</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-accent font-bold">
              6
            </div>
            <p className="font-semibold">Mood Variations</p>
            <p className="text-muted-foreground">From peaceful zen to bold adventure</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-primary">
          = 216 Unique Combinations!
        </div>
        <p className="text-muted-foreground">
          Every combination creates a unique creative experience tailored to your preferences
        </p>
      </div>
    </div>
  )
}