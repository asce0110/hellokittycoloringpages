"use client"

import * as React from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Wand2, Loader2 } from "lucide-react"
import { LibraryImageCard } from "@/components/library-image-card"
import { LibraryImage } from "@/lib/types"
import { demoLibraryImages } from "@/lib/demo-data"

// ColoringPage format for backward compatibility with existing filter logic
type ColoringPage = {
  id: number
  title: string
  description: string
  tags: string[]
  src: string
  category: string
  dateAdded: Date
  isNew: boolean
  originalId?: string // 🎯 保存原始UUID用于API调用
  difficulty?: "easy" | "medium" | "complex" // 🎯 添加difficulty字段
}

export default function LibraryPage() {
  const searchParams = useSearchParams()
  
  // Get filter parameters from URL
  const filterType = searchParams.get('filter') // 'new', 'category', etc.
  const filterValue = searchParams.get('value') // specific category value
  const searchQuery = searchParams.get('search') // search term
  const period = searchParams.get('period') // 'week', 'month', 'quarter', 'year'
  const since = searchParams.get('since') // ISO date string
  const difficulty = searchParams.get('difficulty') // 'easy', 'medium', 'hard'
  const imageId = searchParams.get('imageId') // specific image ID to display
  
  // 🎯 数据显示策略：优先使用真实数据库数据
  const [libraryImages, setLibraryImages] = React.useState<LibraryImage[]>([])
  const [loading, setLoading] = React.useState(true) // 等待数据库数据加载
  const [useOnlyDbData, setUseOnlyDbData] = React.useState(false) // 是否只使用数据库数据
  
  // 🔄 分页状态管理
  const [currentPage, setCurrentPage] = React.useState(1)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [hasMorePages, setHasMorePages] = React.useState(true)
  const [totalImages, setTotalImages] = React.useState(0)
  const ITEMS_PER_PAGE = 12 // 每页显示12张图片
  
  // 🔍 过滤器状态
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [searchInput, setSearchInput] = React.useState(searchQuery || '')

  // 📦 获取初始数据
  const fetchInitialData = async () => {
    try {
      setLoading(true)
      console.log('🔄 开始获取Library初始数据...')
      const response = await fetch(`/api/library-images/?page=1&limit=${ITEMS_PER_PAGE}`)
      console.log('🔍 API响应状态:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 API响应数据:', { hasData: !!data, hasDataArray: !!data.data, dataLength: data.data?.length, pagination: data.pagination })
        const dbImages = data.data || []
        const total = data.pagination?.total || data.total || 0
        
        if (dbImages.length > 0) {
          console.log(`✅ 从数据库加载 ${dbImages.length} 张图片（总共${total}张）`)
          setLibraryImages(dbImages)
          setTotalImages(total)
          setUseOnlyDbData(true)
          setHasMorePages(dbImages.length < total)
        } else {
          console.log('⚠️ 数据库无图片，使用demo数据')
          // 为demo数据实现分页
          const paginatedDemoData = demoLibraryImages.slice(0, ITEMS_PER_PAGE)
          setLibraryImages(paginatedDemoData)
          setTotalImages(demoLibraryImages.length)
          setUseOnlyDbData(false)
          setHasMorePages(paginatedDemoData.length < demoLibraryImages.length)
        }
      } else {
        console.log('⚠️ API请求失败，使用demo数据，状态:', response.status)
        const paginatedDemoData = demoLibraryImages.slice(0, ITEMS_PER_PAGE)
        setLibraryImages(paginatedDemoData)
        setTotalImages(demoLibraryImages.length)
        setUseOnlyDbData(false)
        setHasMorePages(paginatedDemoData.length < demoLibraryImages.length)
      }
    } catch (error) {
      console.log('⚠️ 数据库不可用，使用demo数据')
      const paginatedDemoData = demoLibraryImages.slice(0, ITEMS_PER_PAGE)
      setLibraryImages(paginatedDemoData)
      setTotalImages(demoLibraryImages.length)
      setUseOnlyDbData(false)
      setHasMorePages(paginatedDemoData.length < demoLibraryImages.length)
    } finally {
      setLoading(false)
    }
  }

  // 📄 加载更多数据
  const loadMoreImages = async () => {
    if (loadingMore || !hasMorePages) return
    
    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      console.log(`🔄 加载第${nextPage}页数据...`)
      
      if (useOnlyDbData) {
        // 从数据库加载更多
        const response = await fetch(`/api/library-images/?page=${nextPage}&limit=${ITEMS_PER_PAGE}`)
        
        if (response.ok) {
          const data = await response.json()
          const newImages = data.data || []
          const currentTotal = data.pagination?.total || totalImages
          
          if (newImages.length > 0) {
            console.log(`✅ 加载了${newImages.length}张新图片`)
            setLibraryImages(prev => [...prev, ...newImages])
            setCurrentPage(nextPage)
            
            // 检查是否还有更多页面
            const totalLoaded = libraryImages.length + newImages.length
            setHasMorePages(totalLoaded < currentTotal)
            
            // 更新总数（以防数据库中的数据发生变化）
            setTotalImages(currentTotal)
          } else {
            console.log('📄 没有更多图片了')
            setHasMorePages(false)
          }
        } else {
          console.log('⚠️ 加载更多数据失败:', response.status)
          setHasMorePages(false)
        }
      } else {
        // 从demo数据加载更多
        const startIndex = currentPage * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const newImages = demoLibraryImages.slice(startIndex, endIndex)
        
        if (newImages.length > 0) {
          console.log(`✅ 从demo数据加载了${newImages.length}张新图片`)
          setLibraryImages(prev => [...prev, ...newImages])
          setCurrentPage(nextPage)
          
          // 检查是否还有更多页面
          const totalLoaded = libraryImages.length + newImages.length
          setHasMorePages(totalLoaded < demoLibraryImages.length)
        } else {
          console.log('📄 demo数据已全部加载完成')
          setHasMorePages(false)
        }
      }
    } catch (error) {
      console.error('⚠️ 加载更多数据时出错:', error)
      setHasMorePages(false)
    } finally {
      setLoadingMore(false)
    }
  }

  // 从数据库获取图片数据
  React.useEffect(() => {
    fetchInitialData()
  }, [])

  // Transform database data to ColoringPage format for backward compatibility with existing filter logic
  const coloringPages: ColoringPage[] = React.useMemo(() => {
    const result = libraryImages.map((image, index) => {
      // 🎯 确保UUID正确传递 - 优先保持原始UUID不变
      const coloringPage = {
        id: index + 1, // 使用索引作为数字ID，仅用于列表显示和排序
        title: image.title,
        description: image.description || '',
        tags: image.tags,
        src: image.imageUrl,
        category: image.category,
        dateAdded: new Date(image.createdAt),
        isNew: image.isFeatured || (new Date().getTime() - new Date(image.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000),
        originalId: image.id, // 🎯 关键：保存原始UUID，这个ID必须用于所有API调用
        difficulty: image.difficulty, // 🎯 保留原始difficulty信息
      }
      
      return coloringPage
    })
    
    console.log('📋 Library页面数据转换完成:', {
      总数量: result.length,
      使用数据库数据: useOnlyDbData,
      示例ID映射: result.length > 0 ? { 
        显示ID: result[0].id, 
        原始UUID: result[0].originalId,
        UUID格式检查: result[0].originalId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result[0].originalId) : false
      } : null
    })
    
    return result
  }, [libraryImages, useOnlyDbData])
  
  // 🔍 智能过滤逻辑：结合URL参数和本地过滤器状态
  const filteredPages = React.useMemo(() => {
    let filtered = [...coloringPages]
    
    // 1. Apply intelligent date filter (from URL)
    if (filterType === 'new') {
      let filterDate: Date
      
      if (since) {
        // Use specific date from URL parameter
        filterDate = new Date(since)
      } else {
        // Default fallback based on period or use one week ago
        switch (period) {
          case 'month':
            filterDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            break
          case 'quarter':
            const currentQuarter = Math.floor(new Date().getMonth() / 3)
            filterDate = new Date(new Date().getFullYear(), currentQuarter * 3, 1)
            break
          case 'year':
            filterDate = new Date(new Date().getFullYear(), 0, 1)
            break
          case 'week':
          default:
            filterDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            break
        }
      }
      
      console.log(`🔍 应用时间过滤: ${period || 'week'}, 起始日期: ${filterDate.toISOString()}`)
      filtered = filtered.filter(page => page.dateAdded >= filterDate)
    }
    
    // 2. Apply URL category filter
    if (filterType === 'category' && filterValue) {
      filtered = filtered.filter(page => 
        page.category.toLowerCase() === filterValue.toLowerCase()
      )
    }
    
    // 3. Apply local category filters (from checkboxes)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(page =>
        selectedCategories.some(category => 
          page.category.toLowerCase() === category.toLowerCase()
        )
      )
    }
    
    // 4. Apply local tag filters (from badge clicks)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(page =>
        selectedTags.some(selectedTag =>
          page.tags.some(pageTag => 
            pageTag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        )
      )
    }
    
    // 5. Apply search filter (URL or local input)
    const activeSearchQuery = searchInput || searchQuery
    if (activeSearchQuery) {
      const query = activeSearchQuery.toLowerCase()
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // 6. Apply difficulty filter (from URL parameter)
    if (difficulty) {
      // Map 'hard' to 'complex' for consistency with database values
      const mappedDifficulty = difficulty === 'hard' ? 'complex' : difficulty
      filtered = filtered.filter(page => page.difficulty === mappedDifficulty)
      console.log(`🔍 应用难度过滤: ${difficulty} (映射为: ${mappedDifficulty})`)
    }
    
    // 7. Apply imageId filter (show only specific image)
    if (imageId) {
      filtered = filtered.filter(page => page.originalId === imageId)
      console.log(`🔍 应用图片ID过滤: ${imageId}`)
    }
    
    console.log(`🔍 过滤结果: ${filtered.length}/${coloringPages.length} 张图片`, {
      selectedCategories: selectedCategories.length,
      selectedTags: selectedTags.length,
      searchQuery: activeSearchQuery,
      difficulty: difficulty,
      imageId: imageId
    })
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
  }, [coloringPages, filterType, filterValue, searchQuery, selectedCategories, selectedTags, searchInput, period, since, difficulty, imageId])

  // Convert ColoringPage back to LibraryImage format for LibraryImageCard component
  const convertToLibraryImage = (page: ColoringPage): LibraryImage => {
    // 🎯 智能ID处理：确保ID格式始终兼容收藏API
    let finalId: string
    
    // 1. 如果有有效的UUID原始ID，直接使用
    if (page.originalId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(page.originalId)) {
      finalId = page.originalId
    } 
    // 2. 如果原始ID已经是demo格式，保持不变
    else if (page.originalId && page.originalId.startsWith('demo-')) {
      finalId = page.originalId
    }
    // 3. 如果原始ID是纯数字，转换为demo格式
    else if (page.originalId && /^\d+$/.test(page.originalId)) {
      finalId = `demo-${page.originalId}`
    }
    // 4. 其他情况（包括originalId为空），使用页面ID生成demo格式
    else {
      finalId = `demo-${page.id}`
    }
    
    // 🎯 使用页面中保存的difficulty信息（从数据库直接传递过来）
    const actualDifficulty: "easy" | "medium" | "complex" = page.difficulty || "medium"
    
    return {
      id: finalId, // 🎯 确保这个ID能被收藏API正确处理
      title: page.title,
      description: page.description,
      imageUrl: page.src,
      printUrl: page.src, // Use same URL for print
      thumbnailUrl: page.src, // Use same URL as thumbnail
      tags: page.tags,
      category: page.category,
      difficulty: actualDifficulty, // 🎯 使用真实的difficulty值
      isActive: true,
      isFeatured: page.isNew,
      downloadCount: Math.floor(Math.random() * 100), // Random download count for demo
      viewCount: Math.floor(Math.random() * 500), // Random view count for demo
      uploadedBy: "demo-user",
      fileSize: 500000, // Default file size
      imageWidth: 1024,
      imageHeight: 1024,
      createdAt: page.dateAdded,
      updatedAt: page.dateAdded,
    }
  }

  // 🎯 过滤器事件处理函数
  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, category]
        : prev.filter(c => c !== category)
    )
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedTags([])
    setSearchInput('')
  }

  // 🔍 动态生成分类和标签列表
  const availableCategories = React.useMemo(() => {
    const categories = [...new Set(coloringPages.map(page => page.category))].sort()
    return categories
  }, [coloringPages])

  const availableTags = React.useMemo(() => {
    const allTags = coloringPages.flatMap(page => page.tags)
    const uniqueTags = [...new Set(allTags)].sort()
    return uniqueTags
  }, [coloringPages])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beautiful coloring pages...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto grid md:grid-cols-[280px_1fr] gap-8 px-4 md:px-6 py-8">
        <aside className="flex flex-col gap-6">
          {/* 搜索框 */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </h3>
            <Input 
              placeholder="e.g., Christmas coloring pages printable" 
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* 分类过滤器 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Filter by Category</h3>
              {selectedCategories.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedCategories.length} selected
                </Badge>
              )}
            </div>
            <div className="grid gap-2">
              {availableCategories.map((category) => {
                const isSelected = selectedCategories.includes(category)
                const count = coloringPages.filter(page => page.category === category).length
                
                return (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={category}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <label
                      htmlFor={category}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {category}
                      <span className="text-muted-foreground ml-1">({count})</span>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 标签过滤器 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Popular Tags</h3>
              {selectedTags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedTags.length} selected
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 12).map((tag) => { // 只显示前12个最常见的标签
                const isSelected = selectedTags.includes(tag)
                return (
                  <Badge 
                    key={tag} 
                    variant={isSelected ? "default" : "secondary"} 
                    className="cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* 清除过滤器按钮 */}
          {(selectedCategories.length > 0 || selectedTags.length > 0 || searchInput) && (
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Pro Tip
            </h4>
            <p className="text-sm text-muted-foreground">
              Use specific keywords like "princess birthday party" or "animal coloring" for better search results!
            </p>
          </div>
        </aside>

        <main>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {(() => {
                  if (filterType === 'new') return 'Fresh Coloring Pages Added'
                  if (filterType === 'category' && filterValue) return `${filterValue} Category`
                  if (imageId) {
                    return `Specific Coloring Page`
                  }
                  if (difficulty) {
                    const difficultyDisplay = difficulty === 'hard' ? 'Complex' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
                    return `${difficultyDisplay} Difficulty Coloring Pages`
                  }
                  if (searchInput || searchQuery) return `Search Results`
                  if (selectedCategories.length > 0) return `${selectedCategories.join(', ')} ${selectedCategories.length > 1 ? 'Categories' : 'Category'}`
                  return 'Curated Coloring Library'
                })()}
              </h1>
              
              {/* 副标题 */}
              {filterType === 'new' && (
                <p className="text-muted-foreground mt-1">
                  {period === 'month' ? 'New additions from this month' :
                   period === 'quarter' ? 'New additions from this quarter' :
                   period === 'year' ? 'New additions from this year' :
                   'New additions from this week'}
                </p>
              )}
              
              {/* 搜索查询显示 */}
              {(searchInput || searchQuery) && (
                <p className="text-muted-foreground mt-1">
                  Searching for coloring pages printable matching "{searchInput || searchQuery}"
                </p>
              )}
              
              {/* 活跃过滤器显示 */}
              {(selectedCategories.length > 0 || selectedTags.length > 0) && !searchInput && !searchQuery && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <Badge key={category} variant="default" className="text-xs">
                      📂 {category}
                    </Badge>
                  ))}
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      🏷️ {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* 数据来源指示器 */}
              {!loading && (
                <div className="mt-2">
                  <Badge variant={useOnlyDbData ? "default" : "secondary"} className="text-xs">
                    {useOnlyDbData ? `📊 Database Content (${libraryImages.length} images)` : `🎭 Demo Content`}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{filteredPages.length}</p>
              <p className="text-sm text-muted-foreground">coloring pages</p>
              {filteredPages.length !== coloringPages.length && (
                <p className="text-xs text-muted-foreground">of {coloringPages.length} total</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredPages.map((page, index) => {
              const libraryImage = convertToLibraryImage(page)
              return (
                <LibraryImageCard
                  key={`library-card-${page.id}-${index}`}
                  image={libraryImage}
                  showDifficulty={true}
                  showCategory={true}
                  className=""
                />
              )
            })}
          </div>

          {/* 加载更多按钮 */}
          {hasMorePages && (
            <div className="flex justify-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                onClick={loadMoreImages}
                disabled={loadingMore}
                className="min-w-[200px]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading More...
                  </>
                ) : (
                  'Load More Pages'
                )}
              </Button>
            </div>
          )}
          
          {/* 全部加载完成提示 */}
          {!hasMorePages && filteredPages.length > ITEMS_PER_PAGE && (
            <div className="text-center mt-12 p-6 border border-dashed border-muted-foreground/25 rounded-lg bg-muted/20">
              <p className="text-muted-foreground font-medium mb-1">
                🎉 You've seen all {filteredPages.length} coloring pages printable in our library!
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later for new additions to our collection.
              </p>
            </div>
          )}
        </main>
      </div>

    </>
  )
}