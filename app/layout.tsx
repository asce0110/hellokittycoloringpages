import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { Navigation } from "@/components/navigation"
import "./globals.css"

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700", "800"] })

export const metadata: Metadata = {
  title: "AI Kitty Creator - Free Printable Hello Kitty Coloring Pages & AI Art",
  description:
    "The ultimate destination for free printable Hello Kitty coloring pages. Explore a huge library of official art or use our AI to create unique, personalized coloring sheets for kids and adults.",
  keywords:
    "Hello Kitty coloring pages, printable coloring sheets, AI art generator, free coloring pages, kids activities, Sanrio coloring, creative activities, AI coloring book",
  generator: 'v0.dev'
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AI Kitty Creator",
  url: "https://your-website-url.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://your-website-url.com/library?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={nunito.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex flex-col min-h-screen bg-background">
              <Navigation />
              <main className="flex-1">{children}</main>
              <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted">
                <p className="text-xs text-muted-foreground">&copy; 2025 AI Kitty Creator. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                  <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
                    Terms of Service
                  </Link>
                  <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
                    Privacy Policy
                  </Link>
                </nav>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
