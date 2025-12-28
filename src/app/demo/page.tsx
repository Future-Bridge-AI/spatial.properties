import type { Metadata } from 'next'
import { Section, SectionHeader } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { CodeBlock } from '@/components/demo/CodeBlock'

export const metadata: Metadata = {
  title: 'Demo — Pack Explorer',
  description:
    'Browse versioned Spatial Packs and inspect what you\'re actually shipping. A guided walkthrough of the Pack Explorer.',
}

// Sample spatialpack.json for the demo
const sampleManifest = `{
  "pack_id": "spatial.properties:wa:utilities-risk:v1",
  "version": "1.2.0",
  "created_at": "2025-12-01T02:14:00Z",
  "bbox": [-121.8, -23.6, -114.7, -16.3],
  "crs": "EPSG:4326",
  "tenant": "demo",

  "license": {
    "id": "SP-LicenseRef-Mixed-Demo-2025",
    "attribution": "See provenance.sources. Some layers are restricted to tenant roles."
  },

  "security": {
    "classification": "public",
    "visibility": ["demo:*"]
  },

  "layers": [
    {
      "id": "base.map",
      "type": "vector",
      "schema": "sp.base.map.v1",
      "pmtiles": "https://cdn.spatial.properties/packs/.../base.map.pmtiles",
      "stats": { "features": 18652340 }
    },
    {
      "id": "utilities.power_network",
      "type": "vector",
      "schema": "sp.wa.utilities.power_network.v1",
      "security": {
        "classification": "restricted",
        "visibility": ["demo:analyst", "demo:field_ops"]
      }
    },
    {
      "id": "risk.bushfire_risk_index",
      "type": "raster",
      "cog": "https://cdn.spatial.properties/packs/.../risk.bushfire_risk_index.cog.tif"
    }
  ],

  "deltas": [
    {
      "from": "1.1.0",
      "to": "1.2.0",
      "size_bytes": 38192712
    }
  ],

  "integrity": {
    "manifest_sha256": "sha256:111...demo"
  }
}`

const walkthroughSteps = [
  {
    time: '0:00',
    title: 'Find the pack',
    description: 'Search for packs by name, region, layer, or publisher.',
  },
  {
    time: '0:45',
    title: 'Check provenance + licensing',
    description: 'See source lineage, license gates, and derived-from chains.',
  },
  {
    time: '1:30',
    title: 'Toggle layers',
    description: 'Preview vector, raster, and restricted layers with role-based access.',
  },
  {
    time: '2:15',
    title: 'Run an operation',
    description: 'Execute deterministic tools that produce publishable outputs.',
  },
  {
    time: '3:00',
    title: 'Create a CSP-1 context packet',
    description: 'Generate scoped packets for agents and offline field work.',
  },
  {
    time: '3:45',
    title: 'Download offline bundle',
    description: 'Get integrity-verified bundles ready for field deployment.',
  },
]

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <Section background="grid" size="large">
        <div className="max-w-3xl">
          <span className="eyebrow">Pack Explorer</span>
          <h1 className="text-h1 font-serif mt-4">
            Browse versioned Spatial Packs and inspect what you're actually
            shipping.
          </h1>
          <p className="mt-6 text-body text-slate">
            This is a guided walkthrough of demo content. Sources, licensing,
            and coverage vary by customer, jurisdiction, and contract. Your
            packs enforce license/provenance gates at publish time.
          </p>
        </div>
      </Section>

      {/* Video / Walkthrough placeholder */}
      <Section>
        <SectionHeader
          eyebrow="Walkthrough"
          title="See Pack Explorer in action"
          description="A 4-minute tour of how teams discover, inspect, and use Spatial Packs."
        />

        {/* Video placeholder - replace with actual video embed */}
        <div className="aspect-video bg-slate rounded-xl flex items-center justify-center mb-8">
          <div className="text-center">
            <p className="text-h3 font-serif text-white mb-2">
              Video coming soon
            </p>
            <p className="text-body text-stone">
              Demo walkthrough will be embedded here
            </p>
          </div>
        </div>

        {/* Chapter markers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {walkthroughSteps.map((step) => (
            <div
              key={step.title}
              className="flex gap-4 p-4 bg-cloud rounded-lg"
            >
              <span className="text-small font-mono text-ocean shrink-0">
                {step.time}
              </span>
              <div>
                <h3 className="text-small font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="text-small text-slate mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sample manifest */}
      <Section background="muted">
        <SectionHeader
          eyebrow="Sample manifest"
          title="WA Utilities + Bushfire Risk (Pilbara)"
          description="A real-world example showing versioned layers, mixed security classifications, and delta support."
        />

        <CodeBlock
          code={sampleManifest}
          language="json"
          label="spatialpack.json"
          collapsible
          defaultCollapsed={false}
        />

        <div className="mt-8 p-6 bg-white border border-grid rounded-lg">
          <h3 className="text-h4 font-serif mb-4">What this demonstrates</h3>
          <ul className="grid sm:grid-cols-2 gap-3 text-body text-slate">
            <li className="flex items-start gap-2">
              <span className="text-eucalypt">✓</span>
              Pack-first source of record (GeoParquet + delivery formats)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-eucalypt">✓</span>
              Immutable, versioned delivery (URLs include pack + version)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-eucalypt">✓</span>
              WA wedge alignment (utilities + bushfire risk)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-eucalypt">✓</span>
              Deltas for efficient updates (fall back to full refresh when
              needed)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-eucalypt">✓</span>
              Layer-level security classification
            </li>
            <li className="flex items-start gap-2">
              <span className="text-eucalypt">✓</span>
              Integrity hashes for verification
            </li>
          </ul>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-h2 font-serif mb-4">
            Want to explore with your own data?
          </h2>
          <p className="text-body text-slate mb-8">
            We'll help you publish a pilot pack and walk through the Pack
            Explorer with layers that matter to your team.
          </p>
          <Button href="/contact" size="lg">
            Book a walkthrough
          </Button>
        </div>
      </Section>
    </>
  )
}
