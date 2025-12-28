import { Section, SectionHeader } from '@/components/layout/Section'

const columns = [
  {
    title: 'Decision layers',
    items: [
      'Constraints and exclusion zones',
      'Hazards (flood, bushfire, contamination)',
      'Approvals overlays and zoning',
    ],
  },
  {
    title: 'Base context',
    items: [
      'Cadastre and land tenure',
      'Terrain and slope analysis',
      'Access roads and infrastructure',
    ],
  },
  {
    title: 'Defensibility',
    items: [
      'Source provenance and licensing',
      'Version history and changelogs',
      'Integrity hashes for verification',
    ],
  },
]

/**
 * What's in a pack section - explains pack contents in plain language.
 * Focus on "what" and "why" shipping together.
 */
export function WhatsInAPack() {
  return (
    <Section>
      <SectionHeader
        eyebrow="What's inside"
        title="A pack ships your 'what' and your 'why' together."
        description="The layers plus the manifest that records the rules, sources, and integrity checks. No more arguing about where the data came from."
        align="center"
      />

      <div className="grid md:grid-cols-3 gap-8">
        {columns.map((column) => (
          <div key={column.title} className="text-center md:text-left">
            <h3 className="text-h4 font-serif mb-4">{column.title}</h3>
            <ul className="space-y-3">
              {column.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-body text-slate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-ocean mt-2.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
