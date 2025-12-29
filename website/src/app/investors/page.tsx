import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Investors',
  description:
    'Spatial.Properties is building the infrastructure layer for governed, versioned spatial context—served globally via CDN for apps, analytics, and agents.',
}

export default function InvestorsPage() {
  return (
    <Section background="grid" size="large">
      <div className="max-w-3xl mx-auto text-center">
        <span className="eyebrow">Investors</span>
        <h1 className="text-h1 font-serif mt-4">
          Spatial context is becoming infrastructure. We're building the
          delivery layer.
        </h1>
        <p className="mt-6 text-body text-slate max-w-2xl mx-auto">
          Spatial.Properties is a pack-first, cloud-native platform that turns
          geospatial context into versioned, governed products—served through an
          edge-optimised CDN. Investor brief available on request.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="mailto:investors@spatial.properties">
            Request investor brief
          </Button>
          <Button href="/contact" variant="secondary">
            Book an investor call
          </Button>
        </div>
      </div>
    </Section>
  )
}
