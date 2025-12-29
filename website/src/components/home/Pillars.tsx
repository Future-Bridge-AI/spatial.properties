import { Section, SectionHeader } from '@/components/layout/Section'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'

const pillars = [
  {
    variant: 'eucalypt' as const,
    title: 'Pack-first source of record',
    description:
      'A Spatial Pack is a versioned bundle of assets plus a manifest that records schemas, licensing, provenance, and integrity hashes.',
    outcome: 'Your "what" and your "why" ship together.',
  },
  {
    variant: 'ocean' as const,
    title: 'Spatial context CDN',
    description:
      'We serve packs through an edge-optimised CDN: immutable paths, strong ETags, range requests, and signed URLs.',
    outcome: 'Predictable performance without rebuilding the world per application.',
  },
  {
    variant: 'ochre' as const,
    title: 'Deterministic tools',
    description:
      'Tools operate on URIs and produce publishable layers + manifest patches.',
    outcome: 'Workflows you can reproduce, audit, and operationalise.',
  },
]

/**
 * Three pillars section - introduces the product model.
 */
export function Pillars() {
  return (
    <Section>
      <SectionHeader
        eyebrow="What we do"
        title="Spatial Packs are the product. The CDN is the delivery."
        align="center"
      />

      <div className="grid md:grid-cols-3 gap-6">
        {pillars.map((pillar) => (
          <Card
            key={pillar.title}
            variant={pillar.variant}
            className="flex flex-col"
          >
            <CardTitle className="mb-3">{pillar.title}</CardTitle>
            <CardDescription className="flex-1">
              {pillar.description}
            </CardDescription>
            <p className="mt-4 pt-4 border-t border-ink/10 text-small font-medium text-ink">
              {pillar.outcome}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
