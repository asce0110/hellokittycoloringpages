"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Shield,
  Home,
  Palette,
  ImageIcon,
  Sparkles,
  BookOpen
} from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { LogoCompact } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortLabel?: string
}

const navItems: MobileNavItem[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: Home },
  { href: "/ai-coloring", label: "AI Coloring", shortLabel: "AI", icon: Palette },
  { href: "/library", label: "Art Gallery", shortLabel: "Gallery", icon: ImageIcon },
  { href: "/create", label: "AI Studio", shortLabel: "Create", icon: Sparkles },
  { href: "/blog", label: "Coloring Tips", shortLabel: "Tips", icon: BookOpen },
]

export function MobileNavigation() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  if (!isMobile) return null

  return (
    <header className="px-3 h-14 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50 md:hidden">
      {/* Logo - 移动端紧凑版本 */}
      <LogoCompact />
      
      {/* 右侧控制区域 */}
      <div className="flex items-center gap-2">
        {/* 用户菜单 */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/placeholder-user.jpg" alt={user?.name || ""} />
                  <AvatarFallback className="text-xs">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user?.email}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {user?.isProUser && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        <Crown className="h-2 w-2 mr-1" />
                        Pro
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge variant="destructive" className="text-xs px-1 py-0">
                        <Shield className="h-2 w-2 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer text-sm">
                  <User className="mr-2 h-3 w-3" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer text-sm">
                    <Shield className="mr-2 h-3 w-3" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer text-sm">
                  <Settings className="mr-2 h-3 w-3" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-sm">
                <LogOut className="mr-2 h-3 w-3" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" className="h-8 px-3 text-xs">
            <Link href="/login">Sign In</Link>
          </Button>
        )}

        {/* 主题切换 - 移动端小尺寸 */}
        <div className="scale-75">
          <ThemeToggleButton />
        </div>

        {/* 汉堡菜单 */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 px-3">
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Palette className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Navigation</span>
              </div>
              
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

// 移动端底部导航栏（可选）
export function MobileBottomNavigation() {
  const isMobile = useIsMobile()
  
  if (!isMobile) return null

  const mainNavItems = navItems.slice(0, 4) // 只显示主要的4个导航项

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-40 md:hidden">
      <nav className="flex items-center justify-around px-2 py-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium text-muted-foreground hover:text-primary transition-colors min-w-0"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate max-w-[60px]">{item.shortLabel}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

