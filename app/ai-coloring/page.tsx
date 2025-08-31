'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Search, Filter, Download, Palette, Printer, Clock, Users, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface AIPrompt {
  id: string
  title: string
  description: string
  aiPrompt: string
  category: string
  difficulty: 'easy' | 'medium' | 'complex'
  tags: string[]
  estimatedPrintTime?: number
  ageGroup?: string
  generation_count?: number
  average_rating?: number
}

const categoryIcons = {
  Animals: '🦁',
  Scenes: '🏞️',
  Holidays: '🎄',
  Educational: '📚',
  Fantasy: '🦄'
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  complex: 'bg-red-100 text-red-800'
}

export default function AIColoringPage() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  // Fetch prompts from API
  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy
      })

      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty)
      if (selectedAgeGroup !== 'all') params.append('age_group', selectedAgeGroup)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/ai-prompts?${params}`)
      const data = await response.json()

      setPrompts(data.prompts || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, selectedDifficulty, selectedAgeGroup, searchQuery, sortBy])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  // Generate coloring page from prompt
  const handleGenerate = async (prompt: AIPrompt) => {
    setGeneratingId(prompt.id)
    try {
      // Call AI generation API
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.aiPrompt,
          templateId: prompt.id,
          style: 'coloring-page'
        })
      })

      const data = await response.json()
      
      if (data.imageUrl) {
        // Redirect to coloring page with generated image
        window.location.href = `/color/${data.slug || prompt.id}`
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate coloring page. Please try again.')
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI-Powered Coloring Pages
            </h1>
            <p className="text-xl mb-8">
              500+ Original Designs Optimized for Printing
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>AI Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                <span>Print-Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>All Ages</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>High Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search coloring pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Animals">🦁 Animals</SelectItem>
                  <SelectItem value="Scenes">🏞️ Scenes</SelectItem>
                  <SelectItem value="Holidays">🎄 Holidays</SelectItem>
                  <SelectItem value="Educational">📚 Educational</SelectItem>
                  <SelectItem value="Fantasy">🦄 Fantasy</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy (3-6)</SelectItem>
                  <SelectItem value="medium">Medium (7-10)</SelectItem>
                  <SelectItem value="complex">Complex (11+)</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                135K+ Monthly Searches
              </Badge>
              <Badge variant="secondary">
                500+ Unique Designs
              </Badge>
              <Badge variant="secondary">
                100% Copyright-Free
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
              All
            </TabsTrigger>
            <TabsTrigger value="Animals" onClick={() => setSelectedCategory('Animals')}>
              🦁 Animals
            </TabsTrigger>
            <TabsTrigger value="Scenes" onClick={() => setSelectedCategory('Scenes')}>
              🏞️ Scenes
            </TabsTrigger>
            <TabsTrigger value="Holidays" onClick={() => setSelectedCategory('Holidays')}>
              🎄 Holidays
            </TabsTrigger>
            <TabsTrigger value="Educational" onClick={() => setSelectedCategory('Educational')}>
              📚 Educational
            </TabsTrigger>
            <TabsTrigger value="Fantasy" onClick={() => setSelectedCategory('Fantasy')}>
              🦄 Fantasy
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Prompts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading coloring pages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl">{categoryIcons[prompt.category as keyof typeof categoryIcons]}</span>
                      <Badge className={difficultyColors[prompt.difficulty]}>
                        {prompt.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {prompt.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {prompt.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      {prompt.ageGroup && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Age {prompt.ageGroup}
                        </span>
                      )}
                      {prompt.estimatedPrintTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {prompt.estimatedPrintTime} min
                        </span>
                      )}
                    </div>

                    {prompt.generation_count && prompt.generation_count > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Generated {prompt.generation_count} times
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleGenerate(prompt)}
                      disabled={generatingId === prompt.id}
                    >
                      {generatingId === prompt.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* SEO Content Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-3xl font-bold mb-6">Free Printable Coloring Pages for Everyone</h2>
            <p>
              Discover our extensive collection of 500+ original coloring pages printable designs, 
              perfect for kids and adults alike. Each page is carefully crafted with AI technology 
              to ensure clean lines, appropriate complexity levels, and engaging subjects that 
              inspire creativity.
            </p>
            
            <h3 className="text-2xl font-semibold mt-8 mb-4">Why Choose Our Coloring Pages?</h3>
            <ul>
              <li><strong>100% Original Content:</strong> Every design is unique and copyright-free</li>
              <li><strong>Print-Optimized:</strong> High-quality line art perfect for standard printers</li>
              <li><strong>Age-Appropriate:</strong> Designs sorted by difficulty for all skill levels</li>
              <li><strong>Educational Value:</strong> Learn while you color with our educational series</li>
              <li><strong>Instant Access:</strong> Generate and download immediately</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Perfect for:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                <p className="font-semibold">Families</p>
                <p className="text-sm text-gray-600">Quality time activities</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏫</div>
                <p className="font-semibold">Teachers</p>
                <p className="text-sm text-gray-600">Classroom resources</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <p className="font-semibold">Artists</p>
                <p className="text-sm text-gray-600">Practice and relaxation</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🧘</div>
                <p className="font-semibold">Adults</p>
                <p className="text-sm text-gray-600">Stress relief coloring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}