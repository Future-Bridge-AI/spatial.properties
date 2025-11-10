# Constitution — Spatial.Properties

## Purpose
Deliver AI-ready spatial context as **Spatial Packs** via a CDN/API. The platform is pack-first, cloud-native, and agent-friendly.

## Non-negotiables
1) **Pack-first**: GeoParquet/PMTiles/COG/COPC are first-class.
2) **Open semantics**: STAC/GeoArrow where practical; extend with clear schemas.
3) **Edge delivery**: everything cacheable, range-requestable, resumable.
4) **Explainability**: provenance, versioning, signed manifests.
5) **Spec > code**: features are implemented only from merged specs.

## Working Agreements
- Small PRs; ship a walking skeleton first.
- Every feature has: scope, API surface, data contracts, acceptance tests, rollout plan, risks.
- Metrics: TTFP (time-to-first-pack), p95 pack fetch latency, cache hit-rate, cost per TB egress.

## Initial Scope Guardrails
Out of scope for v0: UI builder, account billing, multi-tenant orgs. In scope: single-tenant dev mode, public read endpoints, signed URLs.

## Performance & Reliability Guardrails
All features MUST define p95 latency targets for primary endpoints and document cache behavior (hit-rate targets where applicable).
