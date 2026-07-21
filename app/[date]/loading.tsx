export default function ExerciseLoading() {
  return (
    <main className="min-h-dvh px-4 py-7 sm:px-6 sm:py-10 lg:ml-[268px]">
      <div className="mx-auto max-w-3xl">
        <section className="game-card p-5">
          <p className="label-text text-answer">Loading writing quest</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-answer/60" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-16 rounded-lg bg-white/8" />
            <div className="h-16 rounded-lg bg-white/8" />
            <div className="h-16 rounded-lg bg-white/8" />
          </div>
        </section>
      </div>
    </main>
  )
}
