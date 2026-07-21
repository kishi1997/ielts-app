import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAuthBypassEnabled } from '@/lib/current-user'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  if (isAuthBypassEnabled()) redirect('/dashboard')

  const session = await auth()
  redirect(session?.user ? '/dashboard' : '/login')
}
