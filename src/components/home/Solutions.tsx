import { Section, SectionHeader } from '@/components/layout/Section'
import { FeatureCard } from '@/components/ui/Card'

const solutions = [
  {
    stripe: 'eucalypt' as const,
    title: 'Utilities & resources',
    description:
      'Operational layers teams can trust: assets, access constraints, vegetation and risk overlays, field-ready basemaps.',
    href: '/solutions#utilities',
  },
  {
    stripe: 'ocean' as const,
    title: 'Government & agencies',
    description:
      'Publish authoritative datasets with clear provenance, licensing constraints, and consistent multi-tenant access.',
    href: '/solutions#government',
  },
  {
    stripe: 'ochre' as const,
    title: 'Incident response',
    description:
      'Make "current context" available fast—plus offline-capable packs when connectivity is degraded.',
    href: '/solutions#response',
  },
  {
    stripe: 'stone' as const,
    title: 'Apps, analytics & agents',
    description:
      'Deliver deterministic spatial context to apps and agents that need to explain what they used—and why.',
    href: '/solutions#developers',
  },
]

/**
 * Solutions preview section - routes visitors to relevant use cases.
 */
export function Solutions() {
  return (
    <Section background="muted">
      <SectionHeader
        eyebrow="Solutions"
        title="Built for teams who operate in the real world."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {solutions.map((solution) => (
          <FeatureCard
            key={solution.title}
            title={solution.title}
            description={solution.description}
            stripe={solution.stripe}
            href={solution.href}
          />
        ))}
      </div>
    </Section>
  )
}
