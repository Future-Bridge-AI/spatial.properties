import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Product — Spatial Packs, CDN, Governance & Tools',
  description:
    'Learn how Spatial.Properties works: Spatial Packs as the source of record, edge delivery via CDN, governance gates, and deterministic tools.',
}

export default function ProductPage() {
  return (
    <Section background="grid" size="large">
      <div className="max-w-3xl mx-auto text-center">
        <span className="eyebrow">Product</span>
        <h1 className="text-h1 font-serif mt-4">
          A geospatial platform built around publishable artifacts.
        </h1>
        <p className="mt-6 text-body text-slate max-w-2xl mx-auto">
          Full product page coming soon. In the meantime, explore the homepage
          or book a demo to learn more.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/">Back to home</Button>
          <Button href="/contact" variant="secondary">
            Book a demo
          </Button>
        </div>
      </div>
    </Section>
  )
}
