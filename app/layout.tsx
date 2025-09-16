import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { FavoritesProvider } from "@/hooks/use-favorites"
import { Navigation } from "@/components/navigation"
import { MobileLayoutWrapper } from "@/components/mobile-layout-wrapper"
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
    name: "Coloreveal Creative Collection",
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
              <MobileLayoutWrapper>
                <Navigation />
                <main className="flex-1">{children}</main>
              </MobileLayoutWrapper>
              <Toaster />
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
