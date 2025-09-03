"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2, Download, Heart, Share2, Loader2 } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { GenerationHistory, PromptTemplate } from "@/lib/types"

export default function CreatePage() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("classic")
  const [complexity, setComplexity] = useState("medium")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none")
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GenerationHistory[]>([])
  const [generationsRemaining, setGenerationsRemaining] = useState(5)
  const [error, setError] = useState<string | null>(null)

  // 获取可用的提示词模板
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // 首先尝试从admin API获取，如果失败则使用fallback API
        let response = await fetch('/api/admin/prompt-templates?activeOnly=true')
        
        if (!response.ok) {
          console.log('Admin templates API failed, trying fallback...')
          response = await fetch('/api/prompt-templates?activeOnly=true')
        }
        
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.data || [])
          if (data.message) {
            console.log('Templates API message:', data.message)
          }
        } else {
          console.error('Both template APIs failed')
          setTemplates([])
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error)
        // 最后的fallback：使用空数组，确保页面仍能正常工作
        setTemplates([])
      }
    }
    fetchTemplates()
  }, [])

  // 获取用户的生成历史
  useEffect(() => {
    if (user) {
      const fetchGenerations = async () => {
        try {
          // 这里应该获取用户的生成历史，暂时使用模拟数据
          setGenerationsRemaining(user.isProUser ? 50 : 5)
        } catch (error) {
          console.error('Failed to fetch user generations:', error)
        }
      }
      fetchGenerations()
    }
  }, [user])

  // 处理AI图像生成
  const handleGenerate = async () => {
    if (!user) {
      setError('请先登录后再使用AI生成功能')
      return
    }

    if (!prompt.trim()) {
      setError('请输入您想要生成的内容描述')
      return
    }

    if (generationsRemaining <= 0) {
      setError('今日生成次数已用完，请升级到Pro版本获得更多次数')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          style,
          complexity,
          templateId: selectedTemplate === "none" ? undefined : selectedTemplate,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'AI生成失败')
      }

      // 添加新生成的图像到列表
      const newGeneration: GenerationHistory = {
        id: result.data.id,
        userId: user.id,
        prompt,
        imageUrl: result.data.imageUrl,
        thumbnailUrl: result.data.thumbnailUrl,
        style,
        complexity,
        isFavorite: false,
        isPublic: false,
        generationParams: result.data.generationParams,
        createdAt: new Date(result.data.createdAt)
      }

      setGeneratedImages([newGeneration, ...generatedImages])
      setGenerationsRemaining(result.data.generationsRemaining || generationsRemaining - 1)
      setPrompt('') // 清空输入框
      
    } catch (error) {
      console.error('Generation failed:', error)
      setError(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 md:px-6">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Coloring Page Creator</h1>
        <p className="text-muted-foreground text-lg">
          Describe your imagination and let AI create unique coloring pages just for you.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your coloring page</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A cute cat wearing an astronaut helmet, floating in space with Earth in the background, surrounded by stars and planets"
              className="min-h-[120px] text-base"
            />
          </div>

          {/* 模板选择器 */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Use Template (Optional)</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template to enhance your prompt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.style} ({template.complexity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && selectedTemplate !== "none" && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Art Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic Line Art</SelectItem>
                  <SelectItem value="cute">Cute Cartoon</SelectItem>
                  <SelectItem value="simple">Minimalist</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity</label>
              <Select value={complexity} onValueChange={setComplexity}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple (Kids 3-5)</SelectItem>
                  <SelectItem value="medium">Medium (Kids 6-10)</SelectItem>
                  <SelectItem value="complex">Complex (Adults)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button 
            size="lg" 
            className="w-full" 
            onClick={handleGenerate}
            disabled={isGenerating || !user}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Coloring Page
              </>
            )}
          </Button>
          
          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please <a href="/login" className="text-primary underline">login</a> to use AI generation
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Creative Tips
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Be specific about characters, settings, and actions</li>
              <li>• Try different art styles for variety</li>
              <li>• Mention viewing angles like "front view" or "side profile"</li>
              <li>• Include emotions and expressions</li>
              <li>• Add background elements for context</li>
            </ul>
          </div>

          {/* 用户生成次数信息 */}
          {user && (
            <div className="bg-primary/10 p-6 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-primary mb-2">Today's Generations</h4>
              <div className="text-2xl font-bold text-primary mb-2">
                {generationsRemaining} remaining
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {user.isProUser 
                  ? "Pro users get 50 generations per day" 
                  : "Free users get 5 generations per day"}
              </p>
              {!user.isProUser && (
                <Button variant="outline" size="sm">
                  Upgrade to Pro
                </Button>
              )}
            </div>
          )}

          {/* --- FIXED: Pro Features Box --- */}
          <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/30">
            <h4 className="font-semibold text-secondary-dark dark:text-secondary-light mb-2">✨ Pro Features</h4>
            <p className="text-sm text-secondary-dark/80 dark:text-secondary-light/80 mb-3">
              Upgrade to unlock unlimited generations, higher resolution, and watermark-free downloads.
            </p>
            <Button variant="secondary" size="sm">
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>

      {generatedImages.length > 0 && (
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Generated Results</h2>
            <Badge variant="secondary">
              {user?.isProUser ? 50 - generationsRemaining : 5 - generationsRemaining} of {user?.isProUser ? 50 : 5} daily generations used
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {generatedImages.map((generation) => (
              <Card key={generation.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={generation.thumbnailUrl || generation.imageUrl}
                      alt={`Generated: ${generation.prompt.substring(0, 50)}...`}
                      width={300}
                      height={300}
                      className="object-cover w-full aspect-square"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm" asChild>
                        <a href={`/custom-generation-${generation.id}?imageUrl=${encodeURIComponent(generation.imageUrl)}`}>
                          Color This
                        </a>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(generation.imageUrl, '_blank')
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium mb-1 line-clamp-2">
                      {generation.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {generation.style} • {generation.complexity}
                      </span>
                      <span>
                        {new Date(generation.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Love what you see? Click "Color This" to start coloring or download to print!
            </p>
            <Button variant="outline" asChild>
              <a href="/dashboard">View All My Creations</a>
            </Button>
          </div>
        </div>
      )}

      {/* 正在生成的加载状态 */}
      {isGenerating && (
        <div className="mt-16">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Creating Your Coloring Page</h3>
              <p className="text-muted-foreground">
                Our AI is carefully crafting a unique coloring page based on your description...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
