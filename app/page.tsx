"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BowIcon } from "@/components/icons/bow-icon"
import { Library, Sparkles, HelpCircle } from "lucide-react"

const MovingImageBanner = dynamic(
  () => import("@/components/moving-image-banner").then((mod) => mod.MovingImageBanner),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" />,
  },
)

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/20 relative overflow-hidden">
        {/* Background Elements */}
        <MovingImageBanner className="z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 z-1" />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-2" />

        {/* Foreground Content */}
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white drop-shadow-lg">
                AI Kitty Creator Studio
              </h1>
              <p className="mx-auto max-w-[700px] text-white/90 md:text-xl drop-shadow-md">
                Explore thousands of curated Hello Kitty coloring pages or create unique designs with AI. Print, color,
                and unleash your creativity!
              </p>
            </div>
            <div className="space-x-4">
              {/* --- UPDATED: Added 'active' state animation --- */}
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Link href="/library">Browse Library</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white bg-transparent hover:bg-white/10 backdrop-blur-sm px-8 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Link href="/create">Create with AI</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card relative -mt-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-full bg-muted px-4 py-2 text-sm font-semibold text-primary">
              New This Week
            </div>
            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-gray-800 dark:text-gray-200">
              Fresh Coloring Pages Added
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Our team carefully curates and adds new high-quality Hello Kitty coloring pages every week.
            </p>
            <Link href="/library?filter=new">
              <Button variant="outline" className="mt-4">
                View All New Pages
              </Button>
            </Link>
          </div>
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              { title: "Astronaut Kitty", query: "astronaut", image: "/astronaut-cat-coloring-page.png" },
              { title: "Chef Kitty", query: "chef", image: "/hello-kitty-coloring-page.png?query=chef" },
              { title: "Fairy Kitty", query: "fairy", image: "/cute-kitty-coloring-page.png" },
              { title: "Pirate Kitty", query: "pirate", image: "/hello-kitty-coloring-page.png?query=pirate" },
            ].map((item, i) => (
              <Link 
                key={i} 
                href={`/library?filter=new&search=${item.query}`}
                className="block"
              >
                <Card
                  className="overflow-hidden group cursor-pointer shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-0">
                    <Image
                      src={item.image}
                      alt={`Featured coloring page: ${item.title}`}
                      width={300}
                      height={300}
                      className="object-cover w-full aspect-square transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">A new adventure awaits!</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">New</Badge>
                        <Badge>Popular</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl">
              How It Works: Two Paths to Creativity
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Choose your adventure! Explore our curated collection or become the creator.
            </p>
          </div>
          <div className="mx-auto grid gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-card rounded-2xl shadow-md">
              <Library className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">1. Explore the Official Library</h3>
              <p className="text-muted-foreground">
                Browse thousands of high-resolution, ready-to-print coloring pages. Our library is meticulously
                organized by themes, characters, and difficulty. Find your favorite, click, and instantly download or
                print. Perfect for quick, reliable fun.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-card rounded-2xl shadow-md">
              <Sparkles className="h-12 w-12 mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-2">2. Create with AI</h3>
              <p className="text-muted-foreground">
                Unleash your imagination! Describe any scene, character, or theme in our AI creator tool. "Hello Kitty
                as an astronaut on Mars," or "a garden party with all Sanrio characters." Our AI will generate a unique,
                personalized coloring page just for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-8 md:py-16 lg:py-20 bg-white dark:bg-card">
        <div className="container px-4 md:px-6 text-center">
          <BowIcon className="h-16 w-16 mx-auto text-primary opacity-80" />
          <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl mb-4 text-gray-800 dark:text-gray-200 mt-2">
            Your Ultimate Destination for Kitty Coloring Fun
          </h2>
          <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl">
            Welcome to AI Kitty Creator, the premier online hub for high-quality, printable Hello Kitty coloring pages.
            Whether you're a parent looking for a fun and creative activity for your kids, an adult seeking a relaxing
            nostalgic pastime, or an artist wanting to create something truly unique, our platform offers something for
            everyone.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <HelpCircle className="h-10 w-10 mb-2" />
            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Have questions? We have answers. Here are some common queries from our community.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-bold">Are the coloring pages really free?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Yes! A large portion of our official library and a limited number of daily AI generations are
                  completely free for personal use. We offer a Premium plan for users who want unlimited access,
                  exclusive content, and higher-resolution downloads.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-bold">What format are the downloads in?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  All coloring pages are available as high-quality, print-ready PDF files. This ensures they look crisp
                  and clean when printed on standard A4 or US Letter paper.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-bold">
                  Can I use these images for commercial purposes?
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  No, all content generated or downloaded from our site is for personal, non-commercial use only. This
                  includes coloring for fun, educational purposes, or personal crafts. For commercial licensing, please
                  contact us directly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-bold">How good is the AI generation?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Our AI is specifically trained to produce clean, high-contrast line art suitable for coloring. It
                  excels at interpreting creative prompts and maintaining the "Kitty" art style. While it's always
                  improving, users are consistently amazed by the quality and creativity of the results.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  )
}
