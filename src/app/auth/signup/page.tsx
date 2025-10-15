import { SignupForm } from '@/components/auth/SignupForm'
import { MainLayout } from '@/components'

export default function SignupPage() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <SignupForm redirectTo="/" />
      </div>
    </MainLayout>
  )
}