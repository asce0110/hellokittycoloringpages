import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Palette } from "lucide-react"
import { ColorReference } from "@/lib/reference-images"

interface ReferenceImageCardProps {
  reference: ColorReference
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function ReferenceImageCard({ reference, onEdit, onDelete, className }: ReferenceImageCardProps) {
  return (
    <Card className={`overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${className || ""}`}>
      <div className="relative">
        <div className="grid grid-cols-2">
          {/* 原图 */}
          <div className="relative">
            <img 
              src={reference.original}
              alt={`${reference.title} - Original`}
              className="w-full h-32 object-cover border-r-2 border-gray-200"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">📝 Original</Badge>
            </div>
          </div>
          
          {/* 彩色参考图 */}
          <div className="relative">
            <img 
              src={reference.colored}
              alt={`${reference.title} - Colored`}
              className="w-full h-32 object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="text-xs bg-purple-100 text-purple-800 border-purple-200">🎨 Colored</Badge>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onEdit}
                className="bg-white/80 backdrop-blur-sm hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
                className="bg-white/80 backdrop-blur-sm hover:bg-red-100 border border-red-200 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <CardContent className="p-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{reference.title}</h3>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              ✅ Active Reference
            </Badge>
          </div>
          
          {/* Color scheme preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Color Scheme</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-gray-600">Primary</span>
                </div>
                <div className="flex gap-1">
                  {reference.colorScheme.primary.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-gray-600">Secondary</span>
                </div>
                <div className="flex gap-1">
                  {reference.colorScheme.secondary.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-gray-600">Accent</span>
                </div>
                <div className="flex gap-1">
                  {reference.colorScheme.accent.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}