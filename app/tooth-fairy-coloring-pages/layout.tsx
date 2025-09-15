import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tooth Fairy Coloring Pages Printable | Free Download | Coloreveal",
  description: "Download free tooth fairy coloring pages printable! 10+ magical designs featuring cute tooth fairies, lost teeth adventures, fairy pillows & tooth fairy castles. Print instantly at home for kids.",
  keywords: "tooth fairy coloring pages, tooth fairy coloring pages printable, printable tooth fairy coloring sheets, tooth fairy printables, free tooth fairy coloring pages, tooth fairy lost tooth coloring",
  openGraph: {
    title: "Tooth Fairy Coloring Pages Printable | Coloreveal",
    description: "Free tooth fairy coloring pages with magical lost tooth adventures, fairy pillows, and cute tooth fairy designs. Perfect for kids!",
    type: "website",
    images: [
      {
        url: "/tooth-fairy-collection-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Tooth fairy coloring pages collection"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Tooth Fairy Coloring Pages Printable | Coloreveal", 
    description: "Free tooth fairy coloring pages with magical lost tooth adventures and cute fairy designs.",
    images: ["/tooth-fairy-collection-preview.jpg"]
  },
  alternates: {
    canonical: "/tooth-fairy-coloring-pages"
  }
}

export default function ToothFairyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}