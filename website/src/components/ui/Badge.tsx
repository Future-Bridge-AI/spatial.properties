import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  /** Badge variant */
  variant?: 'default' | 'eucalypt' | 'ocean' | 'ochre' | 'outline'
  /** Size */
  size?: 'default' | 'sm'
  className?: string
}

/**
 * Small badge/chip component for labels, tags, and status indicators.
 */
export function Badge({
  children,
  variant = 'default',
  size = 'default',
  className,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-cloud text-slate',
    eucalypt: 'bg-eucalypt-light text-eucalypt',
    ocean: 'bg-ocean-light text-ocean',
    ochre: 'bg-ochre-light text-ochre',
    outline: 'bg-transparent border border-grid text-slate',
  }

  const sizeStyles = {
    default: 'px-2.5 py-1 text-small',
    sm: 'px-2 py-0.5 text-caption',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * Proof chip - small inline badge with checkmark for trust signals.
 * Used in hero sections to show key value props.
 */
interface ProofChipProps {
  children: React.ReactNode
  className?: string
}

export function ProofChip({ children, className }: ProofChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-small text-stone',
        className
      )}
    >
      <span className="text-eucalypt font-bold">✓</span>
      {children}
    </span>
  )
}

/**
 * Format badge - shows data format types (GeoParquet, PMTiles, etc.)
 */
interface FormatBadgeProps {
  format: 'geoparquet' | 'pmtiles' | 'cog' | 'copc' | 'stac'
  className?: string
}

const formatLabels = {
  geoparquet: 'GeoParquet',
  pmtiles: 'PMTiles',
  cog: 'COG',
  copc: 'COPC',
  stac: 'STAC',
}

export function FormatBadge({ format, className }: FormatBadgeProps) {
  return (
    <Badge variant="outline" size="sm" className={cn('font-mono', className)}>
      {formatLabels[format]}
    </Badge>
  )
}
