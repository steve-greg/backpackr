import { render, screen, fireEvent } from '@testing-library/react'
import { GearCard } from '../GearCard'
import { GearItem } from '@/types'

// Mock dependencies
import * as utils from '@/lib/utils'

jest.mock('@/lib/utils', () => ({
  formatWeight: jest.fn((oz: number, g: number, unit: 'imperial' | 'metric') => {
    if (unit === 'metric') return `${g}g`
    return `${oz} oz`
  })
}))

jest.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, variant, size, className }: { 
    children: React.ReactNode; 
    variant?: string; 
    size?: string; 
    className?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} data-size={size} className={className}>
      {children}
    </span>
  )
}))

jest.mock('lucide-react', () => ({
  Plus: ({ className }: { className?: string }) => (
    <div data-testid="plus-icon" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <div data-testid="info-icon" className={className} />
  )
}))

const mockGearItem: GearItem = {
  id: '1',
  name: 'Lightweight Tent',
  brand: 'Big Agnes',
  category: { id: 'shelter', name: 'Shelter', slug: 'shelter' },
  weight_oz: 32.5,
  weight_g: 921,
  description: 'A lightweight 2-person tent perfect for backpacking adventures',
  is_custom: false,
  user_id: 'user-123',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const customGearItem: GearItem = {
  ...mockGearItem,
  id: '2',
  name: 'Custom Sleeping Bag',
  brand: undefined,
  description: undefined,
  is_custom: true
}

const defaultProps = {
  item: mockGearItem,
  onAddToPack: jest.fn(),
  onViewDetails: jest.fn(),
  showAddButton: true,
  className: ''
}

describe('GearCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the gear item name', () => {
      render(<GearCard {...defaultProps} />)
      
      expect(screen.getByText('Lightweight Tent')).toBeInTheDocument()
    })

    it('renders the gear item brand when provided', () => {
      render(<GearCard {...defaultProps} />)
      
      expect(screen.getByText('Big Agnes')).toBeInTheDocument()
    })

    it('does not render brand when not provided', () => {
      render(<GearCard {...defaultProps} item={customGearItem} />)
      
      expect(screen.queryByText('Big Agnes')).not.toBeInTheDocument()
    })

    it('renders category badge', () => {
      render(<GearCard {...defaultProps} />)
      
      const badges = screen.getAllByTestId('badge')
      const categoryBadge = badges.find(badge => badge.textContent === 'Shelter')
      expect(categoryBadge).toBeInTheDocument()
      expect(categoryBadge).toHaveAttribute('data-variant', 'outline')
      expect(categoryBadge).toHaveAttribute('data-size', 'sm')
    })

    it('renders custom badge for custom items', () => {
      render(<GearCard {...defaultProps} item={customGearItem} />)
      
      const badges = screen.getAllByTestId('badge')
      const customBadge = badges.find(badge => badge.textContent === 'Custom')
      expect(customBadge).toBeInTheDocument()
      expect(customBadge).toHaveAttribute('data-variant', 'secondary')
    })

    it('does not render custom badge for non-custom items', () => {
      render(<GearCard {...defaultProps} />)
      
      const badges = screen.getAllByTestId('badge')
      const customBadge = badges.find(badge => badge.textContent === 'Custom')
      expect(customBadge).toBeUndefined()
    })

    it('applies custom className', () => {
      render(<GearCard {...defaultProps} className="custom-class" />)
      
      // The outermost div is the card container with the className
      const card = screen.getByText('Lightweight Tent').closest('.bg-white')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Weight Display', () => {
    it('displays weight in imperial and metric units', () => {
      render(<GearCard {...defaultProps} />)
      
      // Should show imperial weight prominently
      expect(screen.getByText('32.5 oz')).toBeInTheDocument()
      // Should show metric weight in parentheses
      expect(screen.getByText('(921g)')).toBeInTheDocument()
    })

    it('calls formatWeight with correct parameters', () => {
      const mockFormatWeight = jest.mocked(utils.formatWeight)
      render(<GearCard {...defaultProps} />)
      
      expect(mockFormatWeight).toHaveBeenCalledWith(32.5, 921, 'imperial')
      expect(mockFormatWeight).toHaveBeenCalledWith(32.5, 921, 'metric')
    })
  })

  describe('Description', () => {
    it('renders description when provided', () => {
      render(<GearCard {...defaultProps} />)
      
      expect(screen.getByText('A lightweight 2-person tent perfect for backpacking adventures')).toBeInTheDocument()
    })

    it('does not render description when not provided', () => {
      render(<GearCard {...defaultProps} item={customGearItem} />)
      
      expect(screen.queryByText('A lightweight 2-person tent')).not.toBeInTheDocument()
    })

    it('applies line-clamp styling to description', () => {
      render(<GearCard {...defaultProps} />)
      
      const description = screen.getByText('A lightweight 2-person tent perfect for backpacking adventures')
      expect(description).toHaveClass('line-clamp-2')
    })
  })

  describe('Actions', () => {
    it('renders details button', () => {
      render(<GearCard {...defaultProps} />)
      
      const detailsButton = screen.getByText('Details')
      expect(detailsButton).toBeInTheDocument()
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })

    it('calls onViewDetails when details button is clicked', () => {
      const mockViewDetails = jest.fn()
      render(<GearCard {...defaultProps} onViewDetails={mockViewDetails} />)
      
      const detailsButton = screen.getByText('Details')
      fireEvent.click(detailsButton)
      
      expect(mockViewDetails).toHaveBeenCalledTimes(1)
      expect(mockViewDetails).toHaveBeenCalledWith(mockGearItem)
    })

    it('does not crash when onViewDetails is not provided', () => {
      render(<GearCard {...defaultProps} onViewDetails={undefined} />)
      
      const detailsButton = screen.getByText('Details')
      expect(() => fireEvent.click(detailsButton)).not.toThrow()
    })

    it('renders add to pack button when showAddButton is true', () => {
      render(<GearCard {...defaultProps} showAddButton={true} />)
      
      const addButton = screen.getByText('Add to Pack')
      expect(addButton).toBeInTheDocument()
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    })

    it('does not render add to pack button when showAddButton is false', () => {
      render(<GearCard {...defaultProps} showAddButton={false} />)
      
      expect(screen.queryByText('Add to Pack')).not.toBeInTheDocument()
      expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument()
    })

    it('calls onAddToPack when add to pack button is clicked', () => {
      const mockAddToPack = jest.fn()
      render(<GearCard {...defaultProps} onAddToPack={mockAddToPack} />)
      
      const addButton = screen.getByText('Add to Pack')
      fireEvent.click(addButton)
      
      expect(mockAddToPack).toHaveBeenCalledTimes(1)
      expect(mockAddToPack).toHaveBeenCalledWith(mockGearItem)
    })

    it('does not crash when onAddToPack is not provided', () => {
      render(<GearCard {...defaultProps} onAddToPack={undefined} />)
      
      const addButton = screen.getByText('Add to Pack')
      expect(() => fireEvent.click(addButton)).not.toThrow()
    })
  })

  describe('Styling and Hover States', () => {
    it('applies correct base styling', () => {
      render(<GearCard {...defaultProps} />)
      
      const card = screen.getByText('Lightweight Tent').closest('.bg-white')
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border', 'hover:shadow-md', 'transition-shadow')
    })

    it('applies hover states to buttons', () => {
      render(<GearCard {...defaultProps} />)
      
      const detailsButton = screen.getByText('Details')
      const addButton = screen.getByText('Add to Pack')
      
      expect(detailsButton).toHaveClass('hover:text-gray-700')
      expect(addButton).toHaveClass('hover:bg-green-700')
    })
  })

  describe('Default Props', () => {
    it('uses default showAddButton value of true', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { showAddButton, ...propsWithoutShowAddButton } = defaultProps
      render(<GearCard {...propsWithoutShowAddButton} />)
      
      expect(screen.getByText('Add to Pack')).toBeInTheDocument()
    })

    it('uses default className value of empty string', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { className, ...propsWithoutClassName } = defaultProps
      render(<GearCard {...propsWithoutClassName} />)
      
      const card = screen.getByText('Lightweight Tent').closest('.bg-white')
      expect(card).toHaveClass('bg-white') // Should still have base classes
    })
  })

  describe('Accessibility', () => {
    it('renders buttons as button elements', () => {
      render(<GearCard {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2) // Details and Add to Pack buttons
    })

    it('has proper button text content', () => {
      render(<GearCard {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add to pack/i })).toBeInTheDocument()
    })

    it('renders proper heading hierarchy', () => {
      render(<GearCard {...defaultProps} />)
      
      const heading = screen.getByText('Lightweight Tent')
      expect(heading.tagName).toBe('H3')
    })
  })

  describe('Edge Cases', () => {
    it('handles missing optional props gracefully', () => {
      const minimalProps = {
        item: {
          ...mockGearItem,
          brand: undefined,
          description: undefined
        }
      }
      
      expect(() => render(<GearCard {...minimalProps} />)).not.toThrow()
    })

    it('handles zero weight values', () => {
      const zeroWeightItem = {
        ...mockGearItem,
        weight_oz: 0,
        weight_g: 0
      }
      
      render(<GearCard {...defaultProps} item={zeroWeightItem} />)
      
      expect(screen.getByText('0 oz')).toBeInTheDocument()
      expect(screen.getByText('(0g)')).toBeInTheDocument()
    })

    it('handles very long item names', () => {
      const longNameItem = {
        ...mockGearItem,
        name: 'This is a very long gear item name that might cause layout issues if not handled properly'
      }
      
      render(<GearCard {...defaultProps} item={longNameItem} />)
      
      expect(screen.getByText(longNameItem.name)).toBeInTheDocument()
    })

    it('handles very long descriptions', () => {
      const longDescItem = {
        ...mockGearItem,
        description: 'This is a very long description that should be truncated with line-clamp-2 styling to prevent the card from becoming too tall and affecting the layout of other cards in the grid. It should show an ellipsis after two lines.'
      }
      
      render(<GearCard {...defaultProps} item={longDescItem} />)
      
      expect(screen.getByText(longDescItem.description)).toBeInTheDocument()
    })
  })
})