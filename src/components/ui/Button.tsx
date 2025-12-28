import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ButtonProps {
  children: React.ReactNode
  /** Render as link when href is provided */
  href?: string
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Button size */
  size?: 'default' | 'sm' | 'lg'
  /** Additional classes */
  className?: string
  /** Click handler for button */
  onClick?: () => void
  /** Disabled state */
  disabled?: boolean
  /** Button type (when not a link) */
  type?: 'button' | 'submit'
  /** Open link in new tab */
  external?: boolean
}

/**
 * Primary button component.
 * Renders as <a> when href is provided, otherwise <button>.
 */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'default',
  className,
  onClick,
  disabled = false,
  type = 'button',
  external = false,
}: ButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2',
    'font-sans font-medium',
    'rounded transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2'
  )

  const variantStyles = {
    primary: cn(
      'bg-ocean text-white shadow-button',
      'hover:bg-ocean-dark hover:shadow-button-hover hover:-translate-y-px',
      'active:translate-y-0 active:shadow-button',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
    ),
    secondary: cn(
      'bg-transparent text-ink border-2 border-ink',
      'hover:bg-cloud',
      'active:bg-grid',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    ghost: cn(
      'bg-transparent text-ocean p-0',
      'hover:text-ocean-dark',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
  }

  const sizeStyles = {
    default: 'px-6 py-3 text-body',
    sm: 'px-4 py-2 text-small',
    lg: 'px-8 py-4 text-body',
  }

  const classes = cn(
    baseStyles,
    variantStyles[variant],
    variant !== 'ghost' && sizeStyles[size],
    className
  )

  // Render as link when href is provided
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
          {variant === 'ghost' && <span className="ml-1">→</span>}
        </a>
      )
    }

    return (
      <Link href={href} className={classes}>
        {children}
        {variant === 'ghost' && <span className="ml-1">→</span>}
      </Link>
    )
  }

  // Render as button
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {variant === 'ghost' && <span className="ml-1">→</span>}
    </button>
  )
}
