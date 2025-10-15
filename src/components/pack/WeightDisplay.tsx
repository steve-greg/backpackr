import { WeightSummary } from '@/types'
import { formatWeight } from '@/lib/utils'
import { Scale } from 'lucide-react'

interface WeightDisplayProps {
  weightSummary: WeightSummary
  showCategoryBreakdown?: boolean
  className?: string
}

export function WeightDisplay({ 
  weightSummary, 
  showCategoryBreakdown = true,
  className = '' 
}: WeightDisplayProps) {
  const { totalWeight, categoryBreakdown } = weightSummary

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* Total Weight */}
      <div className="flex items-center mb-4">
        <Scale className="h-5 w-5 text-green-600 mr-2" />
        <div>
          <h3 className="font-semibold text-gray-900">Total Pack Weight</h3>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-green-600">
              {formatWeight(totalWeight.oz, totalWeight.g, 'imperial')}
            </span>
            <span className="text-sm text-gray-500">
              ({formatWeight(totalWeight.oz, totalWeight.g, 'metric')})
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {showCategoryBreakdown && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Weight by Category</h4>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([categorySlug, data]) => {
              if (data.itemCount === 0) return null
              
              const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
              const percentage = totalWeight.oz > 0 ? (data.oz / totalWeight.oz) * 100 : 0
              
              return (
                <div key={categorySlug} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {categoryName}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {formatWeight(data.oz, data.g, 'imperial')}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({data.itemCount} {data.itemCount === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalWeight.oz === 0 && (
        <div className="text-center py-4">
          <Scale className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No items in pack</p>
        </div>
      )}
    </div>
  )
}