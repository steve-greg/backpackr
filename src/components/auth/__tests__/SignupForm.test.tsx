import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '../SignupForm'
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
      signUp: jest.fn(),
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

const renderSignupForm = (props = {}) => {
  return render(
    <AuthProvider>
      <SignupForm {...props} />
    </AuthProvider>
  )
}

describe('SignupForm', () => {
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
    it('renders signup form elements correctly', () => {
      renderSignupForm()

      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
      expect(screen.getByText('Start planning your adventures with Backpackr')).toBeInTheDocument()
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
    })

    it('renders login link', () => {
      renderSignupForm()

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
      const loginLink = screen.getByRole('link', { name: /sign in/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })

    it('renders password visibility toggles', () => {
      renderSignupForm()

      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')

      // Should have 2 eye icon buttons for password toggles
      const toggleButtons = screen.getAllByRole('button', { name: '' })
      const eyeButtons = toggleButtons.filter(button => 
        button.querySelector('svg')?.classList.contains('lucide-eye') ||
        button.querySelector('svg')?.classList.contains('lucide-eye-off')
      )
      expect(eyeButtons).toHaveLength(2)
    })
  })

  describe('Form Interactions', () => {
    it('updates form field values', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      expect(fullNameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(passwordInput).toHaveValue('password123')
      expect(confirmPasswordInput).toHaveValue('password123')
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const toggleButtons = screen.getAllByRole('button', { name: '' })

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')

      // Click first toggle (password field)
      await user.click(toggleButtons[0])
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Click second toggle (confirm password field)
      await user.click(toggleButtons[1])
      expect(confirmPasswordInput).toHaveAttribute('type', 'text')

      // Click again to hide
      await user.click(toggleButtons[0])
      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButtons[1])
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })

    it('disables form inputs when loading', async () => {
      const user = userEvent.setup()
      mockAuth.signUp.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      await user.click(submitButton)

      await waitFor(() => {
        expect(fullNameInput).toBeDisabled()
        expect(emailInput).toBeDisabled()
        expect(passwordInput).toBeDisabled()
        expect(confirmPasswordInput).toBeDisabled()
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Form Validation', () => {
    it('shows error when full name is empty', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter your full name')).toBeInTheDocument()
      })

      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })

    it('shows error when full name is only whitespace', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, '   ')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter your full name')).toBeInTheDocument()
      })

      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })

    it('shows error when email is empty', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter your email address')).toBeInTheDocument()
      })

      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })

    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a password')).toBeInTheDocument()
      })

      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })

    it('shows error when password is too short', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, '12345')
      await user.type(confirmPasswordInput, '12345')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
      })

      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'different456')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })

      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('successfully submits signup form with confirmed user', async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      
      const confirmedUser = {
        ...mockUser,
        email_confirmed_at: new Date().toISOString()
      }

      mockAuth.signUp.mockResolvedValue({
        data: { user: confirmedUser },
        error: null
      })

      renderSignupForm({ onSuccess })

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAuth.signUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          options: {
            data: { full_name: 'John Doe' }
          }
        })
      })

      expect(onSuccess).toHaveBeenCalled()
      expect(consoleSpy.log).toHaveBeenCalledWith('Sign up successful:', confirmedUser.email)
    })

    it('successfully submits signup form with unconfirmed user', async () => {
      const user = userEvent.setup()
      
      const unconfirmedUser = {
        ...mockUser,
        email_confirmed_at: null
      }

      mockAuth.signUp.mockResolvedValue({
        data: { user: unconfirmedUser },
        error: null
      })

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })

      expect(consoleSpy.log).toHaveBeenCalledWith('Sign up successful:', unconfirmedUser.email)
    })

    it('handles signup error from auth service', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Email already registered'
      
      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage }
      })

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      expect(mockAuth.signUp).toHaveBeenCalled()
    })

    it('handles unexpected errors during signup', async () => {
      const user = userEvent.setup()
      
      mockAuth.signUp.mockRejectedValue(new Error('Network error'))

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      })

      expect(consoleSpy.error).toHaveBeenCalledWith('Sign up error:', expect.any(Error))
    })

    it('calls onSuccess callback after successful signup when user is confirmed', async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      
      const confirmedUser = {
        ...mockUser,
        email_confirmed_at: new Date().toISOString()
      }

      mockAuth.signUp.mockResolvedValue({
        data: { user: confirmedUser },
        error: null
      })

      renderSignupForm({ onSuccess })

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('trims whitespace from full name', async () => {
      const user = userEvent.setup()
      
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, '  John Doe  ')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAuth.signUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          options: {
            data: { full_name: 'John Doe' }
          }
        })
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

      renderSignupForm()

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

      renderSignupForm()

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

    it('handles OAuth errors', async () => {
      const user = userEvent.setup()
      const errorMessage = 'OAuth failed'
      
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: null },
        error: { message: errorMessage }
      })

      renderSignupForm()

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('handles OAuth network errors', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithOAuth.mockRejectedValue(new Error('Network error'))

      renderSignupForm()

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to sign up with Google')).toBeInTheDocument()
      })

      expect(consoleSpy.error).toHaveBeenCalledWith('Google sign up error:', expect.any(Error))
    })
  })

  describe('Loading States', () => {
    it('shows loading state during form submission', async () => {
      const user = userEvent.setup()
      
      mockAuth.signUp.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Creating Account...')
        expect(submitButton).toBeDisabled()
      })
    })

    it('shows loading state during OAuth sign in', async () => {
      const user = userEvent.setup()
      
      mockAuth.signInWithOAuth.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderSignupForm()

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
      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email already registered' }
      })

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument()
      })

      // Second submission should clear the error
      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await user.clear(emailInput)
      await user.type(emailInput, 'different@example.com')
      await user.click(submitButton)

      // Error should be cleared during loading
      await waitFor(() => {
        expect(screen.queryByText('Email already registered')).not.toBeInTheDocument()
      })
    })

    it('clears error when starting OAuth sign in', async () => {
      const user = userEvent.setup()
      
      // First show an error from regular sign up
      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' }
      })

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument()
      })

      // OAuth sign in should clear the error
      mockAuth.signInWithOAuth.mockImplementation(() => new Promise(() => {})) // Never resolves

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.queryByText('Email already registered')).not.toBeInTheDocument()
      })
    })
  })

  describe('Success States', () => {
    it('shows success message for unconfirmed users', async () => {
      const user = userEvent.setup()
      
      const unconfirmedUser = {
        ...mockUser,
        email_confirmed_at: null
      }

      mockAuth.signUp.mockResolvedValue({
        data: { user: unconfirmedUser },
        error: null
      })

      renderSignupForm()

      const fullNameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(fullNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
        expect(screen.getByText(/click the link in the email to verify/i)).toBeInTheDocument()
      })

      // Form should be hidden after success
      expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument()
    })
  })
})
