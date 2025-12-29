# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**website.spatial.properties** is the marketing/product website for Spatial.Properties, a pack-first geospatial platform.

**Owner:** Future Bridge AI (craig@futurebridgeai.com.au)

## Build Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production (static export to /out)
npm run build

# Type check without emitting
npm run type-check

# Lint
npm run lint
```

## Tech Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Fonts:** Instrument Serif (headings), Inter (body)
- **Icons:** Lucide React
- **Deployment:** Static export to Vercel or any static host

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with Header/Footer
│   ├── page.tsx            # Homepage
│   ├── contact/            # Calendly booking page
│   ├── demo/               # Pack Explorer walkthrough
│   ├── developers/         # Developer docs (placeholder)
│   ├── investors/          # Investor page (placeholder)
│   ├── pricing/            # Pricing (placeholder)
│   ├── product/            # Product overview (placeholder)
│   └── solutions/          # Use cases (placeholder)
├── components/
│   ├── home/               # Homepage section components
│   ├── layout/             # Header, Footer, Section
│   ├── ui/                 # Button, Card, Badge primitives
│   ├── demo/               # CodeBlock component
│   └── contact/            # CalendlyEmbed component
├── lib/
│   └── utils.ts            # cn() helper for classnames
└── styles/
    └── globals.css         # Tailwind + custom styles
```

## Core Concepts

Spatial.Properties inverts traditional GIS thinking. Key concepts:

1. **Spatial Packs** - Versioned bundles of spatial assets + manifest (`spatialpack.json`)
2. **Immutability** - Every version publishes to a new path. No silent overwrites.
3. **Governance Gates** - License/provenance validation enforced before publish
4. **CSP-1** - H3/S2-scoped context packets for agents and edge clients
5. **Deterministic Tools** - Operations accept URIs, produce publishable layers + manifest patches

## Design System

**Colours:**
- `ink` (#0F172A) - Primary text
- `ocean` (#2563EB) - Links, CTAs, interactive elements
- `eucalypt` (#059669) - Success, pack/data theme
- `ochre` (#D97706) - Warnings, tools theme
- `cloud` (#F8FAFC) - Page background
- `grid` (#E2E8F0) - Coordinate grid texture

**Typography:**
- Headings: Instrument Serif (font-serif)
- Body: Inter (font-sans)
- Code: JetBrains Mono (font-mono)

**Key classes:**
- `.grid-texture` - Coordinate grid background pattern
- `.grid-texture-dark` - Dark variant for dark sections
- `.eyebrow` - Uppercase label above headings
- `.proof-chip` - Trust signal badges with checkmarks

## Voice & Tone

- **Prefer:** version, manifest, immutable, scope, delta, signed URL
- **Avoid:** enterprise-grade, cutting-edge, unlock, seamless
- **Tone:** confident, calm, technical-but-human
- **Errors:** always tell users what happened + what to do next

## Documentation

The `/Docs/` folder contains product specifications:
- `1) HOMEPAGE COPY.txt` - Full marketing narrative
- `Global UI voice rules.txt` - Design system, tone guidelines, UI microcopy
- `Pack Explorer.md` - Feature spec with sample spatialpack.json

## Configuration Notes

- **Calendly:** Update `CALENDLY_URL` in `src/components/contact/CalendlyEmbed.tsx`
- **Static export:** Configured in `next.config.js` with `output: 'export'`
- **Images:** Use native `<img>` or external CDN (Next.js Image optimization disabled for static export)

## Performance Targets

- p95 first visual tile < 2 seconds
- p95 tile hit < 500ms
- p95 STAC search < 600ms
- 99.9% availability target

## Related Repositories

- `spatial.properties/` - Core specification repo with ADRs and feature specs
- `demo.spatial.properties/` - Offline GIS demo implementations
