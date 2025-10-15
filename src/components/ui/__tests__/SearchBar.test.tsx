import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className} />
  )
}))

// Mock timers for debounce testing
jest.useFakeTimers()

describe('SearchBar', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('renders search input', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders search icon', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('uses default placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.getByPlaceholderText('Search gear...')).toBeInTheDocument()
    })

    it('uses custom placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} placeholder="Search items..." />)
      
      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<SearchBar onSearch={mockOnSearch} className="custom-search" />)
      
      const container = screen.getByRole('textbox').closest('div')
      expect(container).toHaveClass('custom-search')
    })

    it('uses empty string as default className', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const container = screen.getByRole('textbox').closest('div')
      expect(container?.className).not.toContain('undefined')
    })
  })

  describe('Input Functionality', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test query')
      
      expect(input).toHaveValue('test query')
    })

    it('starts with empty value', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('handles special characters', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test@#$%')
      
      expect(input).toHaveValue('test@#$%')
    })
  })

  describe('Clear Functionality', () => {
    it('does not show clear button when input is empty', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })

    it('shows clear button when input has content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test query')
      
      const clearButton = screen.getByTestId('x-icon').closest('button')
      await user.click(clearButton!)
      
      expect(input).toHaveValue('')
    })

    it('hides clear button after clearing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearButton = screen.getByTestId('x-icon').closest('button')
      await user.click(clearButton!)
      
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })
  })

  describe('Debounce Functionality', () => {
    it('uses default debounce delay of 300ms', async () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(mockOnSearch).toHaveBeenCalledWith('test')
    })

    it('uses custom debounce delay', async () => {
      render(<SearchBar onSearch={mockOnSearch} debounceMs={500} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      act(() => {
        jest.advanceTimersByTime(499)
      })
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(mockOnSearch).toHaveBeenCalledWith('test')
    })

    it('resets debounce timer on new input', async () => {
      render(<SearchBar onSearch={mockOnSearch} debounceMs={300} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'test' } })
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      fireEvent.change(input, { target: { value: 'testing' } })
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      expect(mockOnSearch).toHaveBeenCalledWith('testing')
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
    })

    it('calls onSearch with empty string initially', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(mockOnSearch).toHaveBeenCalledWith('')
    })

    it('calls onSearch when query is cleared', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      expect(mockOnSearch).toHaveBeenCalledWith('test')
      
      const clearButton = screen.getByTestId('x-icon').closest('button')
      await user.click(clearButton!)
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      expect(mockOnSearch).toHaveBeenCalledWith('')
    })
  })

  describe('Search Behavior', () => {
    it('calls onSearch after debounce delay', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'search term' } })
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(mockOnSearch).toHaveBeenCalledWith('search term')
    })

    it('calls onSearch multiple times for different queries', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'first' } })
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      fireEvent.change(input, { target: { value: 'second' } })
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(mockOnSearch).toHaveBeenCalledWith('first')
      expect(mockOnSearch).toHaveBeenCalledWith('second')
      expect(mockOnSearch).toHaveBeenCalledTimes(2) // 2 queries
    })

    it('handles rapid typing correctly', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 't' } })
      fireEvent.change(input, { target: { value: 'te' } })
      fireEvent.change(input, { target: { value: 'tes' } })
      fireEvent.change(input, { target: { value: 'test' } })
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(mockOnSearch).toHaveBeenCalledWith('test')
      expect(mockOnSearch).toHaveBeenCalledTimes(1) // only final query
    })
  })

  describe('Styling and Layout', () => {
    it('has proper container structure', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const container = screen.getByRole('textbox').closest('div')
      expect(container).toHaveClass('relative')
    })

    it('applies proper search icon styling', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toHaveClass('h-5', 'w-5', 'text-gray-400')
    })

    it('applies proper input styling', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'block', 'w-full', 'pl-10', 'pr-10', 'py-2', 'border', 'border-gray-300',
        'rounded-md', 'leading-5', 'bg-white', 'placeholder-gray-500', 'text-gray-900',
        'focus:outline-none', 'focus:placeholder-gray-400', 'focus:ring-1',
        'focus:ring-green-500', 'focus:border-green-500'
      )
    })

    it('positions search icon correctly', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const iconContainer = screen.getByTestId('search-icon').parentElement
      expect(iconContainer).toHaveClass('absolute', 'inset-y-0', 'left-0', 'pl-3', 'flex', 'items-center', 'pointer-events-none')
    })

    it('positions clear button correctly when shown', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearContainer = screen.getByTestId('x-icon').parentElement?.parentElement
      expect(clearContainer).toHaveClass('absolute', 'inset-y-0', 'right-0', 'pr-3', 'flex', 'items-center')
    })

    it('applies proper clear button styling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearButton = screen.getByTestId('x-icon').closest('button')
      expect(clearButton).toHaveClass('text-gray-400', 'hover:text-gray-600')
    })

    it('applies proper clear icon styling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearIcon = screen.getByTestId('x-icon')
      expect(clearIcon).toHaveClass('h-4', 'w-4')
    })
  })

  describe('Accessibility', () => {
    it('has proper input role', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('has proper input type', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('clear button is keyboard accessible', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearButton = screen.getByTestId('x-icon').closest('button')
      expect(clearButton).toBeInTheDocument()
      
      clearButton?.focus()
      expect(clearButton).toHaveFocus()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      
      await user.tab()
      expect(input).toHaveFocus()
      
      await user.type(input, 'test')
      await user.tab()
      
      const clearButton = screen.getByTestId('x-icon').closest('button')
      expect(clearButton).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long search queries', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const longQuery = 'a'.repeat(1000)
      
      render(<SearchBar onSearch={mockOnSearch} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      await user.type(input, longQuery)
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(mockOnSearch).toHaveBeenCalledWith(longQuery)
    })

    it('handles zero debounce delay', () => {
      render(<SearchBar onSearch={mockOnSearch} debounceMs={0} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'instant' } })
      
      act(() => {
        jest.advanceTimersByTime(0)
      })
      
      expect(mockOnSearch).toHaveBeenCalledWith('instant')
    })

    it('handles component unmounting during debounce', () => {
      const { unmount } = render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      unmount()
      
      expect(() => act(() => jest.advanceTimersByTime(300))).not.toThrow()
    })

    it('handles onSearch callback changing', () => {
      const firstCallback = jest.fn()
      const secondCallback = jest.fn()
      
      const { rerender } = render(<SearchBar onSearch={firstCallback} />)
      
      // Clear the initial empty calls
      expect(firstCallback).toHaveBeenCalledWith('')
      firstCallback.mockClear()
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      rerender(<SearchBar onSearch={secondCallback} />)
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(firstCallback).not.toHaveBeenCalled()
      expect(secondCallback).toHaveBeenCalledWith('test')
    })

    it('handles whitespace-only queries', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      // Clear the initial empty call
      expect(mockOnSearch).toHaveBeenCalledWith('')
      mockOnSearch.mockClear()
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '   ' } })
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(mockOnSearch).toHaveBeenCalledWith('   ')
    })
  })
})