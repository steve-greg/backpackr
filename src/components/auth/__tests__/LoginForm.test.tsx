import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
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



// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
}

const mockUser = {
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

const renderLoginForm = (props = {}) => {
  return render(
    <AuthProvider>
      <LoginForm {...props} />
    </AuthProvider>
  )
}

describe('LoginForm', () => {
  let mockSubscription: { unsubscribe: jest.Mock }

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockAuth).forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset()
      }
    })

    // Clear console spy mocks
    consoleSpy.log.mockClear()
    consoleSpy.error.mockClear()



    // Default auth state change mock
    mockSubscription = { unsubscribe: jest.fn() }
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription }
    })

    // Default session mock
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
  })

  describe('Rendering', () => {
    it('renders login form elements correctly', () => {
      renderLoginForm()

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your Backpackr account')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
    })

    it('renders signup link', () => {
      renderLoginForm()

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toBeInTheDocument()
      expect(signupLink).toHaveAttribute('href', '/auth/signup')
    })

    it('renders password visibility toggle', () => {
      renderLoginForm()

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('type', 'password')

      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('updates email input value', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('updates password input value', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const passwordInput = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('disables form inputs when loading', async () => {
      const user = userEvent.setup()
      mockAuth.signInWithPassword.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toBeDisabled()
        expect(passwordInput).toBeDisabled()
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })

      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })

      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('shows error when both fields are empty', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })

      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('successfully submits login form', async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      renderLoginForm({ onSuccess })

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      expect(onSuccess).toHaveBeenCalled()
      expect(consoleSpy.log).toHaveBeenCalledWith('Sign in successful:', mockUser.email)
    })

    it('handles login error from auth service', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid credentials'
      
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage }
      })

      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      expect(mockAuth.signInWithPassword).toHaveBeenCalled()
    })

    it('handles unexpected errors during login', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      })

      expect(consoleSpy.error).toHaveBeenCalledWith('Sign in error:', expect.any(Error))
    })

    it('calls onSuccess callback after successful login', async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      renderLoginForm({ onSuccess })

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })


  })

  describe('OAuth Sign In', () => {
    it('handles Google sign in', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://google.com/oauth' },
        error: null
      })

      renderLoginForm()

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback')
          }
        })
      })
    })

    it('handles GitHub sign in', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://github.com/oauth' },
        error: null
      })

      renderLoginForm()

      const githubButton = screen.getByRole('button', { name: /github/i })
      await user.click(githubButton)

      await waitFor(() => {
        expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'github',
          options: {
            redirectTo: expect.stringContaining('/auth/callback')
          }
        })
      })
    })

    it('handles Google OAuth error', async () => {
      const user = userEvent.setup()
      const errorMessage = 'OAuth failed'
      
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: null },
        error: { message: errorMessage }
      })

      renderLoginForm()

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('handles GitHub OAuth error', async () => {
      const user = userEvent.setup()
      const errorMessage = 'OAuth failed'
      
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: null },
        error: { message: errorMessage }
      })

      renderLoginForm()

      const githubButton = screen.getByRole('button', { name: /github/i })
      await user.click(githubButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('handles OAuth network errors', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithOAuth.mockRejectedValue(new Error('Network error'))

      renderLoginForm()

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to sign in with Google')).toBeInTheDocument()
      })

      expect(consoleSpy.error).toHaveBeenCalledWith('Google sign in error:', expect.any(Error))
    })

    it('handles GitHub network errors specifically', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithOAuth.mockRejectedValue(new Error('GitHub API error'))

      renderLoginForm()

      const githubButton = screen.getByRole('button', { name: /github/i })
      await user.click(githubButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to sign in with GitHub')).toBeInTheDocument()
      })

      expect(consoleSpy.error).toHaveBeenCalledWith('GitHub sign in error:', expect.any(Error))
    })
  })

  describe('Loading States', () => {
    it('shows loading state during form submission', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithPassword.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Signing In...')
        expect(submitButton).toBeDisabled()
      })
    })

    it('shows loading state during OAuth sign in', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithOAuth.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderLoginForm()

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(googleButton).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('clears error when starting new form submission', async () => {
      const user = userEvent.setup()
      
      // First submission with error
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      })

      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Second submission should clear the error
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await user.clear(passwordInput)
      await user.type(passwordInput, 'correctpassword')
      await user.click(submitButton)

      // Error should be cleared during loading
      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
      })
    })

    it('clears error when starting OAuth sign in', async () => {
      const user = userEvent.setup()
      
      // First show an error from regular sign in
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      })

      renderLoginForm()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // OAuth sign in should clear the error
      mockAuth.signInWithOAuth.mockImplementation(() => new Promise(() => {})) // Never resolves

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
      })
    })
  })
})
