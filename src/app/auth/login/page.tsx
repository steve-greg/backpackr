import { LoginForm } from '@/components/auth/LoginForm'
import { MainLayout } from '@/components'

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <LoginForm redirectTo="/" />
      </div>
    </MainLayout>
  )
}