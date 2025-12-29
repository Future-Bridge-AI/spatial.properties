import {
  Hero,
  Problem,
  WhatItIs,
  PackCatalog,
  WhatsInAPack,
  HowItWorks,
  Differentiators,
  Trust,
  ClosingCTA,
} from '@/components/home'

/**
 * Homepage - the main entry point for Spatial.Properties marketing site.
 *
 * Section order follows buyer journey:
 * 1. Hero - Outcome-led: what you get (curated packs for site selection)
 * 2. Problem - Why it matters (site decisions break without trust)
 * 3. WhatItIs - Subscription catalog model explained
 * 4. PackCatalog - Show specific packs for WA greenfield development
 * 5. WhatsInAPack - What's inside (layers + defensibility)
 * 6. HowItWorks - Pipeline (brief, humanized)
 * 7. Differentiators - Hard edges (kept below fold)
 * 8. Trust - SLOs (proof, not lead story)
 * 9. CTA - Book a pilot
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <WhatItIs />
      <PackCatalog />
      <WhatsInAPack />
      <HowItWorks />
      <Differentiators />
      <Trust />
      <ClosingCTA />
    </>
  )
}
