import { render, screen } from '@testing-library/react'
import { LoadingSpinner, EmptyState } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  describe('Basic Rendering', () => {
    it('renders loading spinner', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('renders svg element', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.tagName).toBe('svg')
    })

    it('has proper viewBox attribute', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('contains circle and path elements', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      const circle = svg?.querySelector('circle')
      const path = svg?.querySelector('path')
      
      expect(circle).toBeInTheDocument()
      expect(path).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('applies medium size by default', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('h-6', 'w-6')
    })

    it('applies medium size when explicitly set', () => {
      render(<LoadingSpinner size="md" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('h-6', 'w-6')
    })

    it('applies small size', () => {
      render(<LoadingSpinner size="sm" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('applies large size', () => {
      render(<LoadingSpinner size="lg" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('h-8', 'w-8')
    })
  })

  describe('Animation and Styling', () => {
    it('has animate-spin class', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('animate-spin')
    })

    it('applies custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('custom-spinner')
    })

    it('uses empty string as default className', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner.className).not.toContain('undefined')
    })

    it('combines size and custom className', () => {
      render(<LoadingSpinner size="lg" className="text-blue-500" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('h-8', 'w-8', 'animate-spin', 'text-blue-500')
    })
  })

  describe('SVG Structure', () => {
    it('has correct circle attributes', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      const circle = svg?.querySelector('circle')
      
      expect(circle).toHaveAttribute('cx', '12')
      expect(circle).toHaveAttribute('cy', '12')
      expect(circle).toHaveAttribute('r', '10')
      expect(circle).toHaveAttribute('stroke', 'currentColor')
      expect(circle).toHaveAttribute('stroke-width', '4')
      expect(circle).toHaveAttribute('fill', 'none')
    })

    it('has correct circle classes', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      const circle = svg?.querySelector('circle')
      
      expect(circle).toHaveClass('opacity-25')
    })

    it('has correct path attributes', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      const path = svg?.querySelector('path')
      
      expect(path).toHaveAttribute('fill', 'currentColor')
      expect(path).toHaveAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z')
    })

    it('has correct path classes', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      const path = svg?.querySelector('path')
      
      expect(path).toHaveClass('opacity-75')
    })

    it('svg has full width and height classes', () => {
      render(<LoadingSpinner />)
      
      const container = screen.getByTestId('loading-spinner')
      const svg = container.querySelector('svg')
      
      expect(svg).toHaveClass('w-full', 'h-full')
    })
  })
})

describe('EmptyState', () => {
  const mockIcon = <div data-testid="mock-icon">Icon</div>
  const mockAction = <button data-testid="mock-action">Action</button>

  describe('Basic Rendering', () => {
    it('renders with required title', () => {
      render(<EmptyState title="No Data" />)
      
      expect(screen.getByText('No Data')).toBeInTheDocument()
    })

    it('renders title as h3 element', () => {
      render(<EmptyState title="Empty Title" />)
      
      const title = screen.getByText('Empty Title')
      expect(title.tagName).toBe('H3')
    })

    it('has proper title styling', () => {
      render(<EmptyState title="Styled Title" />)
      
      const title = screen.getByText('Styled Title')
      expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-900', 'mb-2')
    })

    it('has proper container styling', () => {
      render(<EmptyState title="Container Test" />)
      
      const container = screen.getByText('Container Test').closest('div')
      expect(container).toHaveClass('text-center', 'py-12')
    })
  })

  describe('Optional Icon', () => {
    it('renders without icon when not provided', () => {
      render(<EmptyState title="No Icon" />)
      
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
    })

    it('renders with icon when provided', () => {
      render(<EmptyState title="With Icon" icon={mockIcon} />)
      
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('applies proper icon container styling', () => {
      render(<EmptyState title="Icon Container" icon={mockIcon} />)
      
      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveClass('flex', 'justify-center', 'mb-4')
    })

    it('renders complex icon content', () => {
      const complexIcon = (
        <div data-testid="complex-icon">
          <svg>
            <circle />
          </svg>
        </div>
      )
      
      render(<EmptyState title="Complex Icon" icon={complexIcon} />)
      
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
      expect(screen.getByTestId('complex-icon').querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Optional Description', () => {
    it('renders without description when not provided', () => {
      render(<EmptyState title="No Description" />)
      
      const container = screen.getByTestId('empty-state')
      const description = container.querySelector('p')
      expect(description).not.toBeInTheDocument()
    })

    it('renders with description when provided', () => {
      render(<EmptyState title="With Description" description="This is a description" />)
      
      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('applies proper description styling', () => {
      render(<EmptyState title="Description Style" description="Styled description" />)
      
      const description = screen.getByText('Styled description')
      expect(description).toHaveClass('text-gray-500', 'mb-6', 'max-w-sm', 'mx-auto')
      expect(description.tagName).toBe('P')
    })

    it('renders long description', () => {
      const longDescription = 'This is a very long description that should wrap properly and maintain good spacing within the component layout.'
      
      render(<EmptyState title="Long Description" description={longDescription} />)
      
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })

  describe('Optional Action', () => {
    it('renders without action when not provided', () => {
      render(<EmptyState title="No Action" />)
      
      expect(screen.queryByTestId('mock-action')).not.toBeInTheDocument()
    })

    it('renders with action when provided', () => {
      render(<EmptyState title="With Action" action={mockAction} />)
      
      expect(screen.getByTestId('mock-action')).toBeInTheDocument()
    })

    it('applies proper action container styling', () => {
      render(<EmptyState title="Action Container" action={mockAction} />)
      
      const actionContainer = screen.getByTestId('mock-action').closest('div')
      expect(actionContainer).toHaveClass('flex', 'justify-center')
    })

    it('renders complex action content', () => {
      const complexAction = (
        <div data-testid="complex-action">
          <button>Primary</button>
          <button>Secondary</button>
        </div>
      )
      
      render(<EmptyState title="Complex Action" action={complexAction} />)
      
      expect(screen.getByTestId('complex-action')).toBeInTheDocument()
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<EmptyState title="Custom Style" className="custom-empty-state" />)
      
      const container = screen.getByText('Custom Style').closest('div')
      expect(container).toHaveClass('custom-empty-state')
    })

    it('uses empty string as default className', () => {
      render(<EmptyState title="Default Class" />)
      
      const container = screen.getByText('Default Class').closest('div')
      expect(container).toHaveClass('text-center', 'py-12')
      expect(container?.className).not.toContain('undefined')
    })

    it('combines custom className with default classes', () => {
      render(<EmptyState title="Combined Classes" className="bg-red-100 border" />)
      
      const container = screen.getByText('Combined Classes').closest('div')
      expect(container).toHaveClass('text-center', 'py-12', 'bg-red-100', 'border')
    })
  })

  describe('Full Component Combinations', () => {
    it('renders with all props provided', () => {
      render(
        <EmptyState
          title="Complete Example"
          description="This example has all props"
          icon={mockIcon}
          action={mockAction}
          className="custom-complete"
        />
      )
      
      expect(screen.getByText('Complete Example')).toBeInTheDocument()
      expect(screen.getByText('This example has all props')).toBeInTheDocument()
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.getByTestId('mock-action')).toBeInTheDocument()
      expect(screen.getByText('Complete Example').closest('div')).toHaveClass('custom-complete')
    })

    it('renders with only title and description', () => {
      render(
        <EmptyState
          title="Title and Description"
          description="Just these two props"
        />
      )
      
      expect(screen.getByText('Title and Description')).toBeInTheDocument()
      expect(screen.getByText('Just these two props')).toBeInTheDocument()
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('mock-action')).not.toBeInTheDocument()
    })

    it('renders with title and icon only', () => {
      render(<EmptyState title="Title and Icon" icon={mockIcon} />)
      
      expect(screen.getByText('Title and Icon')).toBeInTheDocument()
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
      expect(screen.queryByTestId('mock-action')).not.toBeInTheDocument()
    })

    it('renders with title and action only', () => {
      render(<EmptyState title="Title and Action" action={mockAction} />)
      
      expect(screen.getByText('Title and Action')).toBeInTheDocument()
      expect(screen.getByTestId('mock-action')).toBeInTheDocument()
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<EmptyState title="Accessible Title" />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Accessible Title')
    })

    it('maintains semantic structure with all elements', () => {
      render(
        <EmptyState
          title="Semantic Structure"
          description="Proper semantics"
          icon={<div role="img" aria-label="Empty icon">🗂️</div>}
          action={<button>Take Action</button>}
        />
      )
      
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'Empty icon' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Take Action' })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(<EmptyState title="" />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toBeInTheDocument()
      expect(heading).toBeEmptyDOMElement()
    })

    it('handles very long title', () => {
      const longTitle = 'This is a very long title that should wrap properly within the component layout and maintain good typography'
      
      render(<EmptyState title={longTitle} />)
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles empty description', () => {
      render(<EmptyState title="Empty" />)
      
      const container = screen.getByTestId('empty-state')
      const description = container.querySelector('p')
      
      if (description) {
        expect(description).toBeInTheDocument()
        expect(description).toBeEmptyDOMElement()
      } else {
        // If no description paragraph is rendered when no description prop is provided
        expect(description).toBeNull()
      }
    })

    it('handles undefined optional props gracefully', () => {
      render(
        <EmptyState
          title="Undefined Props"
          icon={undefined}
          description={undefined}
          action={undefined}
          className={undefined}
        />
      )
      
      expect(screen.getByText('Undefined Props')).toBeInTheDocument()
    })
  })
})