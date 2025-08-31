"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Download } from "lucide-react"
import { HelloKittyDrawing } from "@/lib/hello-kitty-drawings"

interface HelloKittyDrawingCardProps {
  drawing: HelloKittyDrawing
}

export function HelloKittyDrawingCard({ drawing }: HelloKittyDrawingCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={drawing.thumbnailUrl || drawing.imageUrl}
            alt={drawing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/hello-kitty-coloring-page.png'
            }}
          />
          <div className="absolute top-2 left-2">
            <Badge className="bg-pink-100 text-pink-800 border-pink-200">
              #{drawing.id}
            </Badge>
          </div>
          {drawing.featured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
          {drawing.title}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{drawing.description}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {drawing.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {drawing.difficulty}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button asChild size="sm" className="text-xs">
            <Link href={`/hello-kitty-drawings/${drawing.id}`}>
              🎨 Color Online
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => {
              const link = document.createElement('a')
              link.href = drawing.printUrl || drawing.imageUrl
              link.download = `hello-kitty-drawing-${drawing.id}.png`
              link.click()
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}