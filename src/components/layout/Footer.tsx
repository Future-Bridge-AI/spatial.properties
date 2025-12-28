import Link from 'next/link'

const footerLinks = {
  Product: [
    { href: '/product', label: 'Overview' },
    { href: '/product#packs', label: 'Spatial Packs' },
    { href: '/product#cdn', label: 'CDN' },
    { href: '/product#governance', label: 'Governance' },
    { href: '/product#tools', label: 'Tools' },
  ],
  Solutions: [
    { href: '/solutions#utilities', label: 'Utilities & Resources' },
    { href: '/solutions#government', label: 'Government' },
    { href: '/solutions#developers', label: 'Apps & Agents' },
  ],
  Developers: [
    { href: '/developers', label: 'Overview' },
    { href: '/developers#quickstart', label: 'Quickstart' },
    { href: '/developers#api', label: 'API Reference' },
    { href: '/developers#csp1', label: 'CSP-1' },
  ],
  Company: [
    { href: '/investors', label: 'Investors' },
    { href: '/contact', label: 'Contact' },
    { href: '/pricing', label: 'Pricing' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ink text-white">
      <div className="container-wide py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-xl text-white hover:text-white">
              Spatial.Properties
            </Link>
            <p className="mt-4 text-small text-stone max-w-xs">
              Pack-first geospatial infrastructure for apps, analytics, and agents.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-sans font-semibold text-small text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-small text-stone hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-small text-stone">
            &copy; {currentYear} Future Bridge AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-small text-stone hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-small text-stone hover:text-white transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
