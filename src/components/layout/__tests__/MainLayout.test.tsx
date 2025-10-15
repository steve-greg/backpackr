import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MainLayout } from '../MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@supabase/supabase-js'

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; onClick?: () => void }) {
    return (
      <a 
        href={href} 
        {...props}
        onClick={(e) => {
          e.preventDefault() // Prevent actual navigation in tests
          props.onClick?.()
        }}
      >
        {children}
      </a>
    )
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Backpack: ({ className }: { className?: string }) => (
    <div data-testid="backpack-icon" className={className} />
  ),
  Menu: ({ className }: { className?: string }) => (
    <div data-testid="menu-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className} />
  ),
  User: ({ className }: { className?: string }) => (
    <div data-testid="user-icon" className={className} />
  ),
  LogOut: ({ className }: { className?: string }) => (
    <div data-testid="logout-icon" className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <div data-testid="settings-icon" className={className} />
  )
}))

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

const mockUseAuth = jest.mocked(useAuth)

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z'
} as User

const mockUserWithoutFullName = {
  id: 'user-456',
  email: 'noname@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z'
} as User

describe('MainLayout', () => {
  const mockSignOut = jest.fn()

  const createMockAuth = (user: User | null = null) => ({
    user,
    session: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: mockSignOut,
    signInWithGoogle: jest.fn(),
    signInWithGithub: jest.fn()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockSignOut.mockResolvedValue(undefined)
    
    // Suppress jsdom navigation warnings
    const originalConsoleError = console.error
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'object' && args[0] && 'message' in args[0] && 
          typeof args[0].message === 'string' && 
          args[0].message.includes('Not implemented: navigation')) {
        return // Suppress navigation warnings
      }
      originalConsoleError.apply(console, args)
    }
  })

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('mousedown', jest.fn())
    // Restore console.error if it was modified
    jest.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the layout structure with children', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: mockSignOut,
        signInWithGoogle: jest.fn(),
        signInWithGithub: jest.fn()
      })

      render(
        <MainLayout>
          <div data-testid="test-children">Test Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders the logo and brand name', () => {
      mockUseAuth.mockReturnValue(createMockAuth())

      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      expect(screen.getAllByText('Backpackr')).toHaveLength(1)
      expect(screen.getAllByTestId('backpack-icon')).toHaveLength(2) // Header + Footer
    })

    it('renders main navigation links', () => {
      mockUseAuth.mockReturnValue(createMockAuth())

      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Desktop navigation
      expect(screen.getByText('Browse Gear')).toBeInTheDocument()
      expect(screen.getByText('Create Pack')).toBeInTheDocument()
      expect(screen.getByText('My Packs')).toBeInTheDocument()
      expect(screen.getByText('Custom Gear')).toBeInTheDocument()
    })

    it('renders footer', () => {
      mockUseAuth.mockReturnValue(createMockAuth())

      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      expect(screen.getByText('© 2025 Backpackr. Built for adventurers.')).toBeInTheDocument()
      expect(screen.getByText('Open source hiking gear planner')).toBeInTheDocument()
    })
  })

  describe('Guest User State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth())
    })

    it('shows sign in and sign up buttons for guest users', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Desktop auth buttons
      const signInLinks = screen.getAllByText('Sign In')
      const signUpLinks = screen.getAllByText('Sign Up')
      
      expect(signInLinks.length).toBeGreaterThan(0)
      expect(signUpLinks.length).toBeGreaterThan(0)
    })

    it('does not show user menu for guest users', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument()
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated User State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth(mockUser))
    })

    it('shows user menu button with user name', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('displays user email fallback when full name is not available', () => {
      mockUseAuth.mockReturnValue(createMockAuth(mockUserWithoutFullName))

      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      expect(screen.getByText('noname')).toBeInTheDocument() // Email prefix
    })

    it('opens user menu when user button is clicked', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      const userButton = screen.getByText('Test User').closest('button')
      expect(userButton).toBeInTheDocument()

      fireEvent.click(userButton!)

      // User menu should be visible
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('closes user menu when clicked outside', async () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open user menu first
      const userButton = screen.getByText('Test User').closest('button')
      fireEvent.click(userButton!)
      expect(screen.getByText('Settings')).toBeInTheDocument()

      // Click outside the menu
      fireEvent.mouseDown(document.body)

      await waitFor(() => {
        expect(screen.queryByText('Settings')).not.toBeInTheDocument()
      })
    })

    it('calls signOut when sign out button is clicked', async () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open user menu
      const userButton = screen.getByText('Test User').closest('button')
      fireEvent.click(userButton!)

      // Click sign out and wait for async operation
      const signOutButton = screen.getByText('Sign Out')
      
      await act(async () => {
        fireEvent.click(signOutButton)
        await new Promise(resolve => setTimeout(resolve, 0)) // Allow async operations to complete
      })

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('handles sign out errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockSignOut.mockRejectedValue(new Error('Sign out failed'))

      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      const userButton = screen.getByText('Test User').closest('button')
      fireEvent.click(userButton!)

      const signOutButton = screen.getByText('Sign Out')
      
      await act(async () => {
        fireEvent.click(signOutButton)
        await new Promise(resolve => setTimeout(resolve, 0)) // Allow async operations to complete
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('closes user menu when settings is clicked', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open user menu
      const userButton = screen.getByText('Test User').closest('button')
      fireEvent.click(userButton!)
      expect(screen.getByText('Settings')).toBeInTheDocument()

      // Click settings
      const settingsButton = screen.getByText('Settings')
      fireEvent.click(settingsButton)

      // Menu should close
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth())
    })

    it('shows mobile menu button', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })

    it('opens mobile menu when menu button is clicked', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Mobile menu should be visible
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('closes mobile menu when X button is clicked', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Close mobile menu
      const closeButton = screen.getByTestId('x-icon').closest('button')
      fireEvent.click(closeButton!)

      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })

    it('closes mobile menu when navigation link is clicked', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Click a navigation link in mobile menu
      const gearLinks = screen.getAllByText('Browse Gear')
      const mobileGearLink = gearLinks.find(link => 
        link.closest('.md\\:hidden')
      )
      
      if (mobileGearLink) {
        fireEvent.click(mobileGearLink)
      }

      // Menu should close
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })
  })

  describe('Mobile Navigation - Authenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth(mockUser))
    })

    it('shows user info in mobile menu', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Should show user info in mobile menu - desktop user menu is closed initially
      expect(screen.getAllByText('Test User')).toHaveLength(2) // Desktop button + Mobile display
      expect(screen.getByText('test@example.com')).toBeInTheDocument() // Mobile only when menu is open
    })

    it('calls signOut from mobile menu', async () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Click sign out in mobile menu
      const signOutButtons = screen.getAllByText('Sign Out')
      const mobileSignOutButton = signOutButtons.find(button =>
        button.closest('.md\\:hidden')
      )

      if (mobileSignOutButton) {
        await act(async () => {
          fireEvent.click(mobileSignOutButton)
          await new Promise(resolve => setTimeout(resolve, 0)) // Allow async operations to complete
        })
      }

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('closes mobile menu when mobile auth actions are clicked', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Click mobile settings
      const settingsButtons = screen.getAllByText('Settings')
      const mobileSettingsButton = settingsButtons.find(button =>
        button.closest('.md\\:hidden')
      )

      if (mobileSettingsButton) {
        fireEvent.click(mobileSettingsButton)
      }

      // Menu should close
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })
  })

  describe('Mobile Navigation - Guest User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth())
    })

    it('shows auth buttons in mobile menu for guest users', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Should show auth buttons in mobile menu
      const signInLinks = screen.getAllByText('Sign In')
      const signUpLinks = screen.getAllByText('Sign Up')
      
      expect(signInLinks.length).toBeGreaterThanOrEqual(2) // Desktop + Mobile
      expect(signUpLinks.length).toBeGreaterThanOrEqual(2) // Desktop + Mobile
    })

    it('closes mobile menu when auth links are clicked', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Open mobile menu
      const menuButton = screen.getByTestId('menu-icon').closest('button')
      fireEvent.click(menuButton!)

      // Click sign in in mobile menu
      const signInLinks = screen.getAllByText('Sign In')
      const mobileSignInLink = signInLinks.find(link =>
        link.closest('.md\\:hidden')
      )

      if (mobileSignInLink) {
        fireEvent.click(mobileSignInLink)
      }

      // Menu should close
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })
  })

  describe('Link Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth())
    })

    it('renders correct href attributes for navigation links', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      expect(screen.getByText('Browse Gear').closest('a')).toHaveAttribute('href', '/gear')
      expect(screen.getByText('Create Pack').closest('a')).toHaveAttribute('href', '/packs/create')
      expect(screen.getByText('My Packs').closest('a')).toHaveAttribute('href', '/packs')
    })

    it('logo links to home page', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      const logoLink = screen.getByText('Backpackr').closest('a')
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Responsive Design Classes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth())
    })

    it('applies responsive classes correctly', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      )

      // Check for responsive navigation classes
      const desktopNav = screen.getByText('Browse Gear').closest('nav')
      expect(desktopNav).toHaveClass('hidden', 'md:flex')

      // Check for mobile menu button classes  
      const mobileMenuButton = screen.getByTestId('menu-icon').closest('button')?.parentElement
      expect(mobileMenuButton).toHaveClass('md:hidden')
    })
  })
})