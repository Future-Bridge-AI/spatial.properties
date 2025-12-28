import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { CalendlyEmbed } from '@/components/contact/CalendlyEmbed'

export const metadata: Metadata = {
  title: 'Contact - Book a Demo',
  description:
    'Book a demo to see how Spatial.Properties can help your team with curated spatial packs for site selection.',
}

export default function ContactPage() {
  return (
    <>
      <Section background="grid" size="large">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow">Get in touch</span>
          <h1 className="text-h1 font-serif mt-4">Book a demo</h1>
          <p className="mt-6 text-body text-slate max-w-2xl mx-auto">
            See your area as a Spatial Pack. Bring one site or one operational
            question, and we will show you what pack-first looks like end-to-end.
          </p>
        </div>
      </Section>

      <Section>
        <div className="max-w-4xl mx-auto">
          <CalendlyEmbed />

          <div className="mt-12 pt-12 border-t border-grid">
            <h2 className="text-h3 font-serif mb-6 text-center">
              Prefer email?
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-6 bg-cloud rounded-lg text-center">
                <h3 className="text-h4 font-serif mb-2">General enquiries</h3>
                <p className="text-body text-slate">
                  <a
                    href="mailto:hello@spatial.properties"
                    className="text-ocean hover:text-ocean-dark"
                  >
                    hello@spatial.properties
                  </a>
                </p>
              </div>
              <div className="p-6 bg-cloud rounded-lg text-center">
                <h3 className="text-h4 font-serif mb-2">Investor enquiries</h3>
                <p className="text-body text-slate">
                  <a
                    href="mailto:investors@spatial.properties"
                    className="text-ocean hover:text-ocean-dark"
                  >
                    investors@spatial.properties
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="muted">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-h2 font-serif mb-8 text-center">
            What to expect
          </h2>
          <div className="space-y-6">
            <div className="flex gap-6 p-6 bg-white border border-grid rounded-lg">
              <span className="text-h3 font-serif text-ocean shrink-0">01</span>
              <div>
                <h3 className="text-h4 font-serif mb-2">Discovery call (30 min)</h3>
                <p className="text-body text-slate">
                  We will understand your current spatial data challenges, workflows, and what success looks like for your team.
                </p>
              </div>
            </div>
            <div className="flex gap-6 p-6 bg-white border border-grid rounded-lg">
              <span className="text-h3 font-serif text-ocean shrink-0">02</span>
              <div>
                <h3 className="text-h4 font-serif mb-2">Technical demo</h3>
                <p className="text-body text-slate">
                  See Pack Explorer with real data. We will show versioning, governance, CDN delivery, and tool execution.
                </p>
              </div>
            </div>
            <div className="flex gap-6 p-6 bg-white border border-grid rounded-lg">
              <span className="text-h3 font-serif text-ocean shrink-0">03</span>
              <div>
                <h3 className="text-h4 font-serif mb-2">Pilot proposal</h3>
                <p className="text-body text-slate">
                  If there is a fit, we will scope a pilot: one region, one theme, one pack you can trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
