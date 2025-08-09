"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, ExternalLink, Settings } from "lucide-react"

interface R2Status {
  configured: boolean
  error?: string
}

export function R2StatusCard() {
  const [status, setStatus] = useState<R2Status>({ configured: false })
  const [loading, setLoading] = useState(true)

  const checkR2Status = async () => {
    try {
      setLoading(true)
      // 测试上传一个小文件来检查R2状态
      const testData = new FormData()
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      testData.append('file', testFile)
      testData.append('type', 'test')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: testData
      })
      
      const result = await response.json()
      
      if (result.fallback) {
        setStatus({ configured: false, error: 'R2 not configured' })
      } else if (result.success) {
        setStatus({ configured: true })
      } else {
        setStatus({ configured: false, error: result.error })
      }
    } catch (error) {
      setStatus({ 
        configured: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkR2Status()
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cloudflare R2 Storage Status
            </CardTitle>
            <CardDescription>
              File upload and storage configuration
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkR2Status}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Status'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {loading ? (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>Checking R2 configuration...</span>
            </>
          ) : status.configured ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>R2 Storage configured and working</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>R2 Storage not configured - using fallback mode</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Fallback Mode
              </Badge>
            </>
          )}
        </div>
        
        {status.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {status.error}
            </p>
            {status.error.includes('NoSuchBucket') && (
              <div className="mt-2 text-xs text-red-700">
                <p className="font-medium">Bucket does not exist!</p>
                <p>Create bucket <code className="bg-red-100 px-1 rounded">hello-kitty-assets</code> in your Cloudflare R2 dashboard</p>
                <p className="mt-1">Or check <code>R2_BUCKET_SETUP.md</code> for detailed instructions</p>
              </div>
            )}
            {!status.error.includes('NoSuchBucket') && (
              <p className="text-xs text-red-600 mt-1">
                Files will be handled locally in development mode. 
                Configure R2 environment variables for production deployment.
              </p>
            )}
          </div>
        )}
        
        {status.configured && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✅ File uploads will be stored in Cloudflare R2
            </p>
            <p className="text-xs text-green-600 mt-1">
              Images are automatically optimized and served via CDN
            </p>
          </div>
        )}
        
        {!status.configured && (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground mb-2">
              To enable R2 storage, configure these environment variables:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>CLOUDFLARE_R2_ACCESS_KEY_ID</li>
              <li>CLOUDFLARE_R2_SECRET_ACCESS_KEY</li>
              <li>CLOUDFLARE_R2_BUCKET_NAME</li>
              <li>CLOUDFLARE_R2_ENDPOINT</li>
              <li>CLOUDFLARE_R2_PUBLIC_URL</li>
            </ul>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs mt-2"
              asChild
            >
              <a 
                href="https://developers.cloudflare.com/r2/get-started/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                Setup Guide <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}