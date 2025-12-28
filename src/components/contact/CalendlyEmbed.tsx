'use client'

import { useEffect } from 'react'

/**
 * Calendly inline widget embed.
 *
 * Replace CALENDLY_URL with your actual Calendly scheduling link.
 * Example: https://calendly.com/spatial-properties/demo
 */

// TODO: Replace with your actual Calendly URL
const CALENDLY_URL = 'https://calendly.com/your-calendly-url/30min'

export function CalendlyEmbed() {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="rounded-xl overflow-hidden border border-grid bg-white">
      {/* Calendly inline widget */}
      <div
        className="calendly-inline-widget"
        data-url={CALENDLY_URL}
        style={{ minWidth: '320px', height: '700px' }}
      />

      {/* Fallback for when Calendly doesn't load */}
      <noscript>
        <div className="p-8 text-center">
          <p className="text-body text-slate mb-4">
            JavaScript is required to load the booking calendar.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ocean hover:text-ocean-dark font-medium"
          >
            Book directly on Calendly →
          </a>
        </div>
      </noscript>
    </div>
  )
}

/**
 * Alternative: Calendly popup button component.
 * Use this if you prefer a button that opens Calendly in a popup.
 */
export function CalendlyPopupButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const openCalendly = () => {
    // @ts-ignore - Calendly is loaded via script
    if (typeof window !== 'undefined' && window.Calendly) {
      // @ts-ignore
      window.Calendly.initPopupWidget({ url: CALENDLY_URL })
    }
  }

  return (
    <button
      type="button"
      onClick={openCalendly}
      className={className}
    >
      {children}
    </button>
  )
}
