import { D1Adapter } from '@auth/d1-adapter'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: D1Adapter(getCloudflareContext().env.DB),
  providers: [Google],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'database',
  },
  trustHost: true,
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
}))
