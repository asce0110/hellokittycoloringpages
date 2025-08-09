import * as React from "react"
import { ColoringPageClient } from "./coloring-page-client"

// Generate static params for static export
export async function generateStaticParams() {
  // Generate some sample IDs for static export
  return Array.from({ length: 12 }, (_, i) => ({
    id: (i + 1).toString(),
  }))
}

export default async function ColorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <ColoringPageClient params={resolvedParams} />
}