import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Pricing that matches how you ship spatial context. Storage + delivery + governance. Start small, scale predictably.',
}

export default function PricingPage() {
  return (
    <Section background="grid" size="large">
      <div className="max-w-3xl mx-auto text-center">
        <span className="eyebrow">Pricing</span>
        <h1 className="text-h1 font-serif mt-4">
          Pricing that matches how you ship spatial context.
        </h1>
        <p className="mt-6 text-body text-slate max-w-2xl mx-auto">
          Storage + delivery + governance. Start small, scale predictably, and
          pay for what you actually serve. Detailed pricing coming soon.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/contact">Talk to sales</Button>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </div>
    </Section>
  )
}
