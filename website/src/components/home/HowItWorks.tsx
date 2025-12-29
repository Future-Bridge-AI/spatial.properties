import { Section, SectionHeader } from '@/components/layout/Section'

const steps = [
  {
    number: '01',
    label: 'Ingest',
    description: 'We capture source metadata, license, checksums, and scope.',
  },
  {
    number: '02',
    label: 'Normalise',
    description: 'Multiple sources become canonical schemas with lineage.',
  },
  {
    number: '03',
    label: 'Build',
    description: 'Open assets optimised for delivery: vector, raster, point cloud.',
  },
  {
    number: '04',
    label: 'Publish',
    description: 'Versioned manifest, hashes, catalog entry, change events.',
  },
  {
    number: '05',
    label: 'Serve',
    description: 'Global delivery. Deltas when efficient, full refresh when not.',
  },
]

/**
 * How it works section - shows the pipeline in human terms.
 * Kept brief - detail belongs on Developers page.
 */
export function HowItWorks() {
  return (
    <Section background="muted">
      <SectionHeader
        eyebrow="How it works"
        title="From source data to edge delivery — without losing trust."
        align="center"
      />

      {/* Desktop: horizontal stepper */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative">
          {/* Connector line */}
          <div className="absolute top-6 left-[10%] right-[10%] h-px bg-grid" />

          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center relative z-10 w-1/5"
            >
              {/* Step number circle */}
              <div className="w-12 h-12 rounded-full bg-ocean text-white flex items-center justify-center text-small font-bold mb-4">
                {step.number}
              </div>

              {/* Label */}
              <h3 className="text-h4 font-serif mb-2">{step.label}</h3>

              {/* Description */}
              <p className="text-small text-slate max-w-[180px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="md:hidden space-y-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex gap-4 relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-px h-full bg-grid -translate-x-1/2" />
            )}

            {/* Step number circle */}
            <div className="w-12 h-12 rounded-full bg-ocean text-white flex items-center justify-center text-small font-bold shrink-0">
              {step.number}
            </div>

            {/* Content */}
            <div className="pt-2">
              <h3 className="text-h4 font-serif mb-1">{step.label}</h3>
              <p className="text-small text-slate">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
