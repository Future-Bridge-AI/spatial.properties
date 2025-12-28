import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Solutions — Utilities, Government, Apps & Agents',
  description:
    'See how Spatial.Properties serves utilities, government agencies, incident response teams, and developers building apps and agents.',
}

export default function SolutionsPage() {
  return (
    <Section background="grid" size="large">
      <div className="max-w-3xl mx-auto text-center">
        <span className="eyebrow">Solutions</span>
        <h1 className="text-h1 font-serif mt-4">
          Built for teams who operate in the real world.
        </h1>
        <p className="mt-6 text-body text-slate max-w-2xl mx-auto">
          Full solutions page coming soon. In the meantime, explore the homepage
          or book a demo to discuss your specific use case.
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
