import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2 } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CreatePage() {
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
              placeholder="e.g., A cute cat wearing an astronaut helmet, floating in space with Earth in the background, surrounded by stars and planets"
              className="min-h-[120px] text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Art Style</label>
              <Select defaultValue="classic">
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
              <Select defaultValue="medium">
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

          <Button size="lg" className="w-full">
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Coloring Page
          </Button>
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

      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Generated Results</h2>
          <Badge variant="secondary">4 of 4 daily generations used</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={`/astronaut-cat-coloring-page.png?height=300&width=300&query=AI+generated+astronaut+cat+coloring+page+${i + 1}`}
                    alt={`AI generated coloring page ${i + 1}`}
                    width={300}
                    height={300}
                    className="object-cover w-full aspect-square"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      Select This One
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground">Generated 2 min ago</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Love what you see? Save your favorites and create more tomorrow!
          </p>
          <Button variant="outline">View My Creations</Button>
        </div>
      </div>
    </div>
  )
}
