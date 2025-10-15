import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('renders badge with children', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      render(<Badge>Badge Content</Badge>)
      const badge = screen.getByText('Badge Content')
      expect(badge.tagName).toBe('SPAN')
    })

    it('applies base classes', () => {
      render(<Badge>Base Classes</Badge>)
      const badge = screen.getByText('Base Classes')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-medium')
    })
  })

  describe('Variants', () => {
    it('applies default variant by default', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-gray-900', 'text-white')
    })

    it('applies secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-900')
    })

    it('applies outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('border', 'border-gray-300', 'bg-white', 'text-gray-700')
    })

    it('applies destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('bg-red-500', 'text-white')
    })
  })

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<Badge>Medium</Badge>)
      const badge = screen.getByText('Medium')
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm')
    })

    it('applies small size', () => {
      render(<Badge size="sm">Small</Badge>)
      const badge = screen.getByText('Small')
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs')
    })

    it('applies large size', () => {
      render(<Badge size="lg">Large</Badge>)
      const badge = screen.getByText('Large')
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base')
    })
  })

  describe('Props', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-class')
    })

    it('combines variant and size', () => {
      render(<Badge variant="secondary" size="lg">Combined</Badge>)
      const badge = screen.getByText('Combined')
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-900', 'px-3', 'py-1.5', 'text-base')
    })
  })
})