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

// Define a type for our coloring page data
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

// Mock data for the library with different categories and dates
const coloringPages: ColoringPage[] = [
  // Fresh/New pages (this week)
  {
    id: 1,
    title: "Astronaut Kitty Explorer",
    description: "Space adventure awaits!",
    tags: ["Adventure", "Medium", "Space"],
    src: `/astronaut-cat-coloring-page.png`,
    category: "Adventure",
    dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isNew: true
  },
  {
    id: 2,
    title: "Chef Kitty Cooking",
    description: "Master chef in the kitchen!",
    tags: ["Characters", "Easy", "Kitchen"],
    src: `/hello-kitty-coloring-page.png?query=chef`,
    category: "Characters",
    dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isNew: true
  },
  {
    id: 3,
    title: "Fairy Kitty Magic",
    description: "Magical fairy tale adventure!",
    tags: ["Fantasy", "Medium", "Magic"],
    src: `/cute-kitty-coloring-page.png`,
    category: "Fantasy",
    dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isNew: true
  },
  {
    id: 4,
    title: "Pirate Kitty Treasure Hunt",
    description: "Ahoy! Adventure on the high seas!",
    tags: ["Adventure", "Hard", "Pirates"],
    src: `/hello-kitty-coloring-page.png?query=pirate`,
    category: "Adventure",
    dateAdded: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    isNew: true
  },
  // Older pages
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: i + 5,
    title: `Classic Kitty #${i + 1}`,
    description: "Timeless Hello Kitty fun!",
    tags: ["Characters", "Easy"],
    src: `/hello-kitty-coloring-page.png?${i + 1}`,
    category: "Characters",
    dateAdded: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000), // 10+ days ago
    isNew: false
  }))
]

export default function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPage, setSelectedPage] = React.useState<ColoringPage | null>(null)
  
  // Get filter parameters from URL
  const filterType = searchParams.get('filter') // 'new', 'category', etc.
  const filterValue = searchParams.get('value') // specific category value
  const searchQuery = searchParams.get('search') // search term
  
  // Filter pages based on URL parameters
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
  }, [filterType, filterValue, searchQuery])

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
