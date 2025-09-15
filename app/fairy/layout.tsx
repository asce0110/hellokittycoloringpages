import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fairy Coloring Pages Printable | Coloreveal Magical Collection",
  description: "Discover enchanting fairy coloring pages printable for all ages! Woodland fairies, butterfly fairies, flower fairies, garden fairies & magical fairy designs. Free instant download & print at home.",
  keywords: "fairy coloring pages, fairy coloring pages printable, printable fairy coloring sheets, woodland fairy coloring, butterfly fairy coloring, flower fairy printables, magical fairy designs, free fairy coloring pages",
  openGraph: {
    title: "Fairy Coloring Pages Printable | Coloreveal",
    description: "Discover magical fairy coloring pages for kids and adults. Free printable fairy designs including woodland, butterfly, flower, and garden fairies.",
    type: "website",
    images: [
      {
        url: "/fairy-collection-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Fairy coloring pages collection preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Fairy Coloring Pages Printable | Coloreveal",
    description: "Discover magical fairy coloring pages for kids and adults. Free printable fairy designs.",
    images: ["/fairy-collection-preview.jpg"]
  }
}

export default function FairyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}