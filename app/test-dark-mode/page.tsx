"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, SwatchBook, Clock, Star } from 'lucide-react'

export default function TestDarkModePage() {
  const [isDark, setIsDark] = useState(false)

  return (
    <div className={`min-h-screen p-4 ${isDark ? 'dark bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-md mx-auto space-y-4">
        <Button 
          onClick={() => setIsDark(!isDark)}
          className="mb-4"
        >
          Toggle Dark Mode (Current: {isDark ? 'Dark' : 'Light'})
        </Button>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Test Tabs in {isDark ? 'Dark' : 'Light'} Mode
          </h2>
          
          <Tabs defaultValue="palette" className="w-full">
            <TabsList className="w-full justify-start px-4 bg-white dark:bg-gray-900 border-b rounded-none h-auto p-0">
              <TabsTrigger value="palette" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100">
                <SwatchBook className="h-4 w-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100">
                <Clock className="h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100">
                <Star className="h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100">
                <Palette className="h-4 w-4" />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="palette" className="px-4 py-3">
              <div className="text-gray-900 dark:text-gray-100">Colors tab content</div>
            </TabsContent>
            <TabsContent value="recent" className="px-4 py-3">
              <div className="text-gray-900 dark:text-gray-100">Recent tab content</div>
            </TabsContent>
            <TabsContent value="favorites" className="px-4 py-3">
              <div className="text-gray-900 dark:text-gray-100">Favorites tab content</div>
            </TabsContent>
            <TabsContent value="custom" className="px-4 py-3">
              <div className="text-gray-900 dark:text-gray-100">Custom tab content - This should be visible in dark mode</div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Current mode: {isDark ? 'Dark' : 'Light'}
          <br />
          Test all tabs, especially the Custom tab visibility in both modes.
        </div>
      </div>
    </div>
  )
}