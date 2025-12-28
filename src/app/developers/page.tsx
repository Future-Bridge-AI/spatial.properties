import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Developers — Build with Spatial Packs',
  description:
    'Use Spatial.Properties to fetch versioned Spatial Packs, deliver tiles via CDN, query GeoParquet, and run deterministic geospatial tools.',
}

export default function DevelopersPage() {
  return (
    <Section background="grid" size="large">
      <div className="max-w-3xl mx-auto text-center">
        <span className="eyebrow">Developers</span>
        <h1 className="text-h1 font-serif mt-4">
          Stop rebuilding the same layers. Ship spatial context as a versioned
          pack.
        </h1>
        <p className="mt-6 text-body text-slate max-w-2xl mx-auto">
          Full developer documentation coming soon. In the meantime, see the
          demo or book a developer walkthrough.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/demo">View demo</Button>
          <Button href="/contact" variant="secondary">
            Book a walkthrough
          </Button>
        </div>
      </div>
    </Section>
  )
}
