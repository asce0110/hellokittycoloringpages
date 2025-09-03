"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggleButton() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return (
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  // Determine the current effective theme
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Toggle between light and dark (skip system theme for direct toggle)
  const toggleTheme = () => {
    if (isDark) {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={toggleTheme}
      className="relative transition-all duration-200 hover:scale-105"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 ${
        isDark 
          ? 'rotate-90 scale-0 opacity-0' 
          : 'rotate-0 scale-100 opacity-100'
      }`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 ${
        isDark 
          ? 'rotate-0 scale-100 opacity-100' 
          : '-rotate-90 scale-0 opacity-0'
      }`} />
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  )
}