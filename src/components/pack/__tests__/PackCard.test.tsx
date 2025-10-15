import { render, screen, fireEvent } from '@testing-library/react'
import { PackCard } from '../PackCard'
import { Pack } from '@/types'

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  formatWeight: jest.fn((oz: number, g: number, unit: 'imperial' | 'metric') => {
    if (unit === 'metric') return `${g}g`
    return `${oz} oz`
  })
}))

jest.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, variant, size }: { 
    children: React.ReactNode; 
    variant?: string; 
    size?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} data-size={size}>
      {children}
    </span>
  )
}))

jest.mock('lucide-react', () => ({
  Backpack: ({ className }: { className?: string }) => (
    <div data-testid="backpack-icon" className={className} />
  ),
  Share2: ({ className }: { className?: string }) => (
    <div data-testid="share-icon" className={className} />
  ),
  Copy: ({ className }: { className?: string }) => (
    <div data-testid="copy-icon" className={className} />
  ),
  Trash2: ({ className }: { className?: string }) => (
    <div data-testid="trash-icon" className={className} />
  ),
  Edit: ({ className }: { className?: string }) => (
    <div data-testid="edit-icon" className={className} />
  ),
  Calendar: ({ className }: { className?: string }) => (
    <div data-testid="calendar-icon" className={className} />
  ),
  Lock: ({ className }: { className?: string }) => (
    <div data-testid="lock-icon" className={className} />
  ),
  Globe: ({ className }: { className?: string }) => (
    <div data-testid="globe-icon" className={className} />
  )
}))

const mockPack: Pack & { totalWeight?: { oz: number; g: number }; itemCount?: number } = {
  id: 'pack-1',
  name: 'Weekend Hiking Pack',
  user_id: 'user-123',
  is_public: false,
  share_token: undefined,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-15T12:30:00Z',
  totalWeight: { oz: 25.5, g: 723 },
  itemCount: 8
}

const publicPack: Pack & { totalWeight?: { oz: number; g: number }; itemCount?: number } = {
  ...mockPack,
  id: 'pack-2',
  name: 'Public Ultralight Pack',
  is_public: true,
  share_token: 'abc123',
  totalWeight: { oz: 12.3, g: 349 },
  itemCount: 5
}

const packWithoutStats: Pack = {
  id: 'pack-3',
  name: 'Empty Pack',
  user_id: 'user-123',
  is_public: false,
  share_token: undefined,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const defaultProps = {
  pack: mockPack,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
  onShare: jest.fn(),
  onView: jest.fn(),
  className: ''
}

describe('PackCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock Date.toLocaleDateString
    jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('Jan 15, 23')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the pack card with pack name', () => {
      render(<PackCard {...defaultProps} />)
      
      expect(screen.getByText('Weekend Hiking Pack')).toBeInTheDocument()
      expect(screen.getByTestId('backpack-icon')).toBeInTheDocument()
    })

    it('displays pack updated date', () => {
      render(<PackCard {...defaultProps} />)
      
      expect(screen.getByText('Jan 15, 23')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<PackCard {...defaultProps} className="custom-class" />)
      
      const card = screen.getByText('Weekend Hiking Pack').closest('.bg-white')
      expect(card).toHaveClass('custom-class')
    })

    it('uses default className when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { className, ...propsWithoutClassName } = defaultProps
      render(<PackCard {...propsWithoutClassName} />)
      
      const card = screen.getByText('Weekend Hiking Pack').closest('.bg-white')
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border')
    })
  })

  describe('Privacy Status', () => {
    it('shows private status for private packs', () => {
      render(<PackCard {...defaultProps} />)
      
      expect(screen.getByText('Private')).toBeInTheDocument()
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
    })

    it('shows public status for public packs', () => {
      render(<PackCard {...defaultProps} pack={publicPack} />)
      
      expect(screen.getByText('Public')).toBeInTheDocument()
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument()
    })

    it('shows shared badge for public packs with share token', () => {
      render(<PackCard {...defaultProps} pack={publicPack} />)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('Shared')
      expect(badge).toHaveAttribute('data-variant', 'outline')
      expect(badge).toHaveAttribute('data-size', 'sm')
    })

    it('does not show shared badge for private packs', () => {
      render(<PackCard {...defaultProps} />)
      
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })

    it('does not show shared badge for public packs without share token', () => {
      const publicPackNoToken = { ...publicPack, share_token: undefined }
      render(<PackCard {...defaultProps} pack={publicPackNoToken} />)
      
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })
  })

  describe('Weight Display', () => {
    it('displays total weight when available', () => {
      render(<PackCard {...defaultProps} />)
      
      expect(screen.getByText('Total Weight')).toBeInTheDocument()
      expect(screen.getByText('25.5 oz')).toBeInTheDocument()
      expect(screen.getByText('(723g)')).toBeInTheDocument()
    })

    it('shows "Not calculated" when weight is not available', () => {
      render(<PackCard {...defaultProps} pack={packWithoutStats} />)
      
      expect(screen.getByText('Total Weight')).toBeInTheDocument()
      expect(screen.getByText('Not calculated')).toBeInTheDocument()
    })

    it('calls formatWeight with correct parameters', () => {
      const utils = jest.requireMock('@/lib/utils')
      render(<PackCard {...defaultProps} />)
      
      expect(utils.formatWeight).toHaveBeenCalledWith(25.5, 723, 'imperial')
      expect(utils.formatWeight).toHaveBeenCalledWith(25.5, 723, 'metric')
    })
  })

  describe('Item Count Display', () => {
    it('displays item count when available', () => {
      render(<PackCard {...defaultProps} />)
      
      expect(screen.getByText('Items')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('shows 0 when item count is not available', () => {
      render(<PackCard {...defaultProps} pack={packWithoutStats} />)
      
      expect(screen.getByText('Items')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows 0 when itemCount is undefined', () => {
      const packWithUndefinedCount = { ...mockPack, itemCount: undefined }
      render(<PackCard {...defaultProps} pack={packWithUndefinedCount} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('renders View Pack button', () => {
      render(<PackCard {...defaultProps} />)
      
      const viewButton = screen.getByText('View Pack')
      expect(viewButton).toBeInTheDocument()
    })

    it('calls onView when View Pack button is clicked', () => {
      const mockOnView = jest.fn()
      render(<PackCard {...defaultProps} onView={mockOnView} />)
      
      const viewButton = screen.getByText('View Pack')
      fireEvent.click(viewButton)
      
      expect(mockOnView).toHaveBeenCalledTimes(1)
      expect(mockOnView).toHaveBeenCalledWith(mockPack)
    })

    it('does not crash when onView is not provided', () => {
      render(<PackCard {...defaultProps} onView={undefined} />)
      
      const viewButton = screen.getByText('View Pack')
      expect(() => fireEvent.click(viewButton)).not.toThrow()
    })
  })

  describe('Share Action', () => {
    it('shows share button for public packs when onShare is provided', () => {
      render(<PackCard {...defaultProps} pack={publicPack} onShare={jest.fn()} />)
      
      expect(screen.getByTestId('share-icon')).toBeInTheDocument()
      expect(screen.getByTitle('Share pack')).toBeInTheDocument()
    })

    it('does not show share button for private packs', () => {
      render(<PackCard {...defaultProps} onShare={jest.fn()} />)
      
      expect(screen.queryByTestId('share-icon')).not.toBeInTheDocument()
    })

    it('does not show share button when onShare is not provided', () => {
      render(<PackCard {...defaultProps} pack={publicPack} onShare={undefined} />)
      
      expect(screen.queryByTestId('share-icon')).not.toBeInTheDocument()
    })

    it('calls onShare when share button is clicked', () => {
      const mockOnShare = jest.fn()
      render(<PackCard {...defaultProps} pack={publicPack} onShare={mockOnShare} />)
      
      const shareButton = screen.getByTestId('share-icon').closest('button')
      fireEvent.click(shareButton!)
      
      expect(mockOnShare).toHaveBeenCalledTimes(1)
      expect(mockOnShare).toHaveBeenCalledWith(publicPack)
    })
  })

  describe('Duplicate Action', () => {
    it('shows duplicate button when onDuplicate is provided', () => {
      render(<PackCard {...defaultProps} onDuplicate={jest.fn()} />)
      
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
      expect(screen.getByTitle('Duplicate pack')).toBeInTheDocument()
    })

    it('does not show duplicate button when onDuplicate is not provided', () => {
      render(<PackCard {...defaultProps} onDuplicate={undefined} />)
      
      expect(screen.queryByTestId('copy-icon')).not.toBeInTheDocument()
    })

    it('calls onDuplicate when duplicate button is clicked', () => {
      const mockOnDuplicate = jest.fn()
      render(<PackCard {...defaultProps} onDuplicate={mockOnDuplicate} />)
      
      const duplicateButton = screen.getByTestId('copy-icon').closest('button')
      fireEvent.click(duplicateButton!)
      
      expect(mockOnDuplicate).toHaveBeenCalledTimes(1)
      expect(mockOnDuplicate).toHaveBeenCalledWith(mockPack)
    })
  })

  describe('Edit Action', () => {
    it('shows edit button when onEdit is provided', () => {
      render(<PackCard {...defaultProps} onEdit={jest.fn()} />)
      
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
      expect(screen.getByTitle('Edit pack')).toBeInTheDocument()
    })

    it('does not show edit button when onEdit is not provided', () => {
      render(<PackCard {...defaultProps} onEdit={undefined} />)
      
      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', () => {
      const mockOnEdit = jest.fn()
      render(<PackCard {...defaultProps} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByTestId('edit-icon').closest('button')
      fireEvent.click(editButton!)
      
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
      expect(mockOnEdit).toHaveBeenCalledWith(mockPack)
    })
  })

  describe('Delete Action', () => {
    it('shows delete button when onDelete is provided', () => {
      render(<PackCard {...defaultProps} onDelete={jest.fn()} />)
      
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument()
      expect(screen.getByTitle('Delete pack')).toBeInTheDocument()
    })

    it('does not show delete button when onDelete is not provided', () => {
      render(<PackCard {...defaultProps} onDelete={undefined} />)
      
      expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument()
    })

    it('calls onDelete when delete button is clicked', () => {
      const mockOnDelete = jest.fn()
      render(<PackCard {...defaultProps} onDelete={mockOnDelete} />)
      
      const deleteButton = screen.getByTestId('trash-icon').closest('button')
      fireEvent.click(deleteButton!)
      
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
      expect(mockOnDelete).toHaveBeenCalledWith(mockPack)
    })
  })

  describe('Date Formatting', () => {
    it('formats date correctly', () => {
      const dateInstance = new Date(mockPack.updated_at)
      render(<PackCard {...defaultProps} />)
      
      expect(dateInstance.toLocaleDateString).toHaveBeenCalledWith('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      })
    })

    it('handles different date formats', () => {
      const packWithDifferentDate = {
        ...mockPack,
        updated_at: '2024-12-31T23:59:59Z'
      }
      
      Date.prototype.toLocaleDateString = jest.fn().mockReturnValue('Dec 31, 24')
      
      render(<PackCard {...defaultProps} pack={packWithDifferentDate} />)
      
      expect(screen.getByText('Dec 31, 24')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders all buttons as button elements', () => {
      render(<PackCard {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('provides proper button titles for action buttons', () => {
      render(<PackCard {...defaultProps} />)
      
      expect(screen.getByTitle('Duplicate pack')).toBeInTheDocument()
      expect(screen.getByTitle('Edit pack')).toBeInTheDocument()
      expect(screen.getByTitle('Delete pack')).toBeInTheDocument()
    })

    it('has proper heading hierarchy', () => {
      render(<PackCard {...defaultProps} />)
      
      const heading = screen.getByText('Weekend Hiking Pack')
      expect(heading.tagName).toBe('H3')
    })
  })

  describe('Hover States', () => {
    it('applies hover classes to buttons', () => {
      render(<PackCard {...defaultProps} />)
      
      const viewButton = screen.getByText('View Pack')
      expect(viewButton).toHaveClass('hover:text-green-700')
      
      const editButton = screen.getByTestId('edit-icon').closest('button')
      expect(editButton).toHaveClass('hover:text-gray-600')
      
      const deleteButton = screen.getByTestId('trash-icon').closest('button')
      expect(deleteButton).toHaveClass('hover:text-red-600')
      
      const duplicateButton = screen.getByTestId('copy-icon').closest('button')
      expect(duplicateButton).toHaveClass('hover:text-blue-600')
    })

    it('applies card hover effects', () => {
      render(<PackCard {...defaultProps} />)
      
      const card = screen.getByText('Weekend Hiking Pack').closest('.bg-white')
      expect(card).toHaveClass('hover:shadow-md')
    })
  })

  describe('Edge Cases', () => {
    it('handles pack name truncation', () => {
      const packWithLongName = {
        ...mockPack,
        name: 'This is a very long pack name that should be truncated to prevent layout issues'
      }
      
      render(<PackCard {...defaultProps} pack={packWithLongName} />)
      
      const heading = screen.getByText(packWithLongName.name)
      expect(heading).toHaveClass('truncate')
    })

    it('handles zero weight values', () => {
      const packWithZeroWeight = {
        ...mockPack,
        totalWeight: { oz: 0, g: 0 }
      }
      
      render(<PackCard {...defaultProps} pack={packWithZeroWeight} />)
      
      expect(screen.getByText('0 oz')).toBeInTheDocument()
      expect(screen.getByText('(0g)')).toBeInTheDocument()
    })

    it('handles zero item count', () => {
      const packWithZeroItems = {
        ...mockPack,
        itemCount: 0
      }
      
      render(<PackCard {...defaultProps} pack={packWithZeroItems} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles missing optional props', () => {
      const minimalProps = {
        pack: packWithoutStats
      }
      
      expect(() => render(<PackCard {...minimalProps} />)).not.toThrow()
    })

    it('handles very large weight values', () => {
      const packWithLargeWeight = {
        ...mockPack,
        totalWeight: { oz: 9999.99, g: 283495 }
      }
      
      render(<PackCard {...defaultProps} pack={packWithLargeWeight} />)
      
      expect(screen.getByText('9999.99 oz')).toBeInTheDocument()
      expect(screen.getByText('(283495g)')).toBeInTheDocument()
    })

    it('handles very large item count', () => {
      const packWithLargeItemCount = {
        ...mockPack,
        itemCount: 999
      }
      
      render(<PackCard {...defaultProps} pack={packWithLargeItemCount} />)
      
      expect(screen.getByText('999')).toBeInTheDocument()
    })
  })
})