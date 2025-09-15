import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fairy Princess Coloring Pages Printable | Free Download | Coloreveal",
  description: "Download free fairy princess coloring pages printable! 10+ magical designs featuring castle princesses, butterfly fairy princesses, crown princesses & garden fairy adventures. Print instantly at home for kids and adults.",
  openGraph: {
    title: "Fairy Princess Coloring Pages Printable | Coloreveal",
    description: "Free fairy princess coloring pages with castle, butterfly, and garden themes. Perfect for kids who love magical fairy princesses!",
    type: "website",
    images: [
      {
        url: "/fairy-princess-collection-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Fairy princess coloring pages collection"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Fairy Princess Coloring Pages Printable | Coloreveal", 
    description: "Free fairy princess coloring pages with magical castle, butterfly, and garden themes.",
    images: ["/fairy-princess-collection-preview.jpg"]
  },
  alternates: {
    canonical: "/fairy-princess-coloring-pages"
  }
}

export default function FairyPrincessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}