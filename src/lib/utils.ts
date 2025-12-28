import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines clsx and tailwind-merge for conditional class handling.
 * Use this instead of raw template literals when combining Tailwind classes.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-ocean', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
