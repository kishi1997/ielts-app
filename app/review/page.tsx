import AppHeader from '@/components/AppHeader'
import NightieCoach from '@/components/NightieCoach'
import ReviewList from '@/components/ReviewList'
import { getCurrentUserOrRedirect } from '@/lib/current-user'
import { getActiveMissedProblems } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const user = await getCurrentUserOrRedirect()

  const problems = await getActiveMissedProblems(user.id)

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader active="review" userName={user.name} />
      <main className="lg:ml-[268px]">
        <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
          <div className="mb-7 grid items-center gap-5 md:grid-cols-[1fr_340px]">
            <div>
              <p className="label-text text-error">Review box</p>
              <h1 className="mt-2 text-3xl font-black text-fg sm:text-4xl">Review Box</h1>
              <p className="mt-3 text-sm leading-7 text-fg-soft">Read the notes, say it your way, then let the card go</p>
            </div>
            <NightieCoach compact mood="study" message={problems.length ? `${problems.length} cards waiting. One by one` : 'All clear. Time to find the next phrase'} />
          </div>
          <ReviewList initialProblems={problems} />
        </div>
      </main>
    </div>
  )
}
