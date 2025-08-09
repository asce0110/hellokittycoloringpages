import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Download, Share2, Palette } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Community Gallery</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover amazing coloring pages created by our community using AI. Get inspired and share your own creations!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 16 }).map((_, i) => (
          <Card key={i} className="overflow-hidden group hover:shadow-lg transition-all">
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={`/ai-community-coloring.png?height=300&width=300&query=community+AI+generated+coloring+page+${i + 1}`}
                  alt={`Community creation ${i + 1}`}
                  width={300}
                  height={300}
                  className="object-cover w-full aspect-square"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    AI Created
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button asChild size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Link href={`/color/${i + 1}?src=${encodeURIComponent('/ai-community-coloring.png')}`}>
                      <Palette className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">Dragon Princess Adventure</h3>
                <p className="text-xs text-muted-foreground">by @creativemom</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      Fantasy
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Princess
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    <span>24</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Button variant="outline" size="lg">
          Load More Creations
        </Button>
      </div>
    </div>
  )
}