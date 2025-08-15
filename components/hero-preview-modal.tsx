"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BannerImage } from "@/lib/types"

interface HeroPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  banners: BannerImage[]
}

export function HeroPreviewModal({ isOpen, onClose, banners }: HeroPreviewModalProps) {
  // 过滤出Hero图片并按位置分组
  const heroImages = banners.filter(banner => banner.showOnHero && banner.isActive)
  const topRowImages = heroImages.filter(img => img.heroRow === 'top')
  const bottomRowImages = heroImages.filter(img => img.heroRow === 'bottom')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Hero区域预览效果</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 预览区域 */}
          <div className="bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900/20 dark:to-blue-900/20 rounded-lg overflow-hidden relative h-64 border">
            {/* 上排图片 */}
            {topRowImages.length > 0 && (
              <div className="absolute top-4 left-0 w-full">
                <div className="flex space-x-2 animate-scroll-left">
                  {topRowImages.concat(topRowImages).map((image, index) => (
                    <div key={`top-${image.id}-${index}`} className="flex-shrink-0">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 下排图片 */}
            {bottomRowImages.length > 0 && (
              <div className="absolute bottom-4 left-0 w-full">
                <div className="flex space-x-2 animate-scroll-right">
                  {bottomRowImages.concat(bottomRowImages).map((image, index) => (
                    <div key={`bottom-${image.id}-${index}`} className="flex-shrink-0">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 中央提示 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-black/90 px-6 py-3 rounded-lg text-center">
                <h3 className="font-bold text-lg mb-1">AI Kitty Creator Studio</h3>
                <p className="text-sm text-muted-foreground">
                  这里是首页Hero区域的滚动背景效果
                </p>
              </div>
            </div>

            {/* 无图片提示 */}
            {heroImages.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p>还没有Hero图片</p>
                  <p className="text-sm">添加Hero图片来看到滚动效果</p>
                </div>
              </div>
            )}
          </div>

          {/* 图片列表信息 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 上排图片信息 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="bg-blue-500">上排图片</Badge>
                <span className="text-sm text-muted-foreground">
                  向左滚动 ← ({topRowImages.length} 张)
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {topRowImages.length > 0 ? (
                  topRowImages.map((image) => (
                    <div key={image.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className="text-sm flex-1">{image.title}</span>
                      <span className="text-xs text-muted-foreground">#{image.position}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    暂无上排图片
                  </p>
                )}
              </div>
            </div>

            {/* 下排图片信息 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="bg-green-500">下排图片</Badge>
                <span className="text-sm text-muted-foreground">
                  向右滚动 → ({bottomRowImages.length} 张)
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {bottomRowImages.length > 0 ? (
                  bottomRowImages.map((image) => (
                    <div key={image.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className="text-sm flex-1">{image.title}</span>
                      <span className="text-xs text-muted-foreground">#{image.position}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    暂无下排图片
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 使用提示</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 上排图片会从右向左滚动显示</li>
              <li>• 下排图片会从左向右滚动显示</li>
              <li>• 建议每排至少有2-3张图片以获得最佳滚动效果</li>
              <li>• 图片会按照位置编号(position)进行排序</li>
              <li>• 只有启用状态的图片才会显示在Hero区域</li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              关闭预览
            </Button>
          </div>
        </div>

        {/* CSS动画样式 */}
        <style jsx>{`
          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          @keyframes scroll-right {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          
          .animate-scroll-left {
            animation: scroll-left 15s linear infinite;
          }
          
          .animate-scroll-right {
            animation: scroll-right 15s linear infinite;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}