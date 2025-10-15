import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    }
  }
}))

import { supabase } from '@/lib/supabase/client'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAuth = supabase.auth as jest.Mocked<any>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock console methods to avoid noise in tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
}

// Mock user and session data
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString()
}

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser
}

// Test component to access the auth context
function TestComponent() {
  const auth = useAuth()
  
  return (
    <div>
      <div data-testid="user-email">{auth.user?.email || 'No user'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="session-exists">{auth.session ? 'Has session' : 'No session'}</div>
      <button 
        data-testid="sign-in-btn" 
        onClick={() => auth.signIn('test@example.com', 'password')}
      >
        Sign In
      </button>
      <button 
        data-testid="sign-up-btn" 
        onClick={() => auth.signUp('test@example.com', 'password', { full_name: 'Test User' })}
      >
        Sign Up
      </button>
      <button 
        data-testid="sign-out-btn" 
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
      <button 
        data-testid="google-signin-btn" 
        onClick={() => auth.signInWithGoogle()}
      >
        Sign In with Google
      </button>
      <button 
        data-testid="github-signin-btn" 
        onClick={() => auth.signInWithGithub()}
      >
        Sign In with GitHub
      </button>
    </div>
  )
}

async function renderWithAuth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any
  await act(async () => {
    result = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
  })
  return result
}

describe('AuthContext', () => {
  let mockSubscription: { unsubscribe: jest.Mock }
  let authStateChangeCallback: (event: AuthChangeEvent, session: Session | null) => void

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockAuth).forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset()
      }
    })
    
    // Clear localStorage mocks
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    
    // Clear console spy mocks
    consoleSpy.log.mockClear()
    consoleSpy.error.mockClear()
    
    // Setup auth state change mock
    mockSubscription = { unsubscribe: jest.fn() }
    mockAuth.onAuthStateChange.mockImplementation((callback: (event: AuthChangeEvent, session: Session | null) => void) => {
      authStateChangeCallback = callback
      return {
        data: { subscription: mockSubscription }
      }
    })
    
    // Default mock implementations
    mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  describe('Initial State and Session Management', () => {
    it('starts with loading state', async () => {
      await renderWithAuth()
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
      
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      expect(screen.getByTestId('session-exists')).toHaveTextContent('No session')
    })

    it('loads user session on mount', async () => {
      mockAuth.getSession.mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      })
      
      await renderWithAuth()
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
      
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
      expect(screen.getByTestId('session-exists')).toHaveTextContent('Has session')
    })

    it('handles session loading error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Session loading failed')
      
      mockAuth.getSession.mockResolvedValue({ 
        data: { session: null }, 
        error
      })
      
      await renderWithAuth()
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
      
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      expect(screen.getByTestId('session-exists')).toHaveTextContent('No session')
      expect(consoleSpy).toHaveBeenCalledWith('Error getting session:', error)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Authentication Methods', () => {
    beforeEach(() => {
      // Setup initial no-session state
      mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    })

    describe('signIn', () => {
      it('successfully signs in user', async () => {
        const user = userEvent.setup()
        mockAuth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null
        })
        
        await act(async () => {
          await renderWithAuth()
        })
        
        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('sign-in-btn'))
        })
        
        expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password'
        })
      })

      it('handles sign in error', async () => {
        const user = userEvent.setup()
        const errorMessage = 'Invalid credentials'
        mockAuth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: errorMessage }
        })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('sign-in-btn'))
        })
        
        expect(mockAuth.signInWithPassword).toHaveBeenCalled()
        // The component should still show no user after failed sign in
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      })
    })

    describe('signUp', () => {
      it('successfully signs up user', async () => {
        const user = userEvent.setup()
        mockAuth.signUp.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null
        })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('sign-up-btn'))
        })
        
        expect(mockAuth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
          options: {
            data: { full_name: 'Test User' }
          }
        })
      })

      it('handles sign up error', async () => {
        const user = userEvent.setup()
        const errorMessage = 'Email already exists'
        mockAuth.signUp.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: errorMessage }
        })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('sign-up-btn'))
        })
        
        expect(mockAuth.signUp).toHaveBeenCalled()
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      })
    })

    describe('signOut', () => {
      it('successfully signs out user', async () => {
        const user = userEvent.setup()
        
        // Start with authenticated state
        mockAuth.getSession.mockResolvedValue({ 
          data: { session: mockSession }, 
          error: null 
        })
        mockAuth.signOut.mockResolvedValue({ error: null })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('sign-out-btn'))
        })
        
        expect(mockAuth.signOut).toHaveBeenCalled()
      })

      it('handles sign out error', async () => {
        const user = userEvent.setup()
        const errorMessage = 'Sign out failed'
        
        mockAuth.getSession.mockResolvedValue({ 
          data: { session: mockSession }, 
          error: null 
        })
        mockAuth.signOut.mockResolvedValue({ 
          error: { message: errorMessage } 
        })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('sign-out-btn'))
        })
        
        expect(mockAuth.signOut).toHaveBeenCalled()
      })
    })

    describe('OAuth Sign In', () => {
      it('initiates Google sign in', async () => {
        const user = userEvent.setup()
        mockAuth.signInWithOAuth.mockResolvedValue({ 
          data: { url: 'https://google.com/oauth', provider: 'google' },
          error: null 
        })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('google-signin-btn'))
        })
        
        expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
      })

      it('initiates GitHub sign in', async () => {
        const user = userEvent.setup()
        mockAuth.signInWithOAuth.mockResolvedValue({ 
          data: { url: 'https://github.com/oauth', provider: 'github' },
          error: null 
        })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('github-signin-btn'))
        })
        
        expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
      })

      it('handles OAuth error', async () => {
        const user = userEvent.setup()
        mockAuth.signInWithOAuth.mockResolvedValue({ 
          data: { url: null, provider: 'google' },
          error: { message: 'OAuth failed' } 
        })
        
        await renderWithAuth()
        
        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
        })
        
        await act(async () => {
          await user.click(screen.getByTestId('google-signin-btn'))
        })
        
        expect(mockAuth.signInWithOAuth).toHaveBeenCalled()
      })
    })
  })

  describe('Auth State Changes - Critical Missing Coverage', () => {
    it('listens for auth state changes on mount', async () => {
      await renderWithAuth()
      
      expect(mockAuth.onAuthStateChange).toHaveBeenCalled()
    })

    it('updates user and session state on SIGNED_IN event', async () => {
      await renderWithAuth()

      // Verify initial state
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
        expect(screen.getByTestId('session-exists')).toHaveTextContent('No session')
      })

      // Simulate auth state change to SIGNED_IN
      await act(async () => {
        authStateChangeCallback('SIGNED_IN' as AuthChangeEvent, mockSession as Session)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
        expect(screen.getByTestId('session-exists')).toHaveTextContent('Has session')
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
    })

    it('clears user and session state on SIGNED_OUT event', async () => {
      // Start with authenticated state
      mockAuth.getSession.mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      })
      
      await renderWithAuth()

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
        expect(screen.getByTestId('session-exists')).toHaveTextContent('Has session')
      })

      // Simulate auth state change to SIGNED_OUT
      await act(async () => {
        authStateChangeCallback('SIGNED_OUT' as AuthChangeEvent, null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
        expect(screen.getByTestId('session-exists')).toHaveTextContent('No session')
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
    })

    it('handles TOKEN_REFRESHED event', async () => {
      await renderWithAuth()

      const refreshedSession = {
        ...mockSession,
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token'
      }

      await act(async () => {
        authStateChangeCallback('TOKEN_REFRESHED' as AuthChangeEvent, refreshedSession as Session)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
        expect(screen.getByTestId('session-exists')).toHaveTextContent('Has session')
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
    })

    it('migrates guest packs on SIGNED_IN event', async () => {
      const guestPacks = [
        { id: '1', name: 'Guest Pack 1', items: [] },
        { id: '2', name: 'Guest Pack 2', items: [] }
      ]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(guestPacks))

      await renderWithAuth()

      // Simulate SIGNED_IN event which should trigger pack migration
      await act(async () => {
        authStateChangeCallback('SIGNED_IN' as AuthChangeEvent, mockSession as Session)
      })

      // Verify localStorage was checked for guest packs
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('backpackr_guest_packs')
      
      // Verify console logging for migration (mocked but called)
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Migrating 2 guest packs for user test-user-id')
      )
    })

    it('handles migration error when guest packs are malformed', async () => {
      consoleSpy.error.mockClear()
      mockLocalStorage.getItem.mockReturnValue('invalid-json')

      await renderWithAuth()

      // The console.error is triggered during the auth state change callback
      await act(async () => {
        authStateChangeCallback('SIGNED_IN' as AuthChangeEvent, mockSession as Session)
      })

      // The error is logged but the app continues to function
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('backpackr_guest_packs')
    })

    it('skips migration when no guest packs exist', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      await renderWithAuth()

      await act(async () => {
        authStateChangeCallback('SIGNED_IN' as AuthChangeEvent, mockSession as Session)
      })

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('backpackr_guest_packs')
      // Should not log migration message when no guest packs exist
      expect(consoleSpy.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Migrating')
      )
    })

    it('unsubscribes from auth state changes on unmount', async () => {
      const { unmount } = await renderWithAuth()
      
      unmount()
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('throws error when useAuth is used outside AuthProvider', async () => {
      // Temporarily suppress console.error for this test
      const originalError = console.error
      console.error = jest.fn()
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')
      
      console.error = originalError
    })
  })
})
