# website

Marketing and product website for [Spatial.Properties](https://spatial.properties) - a pack-first geospatial platform delivering curated spatial packs for site selection and corridor planning.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (static export)
npm run build

# Type check
npm run type-check
```

## Tech Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Fonts:** Instrument Serif (headings), Inter (body), JetBrains Mono (code)
- **Icons:** Lucide React

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx            # Homepage
│   ├── contact/            # Booking page (Calendly)
│   ├── demo/               # Pack Explorer walkthrough
│   └── [pages]/            # Product, Solutions, Developers, etc.
├── components/
│   ├── home/               # Homepage sections
│   ├── layout/             # Header, Footer, Section
│   └── ui/                 # Button, Card, Badge
└── styles/globals.css      # Tailwind + custom styles
```

## Documentation

See `/Docs/` for:
- Marketing copy and messaging
- UI voice and tone guidelines
- Pack Explorer feature specs
- Design references

## Configuration

- **Calendly:** Update URL in `src/components/contact/CalendlyEmbed.tsx`
- **Static Export:** Configured in `next.config.js`

## Owner

Future Bridge AI
craig@futurebridgeai.com.au
