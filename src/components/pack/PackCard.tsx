import { Pack } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { formatWeight } from '@/lib/utils'
import { 
  Backpack, 
  Share2, 
  Copy, 
  Trash2, 
  Edit,
  Calendar,
  Lock,
  Globe
} from 'lucide-react'

interface PackCardProps {
  pack: Pack & {
    totalWeight?: { oz: number; g: number }
    itemCount?: number
  }
  onEdit?: (pack: Pack) => void
  onDelete?: (pack: Pack) => void
  onDuplicate?: (pack: Pack) => void
  onShare?: (pack: Pack) => void
  onView?: (pack: Pack) => void
  className?: string
}

export function PackCard({ 
  pack, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onShare, 
  onView,
  className = '' 
}: PackCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: '2-digit'
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center flex-1">
            <Backpack className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{pack.name}</h3>
              <div className="flex items-center mt-1 space-x-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(pack.updated_at)}
                </div>
                {pack.is_public ? (
                  <div className="flex items-center text-xs text-green-600">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-gray-500">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-col items-end space-y-1 ml-2">
            {pack.is_public && pack.share_token && (
              <Badge variant="outline" size="sm">Shared</Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Weight */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Weight</p>
            {pack.totalWeight ? (
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-green-600">
                  {formatWeight(pack.totalWeight.oz, pack.totalWeight.g, 'imperial')}
                </span>
                <span className="text-xs text-gray-500">
                  ({formatWeight(pack.totalWeight.oz, pack.totalWeight.g, 'metric')})
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Not calculated</span>
            )}
          </div>

          {/* Item Count */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Items</p>
            <span className="text-lg font-bold text-gray-700">
              {pack.itemCount || 0}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onView?.(pack)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View Pack
          </button>
          
          <div className="flex items-center space-x-1">
            {onShare && pack.is_public && (
              <button
                onClick={() => onShare(pack)}
                className="p-1.5 text-gray-400 hover:text-green-600 rounded"
                title="Share pack"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(pack)}
                className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                title="Duplicate pack"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={() => onEdit(pack)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                title="Edit pack"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(pack)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                title="Delete pack"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}