
**adr/0001-pack-first-architecture.md**
```md
# ADR 0001 — Pack-First Architecture

## Context
Consumers (LLMs/agents) need immutable, byte-rangeable spatial bundles; traditional GIS services are chatty and stateful.

## Decision
Represent deliverables as versioned **Spatial Packs** (PMTiles/GeoParquet/COG/COPC) with a minimal **Manifest** and serve via a CDN/fronting blob storage. Registry provides discovery + pre-signed redirects.

## Consequences
+ Simple caching, deterministic builds, easy edge distribution
+ Works offline/edge with local caches
− Extra step to build packs vs live services
