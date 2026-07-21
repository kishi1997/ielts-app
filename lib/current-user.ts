import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ensureUser } from '@/lib/db'

export interface CurrentUser {
  id: string
  name: string | null
  email?: string | null
}

export function isAuthBypassEnabled(): boolean {
  return process.env.AUTH_BYPASS === 'true'
}

export function getPreviewUser(): CurrentUser {
  return {
    id: 'preview-user',
    name: 'Preview Learner',
    email: 'preview@example.local',
  }
}

export async function getCurrentUserOrRedirect(): Promise<CurrentUser> {
  if (isAuthBypassEnabled()) {
    return getPreviewUser()
  }

  const session = await auth()
  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    }
  }

  redirect('/login')
}

export async function ensurePreviewUserIfNeeded(user: CurrentUser): Promise<void> {
  if (!isAuthBypassEnabled()) return
  await ensureUser({
    id: user.id,
    name: user.name ?? 'Preview Learner',
    email: user.email ?? 'preview@example.local',
  })
}
