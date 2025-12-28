import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  /** Card variant - determines background colour */
  variant?: 'default' | 'eucalypt' | 'ocean' | 'ochre' | 'outline'
  /** Enable hover lift effect */
  hoverable?: boolean
  /** Additional classes */
  className?: string
  /** Make card a link */
  href?: string
}

/**
 * Card container component with colour variants.
 * Use variant prop to apply coloured backgrounds that align with design system.
 */
export function Card({
  children,
  variant = 'default',
  hoverable = false,
  className,
  href,
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-grid shadow-card',
    eucalypt: 'bg-eucalypt-light border-0',
    ocean: 'bg-ocean-light border-0',
    ochre: 'bg-ochre-light border-0',
    outline: 'bg-transparent border border-grid',
  }

  const classes = cn(
    'rounded-lg p-6',
    variantStyles[variant],
    hoverable && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
    href && 'cursor-pointer',
    className
  )

  if (href) {
    return (
      <Link href={href} className={cn(classes, 'block')}>
        {children}
      </Link>
    )
  }

  return <div className={classes}>{children}</div>
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

interface CardTitleProps {
  children: React.ReactNode
  as?: 'h2' | 'h3' | 'h4'
  className?: string
}

export function CardTitle({
  children,
  as: Tag = 'h3',
  className,
}: CardTitleProps) {
  return <Tag className={cn('text-h4 font-serif', className)}>{children}</Tag>
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <p className={cn('text-body text-slate', className)}>{children}</p>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn('mt-4 pt-4 border-t border-grid', className)}>{children}</div>
}

/**
 * Feature card with coloured top stripe.
 * Use for solution cards and feature highlights.
 */
interface FeatureCardProps {
  title: string
  description: string
  href?: string
  /** Stripe colour */
  stripe?: 'eucalypt' | 'ocean' | 'ochre' | 'stone'
  className?: string
}

export function FeatureCard({
  title,
  description,
  href,
  stripe = 'ocean',
  className,
}: FeatureCardProps) {
  const stripeStyles = {
    eucalypt: 'bg-eucalypt',
    ocean: 'bg-ocean',
    ochre: 'bg-ochre',
    stone: 'bg-stone',
  }

  const content = (
    <>
      <div className={cn('h-1 rounded-t-lg -mx-6 -mt-6 mb-6', stripeStyles[stripe])} />
      <h3 className="text-h4 font-serif mb-2">{title}</h3>
      <p className="text-body text-slate">{description}</p>
      {href && (
        <span className="inline-flex items-center mt-4 text-ocean text-small font-medium">
          Learn more <span className="ml-1">→</span>
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'block bg-white border border-grid rounded-lg p-6',
          'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
          className
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn('bg-white border border-grid rounded-lg p-6', className)}>
      {content}
    </div>
  )
}

/**
 * Quote card for displaying user pain points or testimonials.
 */
interface QuoteCardProps {
  quote: string
  className?: string
}

export function QuoteCard({ quote, className }: QuoteCardProps) {
  return (
    <blockquote
      className={cn(
        'border-l-4 border-grid pl-4 py-2 text-body italic text-slate',
        className
      )}
    >
      "{quote}"
    </blockquote>
  )
}
