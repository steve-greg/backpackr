import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { UserEvent } from '@testing-library/user-event'

// Mock user data for tests
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z'
} as User

// Mock session data
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer' as const,
  user: mockUser
} as Session

// Mock auth error
export const mockAuthError = {
  message: 'Test error',
  status: 400
} as AuthError

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialAuthState?: {
    user?: User | null
    session?: Session | null
    loading?: boolean
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { ...renderOptions } = options

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Test helper functions
export const waitForAuthLoad = async () => {
  // Helper to wait for auth context to finish loading
  await new Promise(resolve => setTimeout(resolve, 100))
}

export const mockSupabaseAuth = {
  getUser: jest.fn(),
  getSession: jest.fn(),
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signInWithOAuth: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } }
  })),
}

// Reset all mocks before each test
export const resetAuthMocks = () => {
  Object.values(mockSupabaseAuth).forEach(mock => {
    if (typeof mock === 'function' && mock.mockReset) {
      mock.mockReset()
    }
  })
}

// Common test assertions
export const expectButtonToBeDisabled = (button: HTMLElement) => {
  expect(button).toBeDisabled()
  expect(button).toHaveClass('opacity-50')
}

export const expectButtonToBeEnabled = (button: HTMLElement) => {
  expect(button).not.toBeDisabled()
  expect(button).not.toHaveClass('opacity-50')
}

// Form validation helpers
export const fillForm = async (user: UserEvent, formData: Record<string, string>) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = document.querySelector(`input[name="${field}"]`) as HTMLInputElement
    if (input) {
      await user.clear(input)
      await user.type(input, value)
    }
  }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'