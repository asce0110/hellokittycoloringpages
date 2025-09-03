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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://coloringpagesprintable.net'),
  title: "Coloring Pages Printable | Free Download & Print Instantly",
  description:
    "Download free printable coloring pages instantly! 500+ original designs ready to print. Perfect for kids, adults, teachers & parents. Your ultimate source for high-quality coloring sheets.",
  keywords:
    "coloring pages printable, printable coloring pages, free coloring pages, coloring sheets, free printable coloring sheets, coloring pages for kids, coloring pages for adults, educational coloring pages, original coloring designs",
  generator: 'coloringpagesprintable.net',
  applicationName: 'Coloring Pages Printable',
  appleWebApp: {
    capable: true,
    title: 'Coloring Pages Printable',
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
  name: "Coloring Pages Printable",
  alternateName: "Free AI Generated Coloring Sheets",
  url: "https://coloringpagesprintable.net",
  description: "Free printable coloring pages for kids and adults. AI-generated unique designs for instant download and creative fun",
  keywords: "coloring pages printable, printable coloring pages, ai coloring pages, free coloring sheets",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://coloringpagesprintable.net/library?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  mainEntity: {
    "@type": "CreativeWork",
    name: "AI Coloring Pages Printable Collection",
    description: "Comprehensive collection of AI-generated original printable coloring sheets"
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
                  <p className="text-xs text-muted-foreground">&copy; 2025 Coloring Pages Printable. All rights reserved.</p>
                  <nav className="sm:ml-auto flex gap-4 sm:gap-6">
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
