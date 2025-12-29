import { Section, SectionHeader } from '@/components/layout/Section'
import { QuoteCard } from '@/components/ui/Card'

const painPoints = [
  'Which layer version did we use?',
  'Can we reproduce last week\'s decision?',
  'Are we allowed to redistribute this dataset?',
  'Why is it fast in the office and painful in the field?',
]

/**
 * Problem section - names the pain so site selection teams feel understood.
 * Reframed for buyers, not platform builders.
 */
export function Problem() {
  return (
    <Section background="muted">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Left column: heading + body */}
        <div>
          <SectionHeader
            eyebrow="The problem"
            title="Site decisions break when the context isn't trustworthy."
          />
          <p className="text-body text-slate max-w-readable">
            Teams still burn weeks arguing about layer versions, licensing, and
            performance gaps between office and field — and every app rebuilds
            the same datasets from scratch.
          </p>
        </div>

        {/* Right column: quote cards - real questions from real teams */}
        <div className="space-y-4">
          {painPoints.map((quote) => (
            <QuoteCard key={quote} quote={quote} />
          ))}
        </div>
      </div>
    </Section>
  )
}
