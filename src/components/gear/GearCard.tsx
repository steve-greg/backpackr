import { GearItem } from '@/types'
import { formatWeight } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Plus, Info } from 'lucide-react'

interface GearCardProps {
  item: GearItem
  onAddToPack?: (item: GearItem) => void
  onViewDetails?: (item: GearItem) => void
  showAddButton?: boolean
  className?: string
}

export function GearCard({ 
  item, 
  onAddToPack, 
  onViewDetails, 
  showAddButton = true,
  className = '' 
}: GearCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
            {item.brand && (
              <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
            )}
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {item.is_custom && (
              <Badge variant="secondary" size="sm">Custom</Badge>
            )}
            <Badge 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              {item.category.name}
            </Badge>
          </div>
        </div>

        {/* Weight Display */}
        <div className="mb-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-green-600">
              {formatWeight(item.weight_oz, item.weight_g, 'imperial')}
            </span>
            <span className="text-sm text-gray-500">
              ({formatWeight(item.weight_oz, item.weight_g, 'metric')})
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewDetails?.(item)}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700"
          >
            <Info className="h-3 w-3 mr-1" />
            Details
          </button>
          
          {showAddButton && (
            <button
              onClick={() => onAddToPack?.(item)}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add to Pack
            </button>
          )}
        </div>
      </div>
    </div>
  )
}