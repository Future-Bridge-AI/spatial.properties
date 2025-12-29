import { Section, SectionHeader } from '@/components/layout/Section'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'

const benefits = [
  {
    title: 'Ready-to-use packs',
    description:
      'Datasets bundled for a job — site screening, corridor options, approvals evidence — not raw downloads you need to wrangle.',
  },
  {
    title: 'Built-in defensibility',
    description:
      'Schemas, licensing, provenance, and integrity hashes travel with the data. You know what you used and can prove it.',
  },
  {
    title: 'Fast everywhere',
    description:
      'Served through an edge-optimised CDN with immutable paths and signed URLs. Same performance in the office and the field.',
  },
  {
    title: 'Reproducible workflows',
    description:
      'Every pack version is immutable. Re-run analysis months later and get the same results.',
  },
]

/**
 * What it is section - explains the subscription catalog model.
 * Positioned as "curated packs" not "infrastructure to publish your own".
 */
export function WhatItIs() {
  return (
    <Section>
      <SectionHeader
        eyebrow="What Spatial.Properties is"
        title="A subscription catalog of industry packs — delivered like software updates."
        description="Spatial.Properties curates Spatial Packs: versioned bundles of the layers you actually need for a job, plus the manifest that proves schema, licensing, provenance, and integrity. Pick a pack, load it into your workflow, and get predictable performance without rebuilding the world."
        align="center"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit) => (
          <Card key={benefit.title} variant="outline" className="text-center">
            <CardTitle className="mb-3">{benefit.title}</CardTitle>
            <CardDescription>{benefit.description}</CardDescription>
          </Card>
        ))}
      </div>
    </Section>
  )
}
