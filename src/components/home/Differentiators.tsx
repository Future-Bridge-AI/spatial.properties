import { Section, SectionHeader } from '@/components/layout/Section'
import { cn } from '@/lib/utils'

const differentiators = [
  {
    statement: 'Not a WMS/WFS re-host.',
    explanation: 'Packs are versioned artifacts designed for modern consumption.',
  },
  {
    statement: 'Databases are scratch.',
    explanation: 'Packs are authoritative. PostGIS is for caching, not source of record.',
  },
  {
    statement: 'Governance is enforced before publish.',
    explanation: "License compatibility and provenance validation aren't policy docs.",
  },
  {
    statement: 'Built for real distribution.',
    explanation: 'Caching, immutable paths, integrity verification, signed access by default.',
  },
]

/**
 * Differentiators section - draws hard edges.
 * Tightened copy, kept below value proposition sections.
 */
export function Differentiators() {
  return (
    <Section>
      <SectionHeader
        eyebrow="What makes us different"
        title="Hard edges. Clear non-goals."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {differentiators.map((item, index) => (
          <div
            key={item.statement}
            className={cn(
              'p-6 rounded-lg',
              index % 2 === 0 ? 'bg-cloud' : 'bg-white border border-grid'
            )}
          >
            <p className="text-h4 font-serif text-ink mb-2">{item.statement}</p>
            <p className="text-body text-slate">{item.explanation}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
