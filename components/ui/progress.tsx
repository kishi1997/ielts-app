import type { HTMLAttributes } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const boundedValue = Math.max(0, Math.min(100, value))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={boundedValue}
      className={cx('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-answer transition-all"
        style={{ width: `${boundedValue}%` }}
      />
    </div>
  )
}
