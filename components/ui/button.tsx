import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const variants: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-sm hover:bg-answer/90',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-surface-2/80',
  outline:
    'border border-input bg-surface text-fg hover:bg-surface-2 hover:text-fg',
  ghost:
    'text-fg-soft hover:bg-surface-2 hover:text-fg',
}

const sizes: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-11 rounded-md px-6',
  icon: 'h-10 w-10',
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
