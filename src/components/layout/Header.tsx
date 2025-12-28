'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { href: '/product', label: 'Product' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/developers', label: 'Developers' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/demo', label: 'Demo' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-grid">
      <nav className="container-wide flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl md:text-2xl text-ink hover:text-ink transition-none"
        >
          Spatial.Properties
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-small font-medium text-slate hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button href="/contact" size="sm">
            Book a demo
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          'fixed inset-0 top-16 bg-white z-40 md:hidden transition-opacity duration-200',
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        <nav className="container-wide py-6">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-lg font-medium text-ink py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-4 border-t border-grid">
              <Button href="/contact" className="w-full">
                Book a demo
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
