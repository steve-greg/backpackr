import { GearCategory } from '@/types'
import { Check } from 'lucide-react'

interface CategoryFilterProps {
  categories: GearCategory[]
  selectedCategories: string[]
  onCategoryToggle: (categoryId: string) => void
  className?: string
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryToggle,
  className = ''
}: CategoryFilterProps) {
  const isAllSelected = selectedCategories.length === 0
  
  const handleAllClick = () => {
    // If all are selected (none in array), do nothing
    // If some are selected, clear selection
    if (!isAllSelected) {
      selectedCategories.forEach(categoryId => {
        onCategoryToggle(categoryId)
      })
    }
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* All Categories Button */}
        <button
          onClick={handleAllClick}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isAllSelected
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isAllSelected && <Check className="h-3 w-3 mr-1" />}
          All Categories
        </button>

        {/* Individual Category Buttons */}
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id)
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected && <Check className="h-3 w-3 mr-1" />}
              {category.name}
            </button>
          )
        })}
      </div>

      {/* Active Filters Summary */}
      {!isAllSelected && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
          </span>
          <button
            onClick={handleAllClick}
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}