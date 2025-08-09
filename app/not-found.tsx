import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cat } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Cat className="h-24 w-24 text-primary opacity-80" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-xl text-muted-foreground">
            Oops! This Hello Kitty page seems to have wandered off.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist. Let's get you back to creating amazing coloring pages!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/library">Browse Library</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}