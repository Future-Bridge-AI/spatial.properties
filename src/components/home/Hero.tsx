import { Button } from '@/components/ui/Button'
import { ProofChip } from '@/components/ui/Badge'

/**
 * Homepage hero section.
 * Outcome-led positioning: what you get, not how it works.
 * Target: greenfield development teams (data centres, transmission, major projects)
 */
export function Hero() {
  return (
    <section className="relative bg-cloud grid-texture-fade">
      <div className="container-wide py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow - industry focus */}
          <span className="eyebrow">Spatial data for greenfield development</span>

          {/* Headline - outcome, not mechanism */}
          <h1 className="text-h1 md:text-display font-serif mt-4">
            Curated spatial packs for site selection and corridor planning.
          </h1>

          {/* Subheadline - value proposition */}
          <p className="mt-6 text-body md:text-lg text-slate max-w-2xl mx-auto">
            Subscribe to ready-to-use packs (starting in WA) that help teams
            shortlist sites faster, surface constraints earlier, and defend
            decisions with a clean data trail.
          </p>

          {/* CTAs - pilot focus */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/contact" size="lg">
              Book a pilot
            </Button>
            <Button href="/demo" variant="secondary" size="lg">
              Explore a sample pack
            </Button>
          </div>

          {/* Proof chips - outcomes first, mechanism implied */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ProofChip>Versioned data you can reproduce</ProofChip>
            <ProofChip>Licensing + provenance handled</ProofChip>
            <ProofChip>Fast delivery to web, analytics, and field</ProofChip>
          </div>
        </div>
      </div>
    </section>
  )
}
