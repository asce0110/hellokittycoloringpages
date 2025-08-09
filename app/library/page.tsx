"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Printer, Download, Palette, Search, Wand2 } from "lucide-react"

// Type matching database structure
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

// Original ColoringPage format
type ColoringPage = {
  id: number
  title: string
  description: string
  tags: string[]
  src: string
  category: string
  dateAdded: Date
  isNew: boolean
}

export default function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPage, setSelectedPage] = React.useState<ColoringPage | null>(null)
  
  // Get filter parameters from URL
  const filterType = searchParams.get('filter') // 'new', 'category', etc.
  const filterValue = searchParams.get('value') // specific category value
  const searchQuery = searchParams.get('search') // search term
  
  // Real database data state
  const [libraryImages, setLibraryImages] = React.useState<LibraryImage[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch real data from database
  React.useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/library-images?limit=50')
        if (response.ok) {
          const data = await response.json()
          setLibraryImages(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch library images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLibraryData()
  }, [])

  // Transform database data to original format for UI compatibility
  const coloringPages: ColoringPage[] = React.useMemo(() => {
    return libraryImages.map((image, index) => ({
      id: parseInt(image.id) || index + 1,
      title: image.title,
      description: image.description || '',
      tags: image.tags,
      src: image.imageUrl,
      category: image.category,
      dateAdded: new Date(image.createdAt),
      isNew: image.isFeatured || (new Date().getTime() - new Date(image.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000) // New if featured or within 7 days
    }))
  }, [libraryImages])
  
  // Filter pages based on URL parameters (original filtering logic)
  const filteredPages = React.useMemo(() => {
    let filtered = [...coloringPages]
    
    // Apply date filter
    if (filterType === 'new') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(page => page.dateAdded >= oneWeekAgo)
    }
    
    // Apply category filter
    if (filterType === 'category' && filterValue) {
      filtered = filtered.filter(page => 
        page.category.toLowerCase() === filterValue.toLowerCase()
      )
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
  }, [coloringPages, filterType, filterValue, searchQuery])

  const handleDownload = async (src: string, title: string) => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/ /g, "-").toLowerCase()}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Sorry, the image could not be downloaded.")
    }
  }

  const handlePrint = (src: string) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print Coloring Page</title></head>
          <body style="margin: 0; text-align: center;">
            <img src="${src}" style="max-width: 100%; max-height: 100vh;" onload="window.print(); window.close();" />
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleColorOnline = (page: ColoringPage) => {
    router.push(`/color/${page.id}?src=${encodeURIComponent(page.src)}`)
  }

  const categories = ["Characters", "Holidays", "Scenes", "Seasons", "Difficulty"]
  const tags = ["Christmas", "Halloween", "Astronaut", "Princess", "Pirate", "Summer", "Winter", "Easy", "Complex"]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beautiful Hello Kitty coloring pages...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto grid md:grid-cols-[280px_1fr] gap-8 px-4 md:px-6 py-8">
        <aside className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </h3>
            <Input placeholder="e.g., Christmas Hello Kitty" />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Filter by Category</h3>
            <div className="grid gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox id={category} />
                  <label
                    htmlFor={category}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Pro Tip
            </h4>
            <p className="text-sm text-muted-foreground">
              Use specific keywords like "Hello Kitty birthday party" for better search results!
            </p>
          </div>
        </aside>

        <main>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {filterType === 'new' ? 'Fresh Coloring Pages Added' : 
                 filterType === 'category' ? `${filterValue} Category` :
                 searchQuery ? `Search Results for "${searchQuery}"` :
                 'Curated Coloring Library'}
              </h1>
              {filterType === 'new' && (
                <p className="text-muted-foreground mt-1">New additions from this week</p>
              )}
            </div>
            <p className="text-muted-foreground">{filteredPages.length} coloring pages</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPages.map((page) => (
              <Card
                key={page.id}
                className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedPage(page)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={page.src || "/placeholder.svg"}
                      alt={page.title}
                      width={400}
                      height={400}
                      className="object-cover w-full aspect-square transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrint(page.src)
                        }}
                      >
                        <Printer className="h-5 w-5" />
                        <span className="sr-only">Print</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(page.src, page.title)
                        }}
                      >
                        <Download className="h-5 w-5" />
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleColorOnline(page)
                        }}
                      >
                        <Palette className="h-5 w-5" />
                        <span className="sr-only">Color Online</span>
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {page.isNew && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          New
                        </Badge>
                      )}
                      {page.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Button variant="outline" size="lg">
              Load More Pages
            </Button>
          </div>
        </main>
      </div>

      {/* --- Preview Modal --- */}
      <Dialog open={!!selectedPage} onOpenChange={(isOpen) => !isOpen && setSelectedPage(null)}>
        <DialogContent className="max-w-3xl p-0">
          {selectedPage && (
            <div className="grid md:grid-cols-2">
              <div className="p-4 md:p-8 flex items-center justify-center bg-muted">
                <Image
                  src={selectedPage.src || "/placeholder.svg"}
                  alt={selectedPage.title}
                  width={600}
                  height={600}
                  className="object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="p-6 flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2">{selectedPage.title}</DialogTitle>
                  <DialogDescription>{selectedPage.description}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 my-4">
                  {selectedPage.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto space-y-3">
                  <Button size="lg" className="w-full" onClick={() => handleColorOnline(selectedPage)}>
                    <Palette className="mr-2 h-5 w-5" />
                    Color Online
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full"
                    onClick={() => handlePrint(selectedPage.src)}
                  >
                    <Printer className="mr-2 h-5 w-5" />
                    Print
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleDownload(selectedPage.src, selectedPage.title)}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}