import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockUser,
  mockSession,
  mockAuthError,
  renderWithProviders,
  waitForAuthLoad,
  mockSupabaseAuth,
  resetAuthMocks,
  expectButtonToBeDisabled,
  expectButtonToBeEnabled,
  fillForm
} from '../test-utils'

// Mock the AuthContext to avoid actual Supabase calls
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn()
  })
}))

describe('Test Utils', () => {
  describe('Mock Data', () => {
    describe('mockUser', () => {
      it('has required user properties', () => {
        expect(mockUser).toHaveProperty('id', 'test-user-id')
        expect(mockUser).toHaveProperty('email', 'test@example.com')
        expect(mockUser).toHaveProperty('user_metadata')
        expect(mockUser.user_metadata).toHaveProperty('full_name', 'Test User')
        expect(mockUser).toHaveProperty('aud', 'authenticated')
        expect(mockUser).toHaveProperty('created_at')
        expect(mockUser).toHaveProperty('updated_at')
      })

      it('has valid timestamps', () => {
        expect(new Date(mockUser.created_at!)).toBeInstanceOf(Date)
        expect(new Date(mockUser.updated_at!)).toBeInstanceOf(Date)
      })
    })

    describe('mockSession', () => {
      it('has required session properties', () => {
        expect(mockSession).toHaveProperty('access_token', 'mock-access-token')
        expect(mockSession).toHaveProperty('refresh_token', 'mock-refresh-token')
        expect(mockSession).toHaveProperty('expires_in', 3600)
        expect(mockSession).toHaveProperty('token_type', 'bearer')
        expect(mockSession).toHaveProperty('user', mockUser)
      })

      it('has valid expiration time', () => {
        expect(mockSession.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000))
      })
    })

    describe('mockAuthError', () => {
      it('has error properties', () => {
        expect(mockAuthError).toHaveProperty('message', 'Test error')
        expect(mockAuthError).toHaveProperty('status', 400)
      })
    })
  })

  describe('renderWithProviders', () => {
    it('renders component with auth provider wrapper', () => {
      const TestComponent = () => <div data-testid="test-component">Test Content</div>
      
      renderWithProviders(<TestComponent />)
      
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('passes through render options', () => {
      const TestComponent = () => <div>Test</div>
      
      const { container } = renderWithProviders(<TestComponent />, {
        container: document.createElement('main')
      })
      
      expect(container.tagName).toBe('MAIN')
    })

    it('renders complex components', () => {
      const ComplexComponent = () => (
        <div>
          <h1>Title</h1>
          <button>Click me</button>
          <input placeholder="Enter text" />
        </div>
      )
      
      renderWithProviders(<ComplexComponent />)
      
      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })
  })

  describe('waitForAuthLoad', () => {
    it('waits for specified time', async () => {
      const startTime = Date.now()
      await waitForAuthLoad()
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })

    it('returns a promise', () => {
      const result = waitForAuthLoad()
      expect(result).toBeInstanceOf(Promise)
    })
  })

  describe('mockSupabaseAuth', () => {
    it('has all required auth methods', () => {
      expect(mockSupabaseAuth).toHaveProperty('getUser')
      expect(mockSupabaseAuth).toHaveProperty('getSession')
      expect(mockSupabaseAuth).toHaveProperty('signUp')
      expect(mockSupabaseAuth).toHaveProperty('signInWithPassword')
      expect(mockSupabaseAuth).toHaveProperty('signInWithOAuth')
      expect(mockSupabaseAuth).toHaveProperty('signOut')
      expect(mockSupabaseAuth).toHaveProperty('onAuthStateChange')
    })

    it('methods are jest mock functions', () => {
      expect(jest.isMockFunction(mockSupabaseAuth.getUser)).toBe(true)
      expect(jest.isMockFunction(mockSupabaseAuth.signUp)).toBe(true)
      expect(jest.isMockFunction(mockSupabaseAuth.signInWithPassword)).toBe(true)
    })

    it('onAuthStateChange returns subscription object', () => {
      const result = mockSupabaseAuth.onAuthStateChange()
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('subscription')
      expect(result.data.subscription).toHaveProperty('unsubscribe')
      expect(typeof result.data.subscription.unsubscribe).toBe('function')
    })
  })

  describe('resetAuthMocks', () => {
    it('resets all mock functions', () => {
      // Call some mocks first
      mockSupabaseAuth.getUser()
      mockSupabaseAuth.signUp()
      
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledTimes(1)
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledTimes(1)
      
      resetAuthMocks()
      
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledTimes(0)
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledTimes(0)
    })

    it('handles mocks without mockReset gracefully', () => {
      expect(() => resetAuthMocks()).not.toThrow()
    })
  })

  describe('Button Assertion Helpers', () => {
    describe('expectButtonToBeDisabled', () => {
      it('asserts button is disabled and has opacity class', () => {
        renderWithProviders(<button disabled className="opacity-50">Disabled</button>)
        const button = screen.getByRole('button')
        
        expect(() => expectButtonToBeDisabled(button)).not.toThrow()
      })

      it('throws when button is not disabled', () => {
        renderWithProviders(<button>Enabled</button>)
        const button = screen.getByRole('button')
        
        expect(() => expectButtonToBeDisabled(button)).toThrow()
      })
    })

    describe('expectButtonToBeEnabled', () => {
      it('asserts button is enabled and does not have opacity class', () => {
        renderWithProviders(<button>Enabled</button>)
        const button = screen.getByRole('button')
        
        expect(() => expectButtonToBeEnabled(button)).not.toThrow()
      })

      it('throws when button is disabled', () => {
        renderWithProviders(<button disabled className="opacity-50">Disabled</button>)
        const button = screen.getByRole('button')
        
        expect(() => expectButtonToBeEnabled(button)).toThrow()
      })
    })
  })

  describe('fillForm', () => {
    it('fills form inputs with provided data', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <form>
          <input name="email" type="email" />
          <input name="password" type="password" />
          <input name="name" type="text" />
        </form>
      )
      
      await fillForm(user, {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      })
      
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('password123')).toBeInTheDocument()
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    it('clears existing values before typing', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <form>
          <input name="email" type="email" defaultValue="old@example.com" />
        </form>
      )
      
      await fillForm(user, {
        email: 'new@example.com'
      })
      
      expect(screen.getByDisplayValue('new@example.com')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('old@example.com')).not.toBeInTheDocument()
    })

    it('handles missing form fields gracefully', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<div>No form here</div>)
      
      await expect(fillForm(user, {
        nonexistent: 'value'
      })).resolves.not.toThrow()
    })

    it('handles empty form data', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<form><input name="test" /></form>)
      
      await expect(fillForm(user, {})).resolves.not.toThrow()
    })
  })

  describe('Integration Tests', () => {
    it('can use multiple utilities together', async () => {
      const user = userEvent.setup()
      
      const TestForm = () => (
        <form>
          <input name="email" type="email" />
          <button type="submit" disabled className="opacity-50">
            Submit
          </button>
        </form>
      )
      
      renderWithProviders(<TestForm />)
      
      // Fill form
      await fillForm(user, { email: 'test@example.com' })
      
      // Check button state
      const button = screen.getByRole('button')
      expectButtonToBeDisabled(button)
      
      // Verify form was filled
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    it('works with auth mocks and wait helper', async () => {
      // Reset mocks
      resetAuthMocks()
      
      // Use a mock
      mockSupabaseAuth.getUser()
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledTimes(1)
      
      // Wait for auth
      await waitForAuthLoad()
      
      // Verify mock is still tracked
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledTimes(1)
    })
  })
})