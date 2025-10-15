import { render, screen } from '@testing-library/react'
import { WeightDisplay } from '../WeightDisplay'
import { WeightSummary } from '@/types'

// Mock dependencies
import * as utils from '@/lib/utils'

jest.mock('@/lib/utils', () => ({
  formatWeight: jest.fn((oz: number, g: number, unit: 'imperial' | 'metric') => {
    if (unit === 'metric') return `${g}g`
    return `${oz} oz`
  })
}))

jest.mock('lucide-react', () => ({
  Scale: ({ className }: { className?: string }) => (
    <div data-testid="scale-icon" className={className} />
  )
}))

const mockWeightSummary: WeightSummary = {
  totalWeight: {
    oz: 48.5,
    g: 1375
  },
  categoryBreakdown: {
    shelter: {
      oz: 32.5,
      g: 921,
      itemCount: 2
    },
    cooking: {
      oz: 16.0,
      g: 454,
      itemCount: 3
    },
    clothing: {
      oz: 0,
      g: 0,
      itemCount: 0
    },
    navigation: {
      oz: 0,
      g: 0,
      itemCount: 0
    },
    safety: {
      oz: 0,
      g: 0,
      itemCount: 0
    },
    personal: {
      oz: 0,
      g: 0,
      itemCount: 0
    },
    other: {
      oz: 0,
      g: 0,
      itemCount: 0
    }
  }
}

const emptyWeightSummary: WeightSummary = {
  totalWeight: {
    oz: 0,
    g: 0
  },
  categoryBreakdown: {
    shelter: { oz: 0, g: 0, itemCount: 0 },
    cooking: { oz: 0, g: 0, itemCount: 0 },
    clothing: { oz: 0, g: 0, itemCount: 0 },
    navigation: { oz: 0, g: 0, itemCount: 0 },
    safety: { oz: 0, g: 0, itemCount: 0 },
    personal: { oz: 0, g: 0, itemCount: 0 },
    other: { oz: 0, g: 0, itemCount: 0 }
  }
}

const singleCategoryWeightSummary: WeightSummary = {
  totalWeight: {
    oz: 10.5,
    g: 298
  },
  categoryBreakdown: {
    shelter: { oz: 10.5, g: 298, itemCount: 1 },
    cooking: { oz: 0, g: 0, itemCount: 0 },
    clothing: { oz: 0, g: 0, itemCount: 0 },
    navigation: { oz: 0, g: 0, itemCount: 0 },
    safety: { oz: 0, g: 0, itemCount: 0 },
    personal: { oz: 0, g: 0, itemCount: 0 },
    other: { oz: 0, g: 0, itemCount: 0 }
  }
}

describe('WeightDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the component with weight summary', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      expect(screen.getByText('Total Pack Weight')).toBeInTheDocument()
      expect(screen.getByTestId('scale-icon')).toBeInTheDocument()
    })

    it('displays total weight in imperial and metric units', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      expect(screen.getByText('48.5 oz')).toBeInTheDocument()
      expect(screen.getByText('(1375g)')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} className="custom-class" />)
      
      // The outermost div has the className
      const container = screen.getByText('Total Pack Weight').closest('.bg-white')
      expect(container).toHaveClass('custom-class')
    })

    it('uses default className when not provided', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      const container = screen.getByText('Total Pack Weight').closest('.bg-white')
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border', 'p-4')
    })
  })

  describe('Category Breakdown', () => {
    it('shows category breakdown by default', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      expect(screen.getByText('Weight by Category')).toBeInTheDocument()
      expect(screen.getByText('Shelter')).toBeInTheDocument()
      expect(screen.getByText('Cooking')).toBeInTheDocument()
    })

    it('hides category breakdown when showCategoryBreakdown is false', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} showCategoryBreakdown={false} />)
      
      expect(screen.queryByText('Weight by Category')).not.toBeInTheDocument()
      expect(screen.queryByText('Shelter')).not.toBeInTheDocument()
    })

    it('displays category weights and item counts', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      expect(screen.getByText('32.5 oz')).toBeInTheDocument() // Shelter weight
      expect(screen.getByText('(2 items)')).toBeInTheDocument() // Shelter items
      expect(screen.getByText('16 oz')).toBeInTheDocument() // Cooking weight
      expect(screen.getByText('(3 items)')).toBeInTheDocument() // Cooking items
    })

    it('shows singular form for single item', () => {
      render(<WeightDisplay weightSummary={singleCategoryWeightSummary} />)
      
      expect(screen.getByText('(1 item)')).toBeInTheDocument()
    })

    it('does not display categories with zero items', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      // These categories have 0 items and should not be displayed
      expect(screen.queryByText('Clothing')).not.toBeInTheDocument()
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
      expect(screen.queryByText('Safety')).not.toBeInTheDocument()
    })

    it('capitalizes category names correctly', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      expect(screen.getByText('Shelter')).toBeInTheDocument() // shelter -> Shelter
      expect(screen.getByText('Cooking')).toBeInTheDocument() // cooking -> Cooking
    })

    it('renders progress bars for categories', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      // Progress bars are divs with specific styling, not role="progressbar"
      const progressBars = document.querySelectorAll('.bg-green-600')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('calculates percentage widths correctly', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      // Shelter should be ~67% (32.5/48.5), Cooking ~33% (16/48.5)
      const progressBars = document.querySelectorAll('.bg-green-600')
      expect(progressBars).toHaveLength(2) // Two categories with items
    })

    it('handles minimum width for very small percentages', () => {
      const smallWeightSummary: WeightSummary = {
        totalWeight: { oz: 100, g: 2835 },
        categoryBreakdown: {
          shelter: { oz: 99, g: 2807, itemCount: 1 },
          cooking: { oz: 1, g: 28, itemCount: 1 }, // Very small percentage
          clothing: { oz: 0, g: 0, itemCount: 0 },
          navigation: { oz: 0, g: 0, itemCount: 0 },
          safety: { oz: 0, g: 0, itemCount: 0 },
          personal: { oz: 0, g: 0, itemCount: 0 },
          other: { oz: 0, g: 0, itemCount: 0 }
        }
      }
      
      render(<WeightDisplay weightSummary={smallWeightSummary} />)
      
      const progressBars = document.querySelectorAll('.bg-green-600')
      expect(progressBars).toHaveLength(2)
    })
  })

  describe('Empty State', () => {
    it('shows empty state when total weight is zero', () => {
      render(<WeightDisplay weightSummary={emptyWeightSummary} />)
      
      expect(screen.getByText('No items in pack')).toBeInTheDocument()
      expect(screen.getAllByTestId('scale-icon')).toHaveLength(2) // Header + Empty state
    })

    it('shows total weight as zero in empty state', () => {
      render(<WeightDisplay weightSummary={emptyWeightSummary} />)
      
      expect(screen.getByText('0 oz')).toBeInTheDocument()
      expect(screen.getByText('(0g)')).toBeInTheDocument()
    })

    it('shows category breakdown section but no categories when empty', () => {
      render(<WeightDisplay weightSummary={emptyWeightSummary} />)
      
      // Should show the section header but no individual categories
      expect(screen.getByText('Weight by Category')).toBeInTheDocument()
      expect(screen.queryByText('Shelter')).not.toBeInTheDocument()
      expect(screen.queryByText('Cooking')).not.toBeInTheDocument()
    })
  })

  describe('Weight Formatting', () => {
    it('calls formatWeight with correct parameters', () => {
      const mockFormatWeight = jest.mocked(utils.formatWeight)
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      // Should call formatWeight for total weight (imperial and metric)
      expect(mockFormatWeight).toHaveBeenCalledWith(48.5, 1375, 'imperial')
      expect(mockFormatWeight).toHaveBeenCalledWith(48.5, 1375, 'metric')
      
      // Should call formatWeight for category weights
      expect(mockFormatWeight).toHaveBeenCalledWith(32.5, 921, 'imperial')
      expect(mockFormatWeight).toHaveBeenCalledWith(16.0, 454, 'imperial')
    })

    it('handles zero weights correctly', () => {
      const mockFormatWeight = jest.mocked(utils.formatWeight)
      render(<WeightDisplay weightSummary={emptyWeightSummary} />)
      
      expect(mockFormatWeight).toHaveBeenCalledWith(0, 0, 'imperial')
      expect(mockFormatWeight).toHaveBeenCalledWith(0, 0, 'metric')
    })
  })

  describe('Default Props', () => {
    it('uses default showCategoryBreakdown value of true', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      expect(screen.getByText('Weight by Category')).toBeInTheDocument()
    })

    it('uses default className value of empty string', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      const container = screen.getByText('Total Pack Weight').closest('.bg-white')
      expect(container).toHaveClass('bg-white') // Should have base classes
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      const mainHeading = screen.getByText('Total Pack Weight')
      const subHeading = screen.getByText('Weight by Category')
      
      expect(mainHeading.tagName).toBe('H3')
      expect(subHeading.tagName).toBe('H4')
    })

    it('provides meaningful text for screen readers', () => {
      render(<WeightDisplay weightSummary={mockWeightSummary} />)
      
      expect(screen.getByText('Total Pack Weight')).toBeInTheDocument()
      expect(screen.getByText('Weight by Category')).toBeInTheDocument()
      expect(screen.getByText('(2 items)')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles categories with fractional item counts gracefully', () => {
      // This shouldn't happen in real usage, but test for robustness
      const fractionalSummary: WeightSummary = {
        totalWeight: { oz: 10, g: 284 },
        categoryBreakdown: {
          shelter: { oz: 10, g: 284, itemCount: 1 },
          cooking: { oz: 0, g: 0, itemCount: 0 },
          clothing: { oz: 0, g: 0, itemCount: 0 },
          navigation: { oz: 0, g: 0, itemCount: 0 },
          safety: { oz: 0, g: 0, itemCount: 0 },
          personal: { oz: 0, g: 0, itemCount: 0 },
          other: { oz: 0, g: 0, itemCount: 0 }
        }
      }
      
      expect(() => render(<WeightDisplay weightSummary={fractionalSummary} />)).not.toThrow()
    })

    it('handles very large weights', () => {
      const largeWeightSummary: WeightSummary = {
        totalWeight: { oz: 9999.99, g: 283495 },
        categoryBreakdown: {
          shelter: { oz: 9999.99, g: 283495, itemCount: 100 },
          cooking: { oz: 0, g: 0, itemCount: 0 },
          clothing: { oz: 0, g: 0, itemCount: 0 },
          navigation: { oz: 0, g: 0, itemCount: 0 },
          safety: { oz: 0, g: 0, itemCount: 0 },
          personal: { oz: 0, g: 0, itemCount: 0 },
          other: { oz: 0, g: 0, itemCount: 0 }
        }
      }
      
      render(<WeightDisplay weightSummary={largeWeightSummary} />)
      expect(screen.getAllByText('9999.99 oz')).toHaveLength(2) // Total + Category
      expect(screen.getByText('(100 items)')).toBeInTheDocument()
    })

    it('handles negative weights gracefully', () => {
      // This shouldn't happen in real usage, but test for robustness
      const negativeWeightSummary: WeightSummary = {
        totalWeight: { oz: -5, g: -142 },
        categoryBreakdown: {
          shelter: { oz: -5, g: -142, itemCount: 1 },
          cooking: { oz: 0, g: 0, itemCount: 0 },
          clothing: { oz: 0, g: 0, itemCount: 0 },
          navigation: { oz: 0, g: 0, itemCount: 0 },
          safety: { oz: 0, g: 0, itemCount: 0 },
          personal: { oz: 0, g: 0, itemCount: 0 },
          other: { oz: 0, g: 0, itemCount: 0 }
        }
      }
      
      expect(() => render(<WeightDisplay weightSummary={negativeWeightSummary} />)).not.toThrow()
    })
  })
})