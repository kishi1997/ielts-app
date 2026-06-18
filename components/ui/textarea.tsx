import type { TextareaHTMLAttributes } from 'react'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        'flex min-h-32 w-full rounded-md border border-input bg-surface-2 px-3 py-2 text-sm leading-relaxed text-fg shadow-sm outline-none transition-colors placeholder:text-fg-faint focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    />
  )
}
