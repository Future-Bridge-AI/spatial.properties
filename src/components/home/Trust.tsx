import { Section, SectionHeader } from '@/components/layout/Section'

const sloTargets = [
  { metric: 'First visual tile', target: 'p95 < 2s' },
  { metric: 'Tile hit', target: 'p95 < 500ms' },
  { metric: 'STAC search', target: 'p95 < 600ms' },
  { metric: 'Availability', target: '99.9%' },
]

/**
 * Trust section - brief proof of operational credibility.
 * Kept lower on page, not the lead story.
 */
export function Trust() {
  return (
    <Section background="muted">
      <SectionHeader
        eyebrow="Trust"
        title="Reliability you can measure — not just promise."
        align="center"
      />

      <div className="max-w-2xl mx-auto">
        {/* SLO targets */}
        <div className="bg-white rounded-lg border border-grid overflow-hidden">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-grid bg-cloud">
                <th className="text-left font-semibold p-4 text-slate">
                  Metric
                </th>
                <th className="text-right font-semibold p-4 text-slate">
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {sloTargets.map((row, index) => (
                <tr
                  key={row.metric}
                  className={index < sloTargets.length - 1 ? 'border-b border-grid' : ''}
                >
                  <td className="p-4 text-ink">{row.metric}</td>
                  <td className="p-4 text-right font-mono text-ocean">
                    {row.target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Security one-liner */}
        <p className="mt-6 text-small text-stone text-center">
          Security: OIDC for humans, mTLS for devices/agents, signed URLs with
          tenant + scope claims.
        </p>
      </div>
    </Section>
  )
}
