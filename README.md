# Spatial.Properties — Monorepo

This monorepo is the source of truth for Spatial.Properties — a pack-first geospatial platform delivering curated spatial packs for site selection and corridor planning.

## Repository Structure

| Directory | Description | Quick Start |
|-----------|-------------|-------------|
| `spec/` | Feature specifications | `spec/constitution.md` |
| `adr/` | Architecture Decision Records | `adr/0001-pack-first-architecture.md` |
| `Docs/` | Architecture & planning docs | `Docs/README.md` |
| `website/` | Marketing website (Next.js 14) | `cd website && npm run dev` |
| `demo/` | Offline GIS demo (DuckDB, MapLibre) | `cd demo/demo-offline-gis && npm run serve` |
| `cng-stack/` | Speckit workflow framework | — |
| `mockup/` | Template workspace | — |

⚑ Working principle: shipping beats perfect. Every change starts as a spec PR.

---

## Feature Specifications

| Spec | Description | Status |
|------|-------------|--------|
| [0001-spatial-pack-spec](spec/features/0001-spatial-pack-spec.md) | Spatial Pack manifest and structure | Stable |
| [0002-schema-registry-validation](spec/features/0002-schema-registry-validation.md) | Schema registry, extensions, validation | Draft |
| [0003-trust-and-policy-artifacts](spec/features/0003-trust-and-policy-artifacts.md) | Signed manifests, contracts, lineage | Draft |
| [0004-wa-solar-feasibility-pack](spec/features/0004-wa-solar-feasibility-pack.md) | WA Solar Pack (hero example) | Draft |

---

## Documentation

### Architecture
- [01-Architecture-and-Data-Model](Docs/architecture/01-Architecture-and-Data-Model.md) — Data formats, manifest schema
- [02-Services-and-APIs](Docs/architecture/02-Services-and-APIs.md) — Core services, API contracts
- [03-Schema-Registry-and-Validation](Docs/architecture/03-Schema-Registry-and-Validation.md) — Schema registry, extensions, validation
- [04-Trust-and-Compatibility-Strategy](Docs/architecture/04-Trust-and-Compatibility-Strategy.md) — Two-track trust strategy

### Planning
- [02-Schema-and-Validation-Roadmap](Docs/planning/02-Schema-and-Validation-Roadmap.md) — Schema registry phases
- [04-Implementation-Plan](Docs/planning/04-Implementation-Plan.md) — Milestones, epics, WBS
- [05-Trust-and-Compatibility-Roadmap](Docs/planning/05-Trust-and-Compatibility-Roadmap.md) — Trust artifacts phases
- [06-Cost-Modeling-and-Budget](Docs/planning/06-Cost-Modeling-and-Budget.md) — Financial planning
- [07-Solar-Pack-Example-and-Licensing](Docs/planning/07-Solar-Pack-Example-and-Licensing.md) — Hero pack guide

---

## Hero Example: WA Solar Feasibility Pack

The **WA Solar Feasibility Pack** demonstrates the pack-first approach end-to-end:

- **6+ layers**: Solar exposure, DEM, slope, aspect, bushfire, roads
- **Open data foundation** (v0) with premium add-ons (v1)
- **Screening workflow** for site selection
- **Reproducible results** with evidence trail

See [spec/features/0004-wa-solar-feasibility-pack.md](spec/features/0004-wa-solar-feasibility-pack.md) for details.

---

## Key Principles

1. **Pack-first**: Spatial Packs are the unit of delivery
2. **Immutability**: Every version publishes to a new path
3. **Trust artifacts**: Signed manifests, integrity receipts, machine-readable contracts
4. **Schema validation**: Every published vector layer includes resolvable `schema_uri`
5. **Two-track compatibility**: Ship valuable primitives now (Track A); defer Spatial Web standards until market pull (Track B)