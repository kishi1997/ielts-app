export default function DashboardLoading() {
  return (
    <main className="min-h-dvh px-4 py-7 sm:px-6 sm:py-10 lg:ml-[268px]">
      <div className="mx-auto max-w-6xl">
        <div className="game-card min-h-[330px] animate-pulse p-6 sm:p-10">
          <p className="label-text text-answer">Loading quest home</p>
          <div className="mt-8 h-12 max-w-xl rounded-lg bg-white/10" />
          <div className="mt-4 h-4 max-w-lg rounded-full bg-white/8" />
          <div className="mt-8 h-13 w-48 rounded-lg bg-answer/40" />
        </div>
      </div>
    </main>
  )
}
