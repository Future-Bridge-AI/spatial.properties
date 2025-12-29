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
  "pack_id": "spatial.properties:wa:land-greenfield:v1",
  "version": "1.0.0",
  "created_at": "2025-01-01T00:00:00Z",
  "geography": "wa",
  "theme": "land-greenfield",
  "bbox": [112.9, -35.3, 129.0, -13.5],
  "crs": "EPSG:4326",
  "tenant": "demo",

  "license": {
    "id": "custom-wa-greenfield-eval",
    "name": "WA Greenfield Evaluation License",
    "attribution": "© 2025 Spatial.Properties and data licensors",
    "url": "https://spatial.properties/licenses/wa-greenfield-eval-v1"
  },

  "provenance": {
    "sources": [
      {
        "name": "Landgate Cadastral Parcels (demo subset)",
        "id": "landgate-parcels-demo-2024-06",
        "version": "2024-06",
        "license": "custom",
        "url": "https://example.landgate.wa.gov.au/metadata/parcels",
        "sha256": "PLACEHOLDER_SHA_FOR_SOURCE_1"
      },
      {
        "name": "WA Planning Scheme Zones (demo subset)",
        "id": "dplh-zones-demo-2024-06",
        "version": "2024-06",
        "license": "custom",
        "url": "https://example.dplh.wa.gov.au/metadata/zones",
        "sha256": "PLACEHOLDER_SHA_FOR_SOURCE_2"
      },
      {
        "name": "Vegetation & Environmental Constraints (demo subset)",
        "id": "dbca-veg-demo-2024-06",
        "version": "2024-06",
        "license": "custom",
        "url": "https://example.dbca.wa.gov.au/metadata/veg",
        "sha256": "PLACEHOLDER_SHA_FOR_SOURCE_3"
      },
      {
        "name": "DEM 5m (demo subset)",
        "id": "dem-wa-5m-demo-2024-06",
        "version": "2024-06",
        "license": "custom",
        "url": "https://example.dem.wa.gov.au/metadata/dem5m",
        "sha256": "PLACEHOLDER_SHA_FOR_SOURCE_4"
      }
    ],
    "derived_from": []
  },

  "layers": [
    {
      "id": "land.tenure",
      "type": "vector",
      "schema": "sp.land.tenure.v1",
      "title": "Land Tenure",
      "description": "Crown land, freehold, reserves and leases for greenfield development planning.",
      "tilejson": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/land.tenure/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/land.tenure.pmtiles",
      "parquet": "s3://spatial-packs-dev-ap-southeast-2/wa/land-greenfield/v1/land.tenure/*.parquet",
      "geometry_type": "Polygon",
      "index": {
        "h3_res": 9
      },
      "stats": {
        "features": 123456,
        "updated_at": "2025-01-01T00:00:00Z",
        "geometry_valid_pct": 99.9,
        "attribute_completeness": {
          "tenure_type": 1.0,
          "parcel_id": 1.0
        }
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:viewer", "demo:analyst"]
      }
    },
    {
      "id": "land.title_parcels",
      "type": "vector",
      "schema": "sp.land.parcels.v1",
      "title": "Title Parcels",
      "description": "Cadastral parcels suitable for subdivision and greenfield design.",
      "tilejson": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/land.title_parcels/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/land.title_parcels.pmtiles",
      "parquet": "s3://spatial-packs-dev-ap-southeast-2/wa/land-greenfield/v1/land.title_parcels/*.parquet",
      "geometry_type": "Polygon",
      "index": {
        "h3_res": 10
      },
      "stats": {
        "features": 245678,
        "updated_at": "2025-01-01T00:00:00Z",
        "geometry_valid_pct": 99.95,
        "attribute_completeness": {
          "parcel_id": 1.0,
          "lot_plan": 0.98,
          "area_m2": 1.0
        }
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:viewer", "demo:analyst"]
      }
    },
    {
      "id": "planning.scheme_zones",
      "type": "vector",
      "schema": "sp.planning.scheme_zones.v1",
      "title": "Planning Scheme Zones",
      "description": "Local and region planning scheme zones for WA greenfield areas.",
      "tilejson": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/planning.scheme_zones/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/planning.scheme_zones.pmtiles",
      "parquet": "s3://spatial-packs-dev-ap-southeast-2/wa/land-greenfield/v1/planning.scheme_zones/*.parquet",
      "geometry_type": "Polygon",
      "index": {
        "h3_res": 10
      },
      "stats": {
        "features": 34567,
        "updated_at": "2025-01-01T00:00:00Z",
        "geometry_valid_pct": 99.9,
        "attribute_completeness": {
          "zone_code": 1.0,
          "zone_name": 0.99
        }
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:viewer", "demo:analyst"]
      }
    },
    {
      "id": "env.vegetation",
      "type": "vector",
      "schema": "sp.env.vegetation.v1",
      "title": "Vegetation Extent",
      "description": "Native vegetation extent and type for greenfield constraints analysis.",
      "tilejson": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/env.vegetation/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/env.vegetation.pmtiles",
      "parquet": "s3://spatial-packs-dev-ap-southeast-2/wa/land-greenfield/v1/env.vegetation/*.parquet",
      "geometry_type": "Polygon",
      "index": {
        "h3_res": 9
      },
      "stats": {
        "features": 56789,
        "updated_at": "2025-01-01T00:00:00Z",
        "geometry_valid_pct": 99.5,
        "attribute_completeness": {
          "veg_type": 0.95,
          "condition_class": 0.9
        }
      },
      "security": {
        "classification": "internal",
        "visibility": ["demo:analyst"]
      }
    },
    {
      "id": "env.threatened_flora_buffered",
      "type": "vector",
      "schema": "sp.env.threatened_flora_buffered.v1",
      "title": "Threatened Flora (Buffered)",
      "description": "Buffered threatened flora locations for initial risk screening in greenfield developments.",
      "tilejson": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/env.threatened_flora_buffered/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/env.threatened_flora_buffered.pmtiles",
      "parquet": "s3://spatial-packs-dev-ap-southeast-2/wa/land-greenfield/v1/env.threatened_flora_buffered/*.parquet",
      "geometry_type": "Polygon",
      "index": {
        "h3_res": 9
      },
      "stats": {
        "features": 1234,
        "updated_at": "2025-01-01T00:00:00Z",
        "geometry_valid_pct": 100.0,
        "attribute_completeness": {
          "species_group": 1.0
        }
      },
      "security": {
        "classification": "restricted",
        "visibility": ["demo:analyst"]
      }
    },
    {
      "id": "elev.dem_5m",
      "type": "raster",
      "schema": "sp.elev.dem.v1",
      "title": "DEM 5m",
      "description": "5 m resolution DEM for slope and drainage analysis.",
      "cog": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/elev.dem_5m.tif",
      "overviews": "https://cdn.spatial.properties/packs/wa/land-greenfield/v1/elev.dem_5m.tif.ovr",
      "raster_stats": {
        "min": -5.0,
        "max": 450.0,
        "mean": 57.2,
        "nodata": -9999
      },
      "index": {
        "h3_res": 9
      },
      "stats": {
        "updated_at": "2025-01-01T00:00:00Z"
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:viewer", "demo:analyst"]
      }
    }
  ],

  "deltas": [],

  "integrity": {
    "manifest_sha256": "PLACEHOLDER_SHA_FOR_MANIFEST",
    "asset_hashes": {
      "land.tenure.pmtiles": "PLACEHOLDER_SHA_LAND_TENURE",
      "land.title_parcels.pmtiles": "PLACEHOLDER_SHA_PARCELS",
      "planning.scheme_zones.pmtiles": "PLACEHOLDER_SHA_ZONES",
      "env.vegetation.pmtiles": "PLACEHOLDER_SHA_VEG",
      "env.threatened_flora_buffered.pmtiles": "PLACEHOLDER_SHA_TFLORA",
      "elev.dem_5m.tif": "PLACEHOLDER_SHA_DEM"
    }
  },

  "retention": {
    "min_ttl_days": 180
  },

  "security": {
    "classification": "mixed",
    "notes": "Pack contains public, internal, and restricted layers; access controlled per-layer via ABAC."
  },

  "extensions": {
    "stac_collection": "https://api.spatial.properties/stac/collections/spatial.properties:wa:land-greenfield",
    "csp_profile": {
      "profile": "CSP-1",
      "packet_scope_example": {
        "h3": ["8a2a1072b59ffff"],
        "s2_level": null
      },
      "required_layers": [
        "land.title_parcels",
        "land.tenure",
        "planning.scheme_zones",
        "env.vegetation",
        "env.threatened_flora_buffered"
      ]
    }
  }
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
