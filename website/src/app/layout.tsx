import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// Load fonts with CSS variable assignment
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Spatial.Properties — Spatial context, delivered like software',
    template: '%s | Spatial.Properties',
  },
  description:
    'Spatial.Properties is a pack-first geospatial platform. Publish versioned Spatial Packs with licensing and provenance built in — served globally via an edge-optimised spatial context CDN for apps, analytics, and agents.',
  keywords: [
    'spatial data',
    'geospatial',
    'GeoParquet',
    'PMTiles',
    'COG',
    'spatial packs',
    'CDN',
    'geospatial platform',
    'Western Australia',
    'utilities',
  ],
  authors: [{ name: 'Future Bridge AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://spatial.properties',
    siteName: 'Spatial.Properties',
    title: 'Spatial.Properties — Spatial context, delivered like software',
    description:
      'A pack-first geospatial platform. Publish versioned Spatial Packs with licensing and provenance built in.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spatial.Properties — Spatial context, delivered like software',
    description:
      'A pack-first geospatial platform. Publish versioned Spatial Packs with licensing and provenance built in.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-AU"
      className={`${inter.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
