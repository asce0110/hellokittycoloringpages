import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { FavoritesProvider } from "@/hooks/use-favorites"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700", "800"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://coloringpagesprintable.net'),
  title: "Coloreveal - Free Printable Coloring Pages for Adults & Kids",
  description:
    "Welcome to Coloreveal! Discover 1000s of free printable coloring pages & experience our interactive online coloring tool. New designs added weekly for all ages!",
  keywords:
    "Coloreveal, free coloring pages, printable coloring pages, online coloring tool, coloring sheets, fairy coloring pages, adults coloring, kids coloring, interactive coloring",
  generator: 'Coloreveal',
  applicationName: 'Coloreveal',
  appleWebApp: {
    capable: true,
    title: 'Coloreveal',
    statusBarStyle: 'default'
  },
  manifest: '/manifest.json',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.svg',
      type: 'image/svg+xml',
    },
    {
      rel: 'apple-touch-icon',
      url: '/apple-icon.svg',
      type: 'image/svg+xml',
    }
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large'
    }
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Coloreveal",
  alternateName: "Free Printable Coloring Pages & Interactive Online Coloring Tool",
  url: "https://coloringpagesprintable.net",
  description: "Coloreveal - Discover 1000s of free printable coloring pages & experience our interactive online coloring tool. New designs added weekly for all ages!",
  keywords: "Coloreveal, free coloring pages, printable coloring pages, online coloring tool, interactive coloring, adults, kids",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://coloringpagesprintable.net/library?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  mainEntity: {
    "@type": "CreativeWork",
    name: "Color Spark Creative Collection",
    description: "Curated themes and AI-generated printable coloring pages designed to spark creativity"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 触发服务启动预加载（仅在服务端执行）
  if (typeof window === 'undefined') {
    import('@/lib/startup-preloader').then(({ triggerStartupPreload }) => {
      triggerStartupPreload().catch(console.error)
    })
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={nunito.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FavoritesProvider>
              <div className="flex flex-col min-h-screen bg-background">
                <Navigation />
                <main className="flex-1">{children}</main>
                <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted">
                  <p className="text-xs text-muted-foreground">&copy; 2025 Color Spark. All rights reserved.</p>
                  <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="/unsubscribe">
                      Unsubscribe
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="/terms">
                      Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="/privacy">
                      Privacy Policy
                    </Link>
                  </nav>
                </footer>
              </div>
              <Toaster />
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
