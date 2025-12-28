import { Section, SectionHeader } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const packs = [
  {
    name: 'WA Data Centre Site Screening',
    description:
      'Shortlist viable sites quickly with constraints, access, terrain, and "what changed" between versions.',
    tags: ['Constraints', 'Access', 'Terrain', 'Versioned'],
    stripe: 'eucalypt' as const,
  },
  {
    name: 'WA Transmission Corridor Screening',
    description:
      'Compare corridor options, avoid exclusions early, reduce redesign loops with defensible overlays.',
    tags: ['Corridors', 'Exclusions', 'Routing'],
    stripe: 'ocean' as const,
  },
  {
    name: 'WA Approvals Evidence Pack',
    description:
      'The layers you\'ll be asked to justify, packaged with clean provenance and licensing constraints.',
    tags: ['Approvals', 'Provenance', 'Licensing'],
    stripe: 'ochre' as const,
  },
  {
    name: 'Field-Ready Basemap',
    description:
      'Offline-capable context for degraded connectivity and mobile workflows. Fast in the field.',
    tags: ['Offline', 'Mobile', 'Basemap'],
    stripe: 'stone' as const,
  },
]

const stripeColors = {
  eucalypt: 'bg-eucalypt',
  ocean: 'bg-ocean',
  ochre: 'bg-ochre',
  stone: 'bg-stone',
}

/**
 * Pack Catalog section - shows specific packs for the WA greenfield wedge.
 * This is the "what do I get" section that replaces generic solutions.
 */
export function PackCatalog() {
  return (
    <Section background="muted">
      <SectionHeader
        eyebrow="Starter catalog (WA wedge)"
        title="Packs built for greenfield development teams."
        description="For example: data centre site selection, transmission corridor planning, and approvals workflows."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.name}
            className="bg-white border border-grid rounded-lg overflow-hidden"
          >
            {/* Coloured stripe */}
            <div className={`h-1.5 ${stripeColors[pack.stripe]}`} />

            <div className="p-6">
              <h3 className="text-h4 font-serif mb-2">{pack.name}</h3>
              <p className="text-body text-slate mb-4">{pack.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {pack.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA for coverage request */}
      <div className="mt-10 text-center">
        <Button href="/contact" variant="ghost">
          Request pack coverage for your area
        </Button>
      </div>
    </Section>
  )
}
