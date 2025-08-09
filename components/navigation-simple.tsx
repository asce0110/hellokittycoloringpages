"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cat } from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"

export function NavigationSimple() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center">
        <Cat className="h-7 w-7 text-primary" />
        <span className="ml-2 text-lg font-extrabold text-foreground">AI Kitty Creator</span>
      </Link>
      
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/library">
          Library
        </Link>
        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/create">
          AI Create
        </Link>
        <Link className="text-sm font-medium hover:text-primary transition-colors" href="/community">
          Community
        </Link>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <ThemeToggleButton />
      </nav>
    </header>
  )
}