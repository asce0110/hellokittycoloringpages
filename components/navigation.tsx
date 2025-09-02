"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, Crown, Shield } from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileNavigation } from "@/components/mobile-navigation"

export function Navigation() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const isMobile = useIsMobile()

  // 在移动端显示移动端导航
  if (isMobile) {
    return <MobileNavigation />
  }

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      {/* 桌面端Logo - 在中等屏幕隐藏文字 */}
      <Logo showText={true} className="hidden md:flex" />
      <Logo showText={false} className="flex md:hidden" />
      
      <nav className="ml-auto flex items-center gap-2 sm:gap-4 lg:gap-6">
        <Link className="text-xs sm:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" href="/">
          <span className="hidden sm:inline">Home</span>
          <span className="sm:hidden">Home</span>
        </Link>
        <Link className="text-xs sm:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" href="/ai-coloring">
          <span className="hidden lg:inline">AI Coloring</span>
          <span className="hidden sm:inline lg:hidden">AI</span>
          <span className="sm:hidden">AI</span>
        </Link>
        <Link className="text-xs sm:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" href="/library">
          <span className="hidden lg:inline">Art Gallery</span>
          <span className="hidden sm:inline lg:hidden">Gallery</span>
          <span className="sm:hidden">Art</span>
        </Link>
        <Link className="text-xs sm:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap" href="/create">
          <span className="hidden lg:inline">AI Studio</span>
          <span className="hidden sm:inline lg:hidden">Create</span>
          <span className="sm:hidden">+</span>
        </Link>
        <Link className="text-xs sm:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap hidden sm:inline-flex" href="/blog">
          <span className="hidden lg:inline">Coloring Tips</span>
          <span className="lg:hidden">Tips</span>
        </Link>
        
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                  <AvatarImage src="/placeholder-user.jpg" alt={user?.name || ""} />
                  <AvatarFallback className="text-xs">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex gap-1">
                    {user?.isProUser && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge variant="destructive" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
            <Link href="/login">
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </Button>
        )}
        
        <div className="scale-75 sm:scale-100">
          <ThemeToggleButton />
        </div>
      </nav>
    </header>
  )
}