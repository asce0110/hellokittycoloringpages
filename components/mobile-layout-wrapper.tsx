"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface MobileLayoutWrapperProps {
  children: React.ReactNode
}

export function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isColoringPage, setIsColoringPage] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Check if this is a coloring page (slug-based route that's not in static routes)
    const staticRoutes = [
      'admin', 'community', 'create', 'dashboard', 
      'library', 'login', 'settings', 'api', 'color',
      'debug', 'diagnosis', 'diagnostic', 'privacy', 'terms', 
      'blog', 'unsubscribe'
    ]
    
    const pathSegments = pathname.split('/').filter(Boolean)
    const isStatic = pathSegments.length > 0 && staticRoutes.includes(pathSegments[0])
    const isDynamicColoringPage = pathSegments.length === 1 && !isStatic
    
    setIsColoringPage(isDynamicColoringPage)
  }, [pathname])

  // Hide footer on mobile coloring pages
  const shouldHideFooter = isMobile && isColoringPage

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1">
        {children}
      </div>
      {!shouldHideFooter && (
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted">
          <p className="text-xs text-muted-foreground">&copy; 2025 Coloreveal. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <a className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="/unsubscribe">
              Unsubscribe
            </a>
            <a className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="/terms">
              Terms of Service
            </a>
            <a className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="/privacy">
              Privacy Policy
            </a>
          </nav>
        </footer>
      )}
    </div>
  )
}