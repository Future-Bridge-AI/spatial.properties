# Constitution — Spatial.Properties

## Purpose
Deliver AI-ready spatial context as **Spatial Packs** via a CDN/API. The platform is pack-first, cloud-native, and agent-friendly.

## Non-negotiables
1) **Pack-first**: GeoParquet/PMTiles/COG/COPC are first-class.
2) **Open semantics**: STAC/GeoArrow where practical; extend with clear schemas.
3) **Edge delivery**: everything cacheable, range-requestable, resumable.
4) **Explainability**: provenance, versioning, signed manifests.
5) **Spec > code**: features are implemented only from merged specs.
6) **Trust artifacts**: signed manifests, integrity receipts, machine-readable contracts (license + policy) are required for published packs.
7) **Schema validation**: every published vector layer MUST include a resolvable `schema_uri` with a passing conformance report.

## Working Agreements
- Small PRs; ship a walking skeleton first.
- Every feature has: scope, API surface, data contracts, acceptance tests, rollout plan, risks.
- Metrics: TTFP (time-to-first-pack), p95 pack fetch latency, cache hit-rate, cost per TB egress.
- **Two-track compatibility**: Ship valuable primitives now (Track A); defer Spatial Web standards until market pull (Track B). See `Docs/architecture/04-Trust-and-Compatibility-Strategy.md`.
- **Licensing clarity**: every pack/layer MUST reference `contract.json` (license + obligations) and `policy.json` (classification + access constraints).

## Initial Scope Guardrails
Out of scope for v0: UI builder, account billing, multi-tenant orgs. In scope: single-tenant dev mode, public read endpoints, signed URLs.

## Performance & Reliability Guardrails
All features MUST define p95 latency targets for primary endpoints and document cache behavior (hit-rate targets where applicable).

## Schema & Validation Guardrails
- Draft packs MAY omit validation; published packs MUST include `validation.conformance_uri` with `status=pass`.
- Breaking schema changes MUST bump major version and ship migration guidance.
