import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  /** Section ID for anchor links */
  id?: string
  /** Background variant */
  background?: 'default' | 'muted' | 'dark' | 'grid'
  /** Padding size */
  size?: 'default' | 'large'
  /** Container width */
  container?: 'narrow' | 'wide'
}

/**
 * Consistent section wrapper for page content.
 * Handles background, padding, and container width.
 */
export function Section({
  children,
  className,
  id,
  background = 'default',
  size = 'default',
  container = 'wide',
}: SectionProps) {
  const backgroundStyles = {
    default: 'bg-white',
    muted: 'bg-cloud',
    dark: 'bg-ink text-white',
    grid: 'bg-cloud grid-texture',
  }

  const sizeStyles = {
    default: 'py-16 md:py-24',
    large: 'py-20 md:py-32',
  }

  const containerStyles = {
    narrow: 'max-w-4xl mx-auto px-4 md:px-6',
    wide: 'max-w-7xl mx-auto px-4 md:px-6',
  }

  return (
    <section
      id={id}
      className={cn(backgroundStyles[background], sizeStyles[size], className)}
    >
      <div className={containerStyles[container]}>{children}</div>
    </section>
  )
}

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  /** Alignment */
  align?: 'left' | 'center'
  className?: string
}

/**
 * Section header with optional eyebrow, title, and description.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' && 'text-center',
        className
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="text-h2 font-serif">{title}</h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-body text-slate max-w-readable',
            align === 'center' && 'mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
