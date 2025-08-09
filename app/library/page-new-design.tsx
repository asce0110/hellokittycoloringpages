"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Printer, Download, Palette, Search, Wand2, Loader2 } from "lucide-react"

// Type definition matching database LibraryImage
type LibraryImage = {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl: string
  tags: string[]
  category: string
  difficulty: "easy" | "medium" | "complex"
  isActive: boolean
  isFeatured: boolean
  downloadCount: number
  createdAt: Date
  updatedAt: Date
}

type PaginatedResponse = {
  data: LibraryImage[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function LibraryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string[]>([])
  const [selectedImage, setSelectedImage] = React.useState<LibraryImage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  
  // 数据状态
  const [libraryData, setLibraryData] = React.useState<PaginatedResponse>({
    data: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)

  // 获取库图片数据
  const fetchLibraryImages = React.useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })

      // 添加过滤参数
      if (selectedCategories.length > 0) {
        params.append('category', selectedCategories[0])
      }
      if (selectedDifficulty.length > 0) {
        params.append('difficulty', selectedDifficulty[0])
      }

      console.log('🔍 Fetching library images:', params.toString())

      const response = await fetch(`/api/library-images?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: PaginatedResponse = await response.json()
      
      console.log('✅ Library data received:', {
        count: data.data.length,
        total: data.pagination.total
      })

      setLibraryData(data)
    } catch (err) {
      console.error('❌ Failed to fetch library images:', err)
      setError(err instanceof Error ? err.message : 'Failed to load images')
      setLibraryData({
        data: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
      })
    } finally {
      setLoading(false)
    }
  }, [selectedCategories, selectedDifficulty])

  // 初始加载和筛选变化时重新获取数据
  React.useEffect(() => {
    fetchLibraryImages(currentPage)
  }, [fetchLibraryImages, currentPage])

  // 处理分类筛选
  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, category]
        : prev.filter(c => c !== category)
    )
    setCurrentPage(1)
  }

  // 处理难度筛选
  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    setSelectedDifficulty(prev =>
      checked
        ? [...prev, difficulty]
        : prev.filter(d => d !== difficulty)
    )
    setCurrentPage(1)
  }

  // 筛选数据（客户端筛选作为后备）
  const filteredPages = React.useMemo(() => {
    return libraryData.data.filter(page => {
      const matchesSearch = searchTerm === "" || 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(page.category)
      
      const matchesDifficulty = selectedDifficulty.length === 0 ||
        selectedDifficulty.includes(page.difficulty)

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [libraryData.data, searchTerm, selectedCategories, selectedDifficulty])

  // 获取所有可用分类和难度
  const allCategories = React.useMemo(() => {
    const categories = [...new Set(libraryData.data.map(page => page.category))]
    return categories.sort()
  }, [libraryData.data])

  const allDifficulties = React.useMemo(() => {
    const difficulties = [...new Set(libraryData.data.map(page => page.difficulty))]
    return difficulties.sort()
  }, [libraryData.data])

  const handleImageClick = (image: LibraryImage) => {
    setSelectedImage(image)
    setIsDialogOpen(true)
  }

  const handleStartColoring = () => {
    if (selectedImage) {
      const coloringUrl = `/color/${selectedImage.id}?src=${encodeURIComponent(selectedImage.imageUrl)}`
      router.push(coloringUrl)
    }
  }

  const handleDownload = () => {
    if (selectedImage) {
      const link = document.createElement('a')
      link.href = selectedImage.imageUrl
      link.download = `${selectedImage.title.replace(/\s+/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrint = () => {
    if (selectedImage) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${selectedImage.title}</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
                h1 { color: #333; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>${selectedImage.title}</h1>
              <img src="${selectedImage.imageUrl}" alt="${selectedImage.title}" onload="window.print(); window.close();" />
            </body>
          </html>
        `)
      }
    }
  }

  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500", 
    complex: "bg-red-500"
  }

  const difficultyLabels = {
    easy: "简单",
    medium: "中等",
    complex: "复杂"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
              🎨 Hello Kitty 着色库
            </h1>
            <p className="text-gray-600 text-lg">
              发现无限创意，享受着色乐趣！
            </p>
            {libraryData.pagination.total > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                共 {libraryData.pagination.total} 张精美图片等你来着色
              </p>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="搜索你喜欢的Hello Kitty图片..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-pink-200 focus:border-pink-400 rounded-xl"
                  />
                </div>
              </div>

              {/* Category Filters */}
              {allCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">分类筛选</p>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <label htmlFor={category} className="text-sm text-gray-600 cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty Filters */}
              {allDifficulties.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">难度筛选</p>
                  <div className="flex flex-wrap gap-2">
                    {allDifficulties.map((difficulty) => (
                      <div key={difficulty} className="flex items-center space-x-2">
                        <Checkbox
                          id={difficulty}
                          checked={selectedDifficulty.includes(difficulty)}
                          onCheckedChange={(checked) => handleDifficultyChange(difficulty, checked as boolean)}
                        />
                        <label htmlFor={difficulty} className="text-sm text-gray-600 cursor-pointer">
                          {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-4" />
            <p className="text-gray-600">加载精美图片中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-red-600 mb-4">❌ 加载失败</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <Button 
                onClick={() => fetchLibraryImages(currentPage)} 
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                重试
              </Button>
            </div>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-yellow-600 mb-2">🔍 暂无图片</p>
              <p className="text-gray-600 text-sm">
                {libraryData.data.length === 0 
                  ? "图片库暂时为空，请稍后再来查看"
                  : "没有找到符合条件的图片，试试调整搜索条件"
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredPages.map((page) => (
                <Card 
                  key={page.id} 
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-pink-100 hover:border-pink-300 bg-white/70 backdrop-blur-sm"
                  onClick={() => handleImageClick(page)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <Image
                        src={page.thumbnailUrl || page.imageUrl}
                        alt={page.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      {page.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                          ⭐ 推荐
                        </Badge>
                      )}
                      <Badge 
                        className={`absolute top-2 right-2 ${difficultyColors[page.difficulty]} text-white`}
                      >
                        {difficultyLabels[page.difficulty]}
                      </Badge>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Palette className="h-12 w-12 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{page.title}</h3>
                      {page.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{page.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {page.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                            {tag}
                          </Badge>
                        ))}
                        {page.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{page.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{page.category}</span>
                        <span>{page.downloadCount} 次下载</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {libraryData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, libraryData.pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i
                    if (pageNum > libraryData.pagination.totalPages) return null
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  disabled={currentPage >= libraryData.pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
              {selectedImage?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedImage?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedImage && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">详细信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">分类:</span>
                      <Badge variant="outline">{selectedImage.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">难度:</span>
                      <Badge className={`${difficultyColors[selectedImage.difficulty]} text-white`}>
                        {difficultyLabels[selectedImage.difficulty]}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">下载次数:</span>
                      <span>{selectedImage.downloadCount}</span>
                    </div>
                  </div>
                </div>

                {selectedImage.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">标签</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedImage.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleStartColoring}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3"
                    size="lg"
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    开始着色
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      下载
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      打印
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}