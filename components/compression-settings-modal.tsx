"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Zap, Image, FileText, Info } from "lucide-react"
import { COMPRESSION_PRESETS, type CompressionConfig, validateCompressionConfig } from "@/lib/compression-config"

interface CompressionSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: CompressionConfig) => void
  currentConfig?: CompressionConfig
}

export function CompressionSettingsModal({ 
  isOpen, 
  onClose, 
  onSave,
  currentConfig = COMPRESSION_PRESETS.BALANCED 
}: CompressionSettingsModalProps) {
  const [config, setConfig] = useState<CompressionConfig>(currentConfig)
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof COMPRESSION_PRESETS>('BALANCED')
  const [errors, setErrors] = useState<string[]>([])

  const handlePresetChange = (preset: keyof typeof COMPRESSION_PRESETS) => {
    setSelectedPreset(preset)
    setConfig(COMPRESSION_PRESETS[preset])
    setErrors([])
  }

  const handleSave = () => {
    const validation = validateCompressionConfig(config)
    if (validation.valid) {
      onSave(config)
      onClose()
    } else {
      setErrors(validation.errors)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            图片压缩设置
          </DialogTitle>
          <DialogDescription>
            配置图片上传时的压缩参数，优化文件大小和质量平衡
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 错误提示 */}
          {errors.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="font-medium text-destructive mb-2">配置错误：</div>
              <ul className="list-disc list-inside text-sm text-destructive">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 预设选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">压缩预设</CardTitle>
              <CardDescription>选择预定义的压缩配置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${selectedPreset === 'HIGH_QUALITY' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handlePresetChange('HIGH_QUALITY')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">高质量</h3>
                      <Badge variant="secondary">1MB</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">最佳质量，文件较大</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${selectedPreset === 'BALANCED' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handlePresetChange('BALANCED')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">平衡</h3>
                      <Badge variant="default">512KB</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">质量和大小平衡</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${selectedPreset === 'SMALL_FILE' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handlePresetChange('SMALL_FILE')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">小文件</h3>
                      <Badge variant="outline">256KB</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">最小文件，质量较低</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* 详细设置 */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基础设置</TabsTrigger>
              <TabsTrigger value="png">PNG设置</TabsTrigger>
              <TabsTrigger value="webp">WebP设置</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">基础设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>目标文件大小上限</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.maxFileSize / 1024]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, maxFileSize: value * 1024 }))}
                        max={2048}
                        min={128}
                        step={64}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-16 text-right">
                        {formatFileSize(config.maxFileSize)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>缩略图尺寸</Label>
                    <Select 
                      value={config.thumbnailSize.toString()} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, thumbnailSize: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">150px</SelectItem>
                        <SelectItem value="200">200px</SelectItem>
                        <SelectItem value="300">300px</SelectItem>
                        <SelectItem value="400">400px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="png" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">PNG压缩设置</CardTitle>
                  <CardDescription>专为Hello Kitty线稿图优化</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>压缩级别 (0-9)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.png.compressionLevel]}
                        onValueChange={([value]) => setConfig(prev => ({ 
                          ...prev, 
                          png: { ...prev.png, compressionLevel: value }
                        }))}
                        max={9}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-8 text-right">
                        {config.png.compressionLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.png.usePalette}
                      onCheckedChange={(checked) => setConfig(prev => ({ 
                        ...prev, 
                        png: { ...prev.png, usePalette: checked }
                      }))}
                    />
                    <Label>使用调色板压缩（推荐用于线稿图）</Label>
                  </div>

                  {config.png.usePalette && (
                    <>
                      <div className="space-y-2">
                        <Label>调色板颜色数量</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.png.paletteColors]}
                            onValueChange={([value]) => setConfig(prev => ({ 
                              ...prev, 
                              png: { ...prev.png, paletteColors: value }
                            }))}
                            max={256}
                            min={8}
                            step={8}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-12 text-right">
                            {config.png.paletteColors}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>激进压缩颜色数量</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.png.aggressiveColors]}
                            onValueChange={([value]) => setConfig(prev => ({ 
                              ...prev, 
                              png: { ...prev.png, aggressiveColors: value }
                            }))}
                            max={128}
                            min={8}
                            step={8}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-12 text-right">
                            {config.png.aggressiveColors}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">WebP压缩设置</CardTitle>
                  <CardDescription>用于进一步压缩大文件</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>WebP质量 (0-100)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.webp.quality]}
                        onValueChange={([value]) => setConfig(prev => ({ 
                          ...prev, 
                          webp: { ...prev.webp, quality: value }
                        }))}
                        max={100}
                        min={60}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12 text-right">
                        {config.webp.quality}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>压缩努力程度 (0-6)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.webp.effort]}
                        onValueChange={([value]) => setConfig(prev => ({ 
                          ...prev, 
                          webp: { ...prev.webp, effort: value }
                        }))}
                        max={6}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-8 text-right">
                        {config.webp.effort}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.webp.lossless}
                      onCheckedChange={(checked) => setConfig(prev => ({ 
                        ...prev, 
                        webp: { ...prev.webp, lossless: checked }
                      }))}
                    />
                    <Label>无损压缩</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>WebP压缩收益阈值</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[config.detection.webpSavingsThreshold * 100]}
                        onValueChange={([value]) => setConfig(prev => ({ 
                          ...prev, 
                          detection: { ...prev.detection, webpSavingsThreshold: value / 100 }
                        }))}
                        max={90}
                        min={50}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12 text-right">
                        {(config.detection.webpSavingsThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      WebP需要节省多少空间才会被使用
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 预览信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                当前配置预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">目标大小</div>
                  <div className="text-muted-foreground">{formatFileSize(config.maxFileSize)}</div>
                </div>
                <div>
                  <div className="font-medium">PNG压缩</div>
                  <div className="text-muted-foreground">Level {config.png.compressionLevel}</div>
                </div>
                <div>
                  <div className="font-medium">调色板</div>
                  <div className="text-muted-foreground">
                    {config.png.usePalette ? `${config.png.paletteColors}色` : '关闭'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">WebP质量</div>
                  <div className="text-muted-foreground">{config.webp.quality}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存设置
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}