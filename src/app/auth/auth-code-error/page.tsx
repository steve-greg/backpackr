import Link from 'next/link'
import { MainLayout, Button } from '@/components'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-6">
              Sorry, we couldn&apos;t complete your authentication. This might be due to an expired or invalid authorization code.
            </p>
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full">
                  Try Signing In Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}