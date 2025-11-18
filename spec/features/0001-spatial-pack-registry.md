# Feature 0001 — Spatial Pack Registry (MVP)

## Goal
A minimal registry that:
- Stores **Pack Manifests** (JSON) with versioning & provenance
- Serves **read-only** list + detail APIs
- Issues pre-signed URLs for underlying artifacts (PMTiles/GeoParquet/COG)

## Users
- **Agent/Service** fetching packs by area/topic/version.
- **Publisher (internal)** pushing new manifests.

## API (v0)
- `GET /v0/packs?bbox=<minx,miny,maxx,maxy>&topic=<str>&limit=<n>` → list manifests
- `GET /v0/packs/{pack_id}` → manifest detail
- `GET /v0/packs/{pack_id}/artifacts/{name}` → 302 to pre-signed URL
- `GET /v0/health` → `{status:"ok"}`

### Manifest (JSON) — draft
```json
{
  "id": "wa-roads-2025-11-01",
  "version": "2025.11.01",
  "topics": ["roads","transport"],
  "spatial": {"s2": ["4f12…"], "bbox": [112.9,-35.1,129.0,-13.6], "crs":"EPSG:4326"},
  "artifacts": [
    {"name":"roads.pmtiles","type":"pmtiles","bytes": 123456789,"sha256":"…"},
    {"name":"roads.parquet","type":"geoparquet","bytes": 987654321,"sha256":"…"}
  ],
  "provenance": {"source":"Main Roads WA","license":"CC-BY 4.0","generated_at":"2025-11-06T00:00:00Z"},
  "signature": null
}

## Data Contracts
- Artifacts MUST be byte-addressable and immutable by version.
- `id` MUST be globally unique; `version` MUST be ISO-like date (`YYYY.MM.DD`) or semver.
- `bbox` is required; optional S2/H3 index may be provided for fast filtering.

## Acceptance Criteria
- [ ] `GET /v0/health` returns 200 within 50ms locally.
- [ ] List API returns ≥1 manifest filtered by `bbox`/`topic`.
- [ ] Detail API returns full manifest with `artifacts`.
- [ ] Artifact endpoint redirects (302) to a signed URL.
- [ ] Basic OpenAPI doc generated.
- [ ] Dockerized service runs locally: `docker run … registry:local`.

## Non-Goals (v0)
- AuthN/AuthZ, publishers UI, billing, multi-region writes.

## Metrics (v0)
- p95 `GET /v0/packs` < 120ms (local).
- p95 time-to-first-byte from artifact pre-signed URL < 200ms (local/minio).

## Rollout
1. Walking skeleton (end-to-end, fake data).
2. Wire to blob store (MinIO/dev S3).
3. Seed one “WA demo roads” pack.
4. Publish OpenAPI + README usage.

## Risks
- Over-scoping metadata; keep manifest minimal.
- Premature auth; stick to public read for v0.

## Open Questions
- H3 vs S2 for spatial index? (prototype supports either)
- Sign manifests? (likely JSON Web Signature; to be decided in ADR)
