"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Menu, 
  ChevronUp, 
  ChevronDown, 
  Lightbulb,
  BookOpen,
  Palette,
  HelpCircle
} from "lucide-react"
import { ColoringPageData } from "@/lib/coloring-data"

interface MobileSEOSidebarProps {
  coloringPage: ColoringPageData
  educationalContent: any
  coloringTips: any[]
  coloringFAQs: any[]
}

export function MobileSEOSidebar({ 
  coloringPage, 
  educationalContent, 
  coloringTips, 
  coloringFAQs 
}: MobileSEOSidebarProps) {
  const [showTips, setShowTips] = useState(false)
  const [showEducational, setShowEducational] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)

  return (
    <div className="lg:hidden fixed bottom-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-kitty-pink to-purple-500 hover:from-kitty-pink-dark hover:to-purple-600 text-white"
          >
            <Menu className="h-5 w-5 mr-2" />
            Learn More
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
          <SheetHeader>
            <SheetTitle className="text-gray-900 dark:text-gray-100">Coloring Guide & Tips</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            {/* Coloring tips */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <Collapsible open={showTips} onOpenChange={setShowTips}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                      <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Coloring Tips
                      </CardTitle>
                      {showTips ? <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-3 space-y-3">
                      {coloringTips.map((tip, index) => (
                        <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg">
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-1 text-gray-900 dark:text-gray-100">
                            <span>{tip.icon}</span>
                            {tip.title}
                          </h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {tip.content}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* Educational value */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <Collapsible open={showEducational} onOpenChange={setShowEducational}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left hover:bg-green-50 dark:hover:bg-green-900/20">
                      <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        Educational Value
                      </CardTitle>
                      {showEducational ? <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-3 space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                        <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Skills Development</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {educationalContent.skills.slice(0, 3).map((skill: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                              <span className="h-1 w-1 bg-green-500 rounded-full flex-shrink-0"></span>
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                        <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Coloring Tips</h4>
                        <div className="space-y-1">
                          {educationalContent.tips.slice(0, 2).map((tip: string, index: number) => (
                            <p key={index} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              • {tip}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* Common questions */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <Collapsible open={showFAQ} onOpenChange={setShowFAQ}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
                        <HelpCircle className="h-4 w-4 text-blue-500" />
                        Common Questions
                      </CardTitle>
                      {showFAQ ? <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-3 space-y-3">
                      {coloringFAQs.slice(0, 3).map((faq, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                          <h4 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">{faq.question}</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}