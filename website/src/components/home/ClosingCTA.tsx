import { Button } from '@/components/ui/Button'

/**
 * Closing CTA section - dark band to convert interest.
 * Pilot-focused messaging.
 */
export function ClosingCTA() {
  return (
    <section className="bg-ink grid-texture-dark py-20 md:py-28">
      <div className="container-wide text-center">
        <h2 className="text-h2 font-serif text-white mb-4">
          See your area as a Spatial Pack.
        </h2>
        <p className="text-body text-stone max-w-2xl mx-auto mb-8">
          Bring one site — or one operational question — and we'll show you what
          "pack-first" looks like end-to-end.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/contact" size="lg">
            Book a pilot
          </Button>
          <Button
            href="/contact"
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white/10"
          >
            Talk to us
          </Button>
        </div>
      </div>
    </section>
  )
}
