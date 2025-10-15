import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from '../CategoryFilter'
import { GearCategory } from '@/types'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => (
    <div data-testid="check-icon" className={className} />
  )
}))

const mockCategories: GearCategory[] = [
  { id: '1', name: 'Shelter', slug: 'shelter' },
  { id: '2', name: 'Cooking', slug: 'cooking' },
  { id: '3', name: 'Clothing', slug: 'clothing' },
  { id: '4', name: 'Navigation', slug: 'navigation' },
  { id: '5', name: 'Safety', slug: 'safety' }
]

const defaultProps = {
  categories: mockCategories,
  selectedCategories: [],
  onCategoryToggle: jest.fn(),
  className: ''
}

describe('CategoryFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the component with title', () => {
      render(<CategoryFilter {...defaultProps} />)
      
      expect(screen.getByText('Filter by Category')).toBeInTheDocument()
    })

    it('renders all category buttons', () => {
      render(<CategoryFilter {...defaultProps} />)
      
      // Should render All Categories button plus each category
      expect(screen.getByText('All Categories')).toBeInTheDocument()
      expect(screen.getByText('Shelter')).toBeInTheDocument()
      expect(screen.getByText('Cooking')).toBeInTheDocument()
      expect(screen.getByText('Clothing')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Safety')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const customClass = 'custom-filter-class'
      render(<CategoryFilter {...defaultProps} className={customClass} />)
      
      const container = screen.getByText('Filter by Category').closest('div')
      expect(container).toHaveClass(customClass)
    })

    it('renders with empty categories array', () => {
      render(<CategoryFilter {...defaultProps} categories={[]} />)
      
      expect(screen.getByText('Filter by Category')).toBeInTheDocument()
      expect(screen.getByText('All Categories')).toBeInTheDocument()
      // Should not show any category buttons
      expect(screen.queryByText('Shelter')).not.toBeInTheDocument()
    })
  })

  describe('All Categories Button', () => {
    it('shows as selected when no categories are selected', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={[]} />)
      
      const allButton = screen.getByText('All Categories')
      expect(allButton).toHaveClass('bg-green-600', 'text-white')
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('shows as unselected when some categories are selected', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1', '2']} />)
      
      const allButton = screen.getByText('All Categories')
      expect(allButton).toHaveClass('bg-gray-100', 'text-gray-700')
      expect(allButton).not.toHaveClass('bg-green-600')
    })

    it('calls onCategoryToggle for each selected category when clicked', () => {
      const mockToggle = jest.fn()
      render(
        <CategoryFilter 
          {...defaultProps} 
          selectedCategories={['1', '2']} 
          onCategoryToggle={mockToggle}
        />
      )
      
      const allButton = screen.getByText('All Categories')
      fireEvent.click(allButton)
      
      expect(mockToggle).toHaveBeenCalledTimes(2)
      expect(mockToggle).toHaveBeenCalledWith('1')
      expect(mockToggle).toHaveBeenCalledWith('2')
    })

    it('does nothing when clicked and all categories are already selected', () => {
      const mockToggle = jest.fn()
      render(
        <CategoryFilter 
          {...defaultProps} 
          selectedCategories={[]} 
          onCategoryToggle={mockToggle}
        />
      )
      
      const allButton = screen.getByText('All Categories')
      fireEvent.click(allButton)
      
      expect(mockToggle).not.toHaveBeenCalled()
    })
  })

  describe('Individual Category Buttons', () => {
    it('shows selected state for selected categories', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1', '3']} />)
      
      const shelterButton = screen.getByText('Shelter')
      const clothingButton = screen.getByText('Clothing')
      const cookingButton = screen.getByText('Cooking')
      
      expect(shelterButton).toHaveClass('bg-green-600', 'text-white')
      expect(clothingButton).toHaveClass('bg-green-600', 'text-white')
      expect(cookingButton).toHaveClass('bg-gray-100', 'text-gray-700')
    })

    it('shows unselected state for unselected categories', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1']} />)
      
      const cookingButton = screen.getByText('Cooking')
      expect(cookingButton).toHaveClass('bg-gray-100', 'text-gray-700')
      expect(cookingButton).not.toHaveClass('bg-green-600')
    })

    it('calls onCategoryToggle when category button is clicked', () => {
      const mockToggle = jest.fn()
      render(<CategoryFilter {...defaultProps} onCategoryToggle={mockToggle} />)
      
      const shelterButton = screen.getByText('Shelter')
      fireEvent.click(shelterButton)
      
      expect(mockToggle).toHaveBeenCalledTimes(1)
      expect(mockToggle).toHaveBeenCalledWith('1')
    })

    it('renders check icon for selected categories', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1', '3']} />)
      
      const checkIcons = screen.getAllByTestId('check-icon')
      // Should have check icons for: All Categories (not selected), Shelter, and Clothing
      expect(checkIcons).toHaveLength(2) // Only selected categories show check
    })
  })

  describe('Active Filters Summary', () => {
    it('shows active filters summary when categories are selected', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1', '2']} />)
      
      expect(screen.getByText('2 categories selected')).toBeInTheDocument()
      expect(screen.getByText('Clear filters')).toBeInTheDocument()
    })

    it('shows singular form for single category', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1']} />)
      
      expect(screen.getByText('1 category selected')).toBeInTheDocument()
    })

    it('hides active filters summary when all categories are selected', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={[]} />)
      
      expect(screen.queryByText('categories selected')).not.toBeInTheDocument()
      expect(screen.queryByText('Clear filters')).not.toBeInTheDocument()
    })

    it('calls clear filters functionality when clear button is clicked', () => {
      const mockToggle = jest.fn()
      render(
        <CategoryFilter 
          {...defaultProps} 
          selectedCategories={['1', '2']} 
          onCategoryToggle={mockToggle}
        />
      )
      
      const clearButton = screen.getByText('Clear filters')
      fireEvent.click(clearButton)
      
      expect(mockToggle).toHaveBeenCalledTimes(2)
      expect(mockToggle).toHaveBeenCalledWith('1')
      expect(mockToggle).toHaveBeenCalledWith('2')
    })
  })

  describe('Hover States', () => {
    it('applies hover classes to unselected buttons', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={[]} />)
      
      const cookingButton = screen.getByText('Cooking')
      expect(cookingButton).toHaveClass('hover:bg-gray-200')
    })

    it('applies hover classes to clear filters button', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1']} />)
      
      const clearButton = screen.getByText('Clear filters')
      expect(clearButton).toHaveClass('hover:text-green-700')
    })
  })

  describe('Accessibility', () => {
    it('renders all buttons as button elements', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1']} />)
      
      const buttons = screen.getAllByRole('button')
      // Should have: All Categories + 5 category buttons + Clear filters = 7 buttons
      expect(buttons).toHaveLength(7)
    })

    it('category buttons have correct text content', () => {
      render(<CategoryFilter {...defaultProps} />)
      
      mockCategories.forEach(category => {
        const button = screen.getByRole('button', { name: new RegExp(category.name) })
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty selectedCategories array', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={[]} />)
      
      expect(screen.getByText('All Categories')).toHaveClass('bg-green-600')
      expect(screen.queryByText('categories selected')).not.toBeInTheDocument()
    })

    it('handles all categories being selected', () => {
      const allCategoryIds = mockCategories.map(cat => cat.id)
      render(<CategoryFilter {...defaultProps} selectedCategories={allCategoryIds} />)
      
      expect(screen.getByText('All Categories')).toHaveClass('bg-gray-100')
      expect(screen.getByText('5 categories selected')).toBeInTheDocument()
    })

    it('handles single category selection', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['1']} />)
      
      expect(screen.getByText('Shelter')).toHaveClass('bg-green-600')
      expect(screen.getByText('1 category selected')).toBeInTheDocument()
    })

    it('handles invalid category ID in selectedCategories', () => {
      render(<CategoryFilter {...defaultProps} selectedCategories={['invalid-id']} />)
      
      // Should not crash and should show the summary
      expect(screen.getByText('1 category selected')).toBeInTheDocument()
    })
  })
})