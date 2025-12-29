# WA Solar Feasibility Spatial Pack — Manifest Outline (v0 → v1)

This document defines a **publication-ready outline** for a first “hero” Spatial Pack for **solar site screening & feasibility** in Western Australia.

It is designed to:
- lead with **buyer outcomes** (screen → shortlist → de-risk → approvals),
- stay compatible with Spatial.Properties’ **pack-first** approach (immutable artifacts + manifest contract),
- ship an **open/public v0** quickly, then extend with **licensed add-ons** (v1+).

---

## 1) Pack identity

**Pack ID (slug):** `wa-solar-feasibility-pack`  
**Display name:** WA Solar Feasibility Pack  
**Primary audience:** Solar developers, planners, feasibility / grid connection teams  
**Primary job-to-be-done:** Identify and shortlist viable solar sites **faster**, surface fatal constraints **earlier**, and produce a **defensible evidence trail** for decisions.

**Geography:** Western Australia (initially); designed to scale to AU states via the same schema.

---

## 2) Pack promise (what a buyer gets)

When a customer loads this pack, they can:
- **Rank candidate land** by solar resource + slope/aspect suitability
- **Filter out constraints** (bushfire prone areas, high-risk environment/heritage proxy layers where licensable)
- **Estimate connection friction** (proximity layers + capacity signal references)
- **Generate a repeatable “screening report”** using deterministic tools/workflows
- **Reproduce decisions** later (same pack version + integrity hashes)

---

## 3) Versioning + immutability policy

- Pack artifacts are **immutable** once published.
- New releases create a new `packVersion` and new artifact URLs.
- Suggested scheme: `YYYY.MM.DD` (or SemVer if you prefer).
- Each artifact includes:
  - `sha256` (required)
  - byte size (required)
  - content type / format metadata (required)

**Example:**
- `packVersion`: `2026.01.15`
- `previousVersion`: `2025.12.01`
- `changeLog`: human summary + machine diff pointers (optional)

---

## 4) Update cadence targets (starting point)

| Layer type | Target cadence | Notes |
|---|---:|---|
| Solar resource grids | monthly/quarterly | depends on source availability |
| DEM / slope / aspect | annual (or stable) | DEM changes slowly unless new LiDAR |
| Soils | annual | depends on source refresh |
| Bushfire prone areas | annual | align to authoritative updates |
| Tenure/zoning (if included) | monthly/quarterly | licensing + authority dependent |
| Grid reference layers | quarterly | “reference” ≠ “capacity guarantee” |

---

## 5) Layer catalog (minimum viable v0)

**Design principle:** v0 ships only layers you can redistribute safely **or** that are clearly link-out references. Licensed / sensitive data moves to v1+ add-ons.

### 5.1 Raster layers (analysis-ready)

| layerId | Type | Description | Artifact formats | Suggested derivations |
|---|---|---|---|---|
| `solar.exposure` | raster | Solar exposure / irradiance proxy grid | COG | optional reproject + tiling |
| `terrain.dem` | raster | Elevation model | COG | hillshade (optional) |
| `terrain.slope` | raster | Derived slope (%) | COG | derived from DEM |
| `terrain.aspect` | raster | Derived aspect (degrees) | COG | derived from DEM |

### 5.2 Vector layers (screening constraints)

| layerId | Type | Description | Artifact formats |
|---|---|---|---|
| `hazard.bushfire_prone_area` | vector | Bushfire prone areas (screening constraint) | GeoParquet + PMTiles |
| `soils.classification` | vector/raster | Soils classification or attributes (where available) | GeoParquet and/or COG |
| `access.roads_reference` | vector | Roads reference for access planning (open where possible) | GeoParquet + PMTiles |
| `grid.infrastructure_reference` | vector | Substations/lines reference layer (subject to licensing) | GeoParquet + PMTiles OR link-out |

### 5.3 Reference links (non-redistributed but crucial)

| refId | Description | Handling |
|---|---|---|
| `grid.capacity_signal` | Network capacity/constraint “signal” tools (maps/viewers) | link-out only (v0), become add-on (v1+) |
| `heritage.inquiry` | Heritage/ACH inquiry systems | link-out; avoid embedding sensitive locations |
| `environment.sensitive_occurrences` | Threatened species/communities occurrences | typically restricted; add-on with controls |

---

## 6) Pack manifest fields (recommended)

> This is an **outline** that your actual `spatialpack.json` should follow.
> Keep it minimal for v0; expand in v1+.

### 6.1 Top-level structure

- `packId` *(string, required)*  
- `packVersion` *(string, required)*  
- `title` *(string, required)*  
- `description` *(string, required)*  
- `region` *(object, required)*  
  - `country` (e.g., `AU`)
  - `state` (e.g., `WA`)
  - `bbox` (WGS84)
  - `aoiIndex` (optional: H3/S2 tiles list for fast filtering)
- `topics` *(array, required)* e.g. `["solar", "site-screening", "constraints", "feasibility"]`
- `createdAt` *(ISO8601, required)*
- `updatedAt` *(ISO8601, required)*
- `sources` *(array, required)* — citations/attribution at dataset-level
- `licensing` *(object, required)*
  - `redistribution` (`allowed`/`restricted`/`byo-license`)
  - `attribution` (text)
  - `constraints` (array of policy notes)
- `integrity` *(object, required)*
  - `manifestSha256`
  - `artifactSha256Policy` (e.g., `required`)
- `layers` *(array, required)* — layer registry with artifacts
- `workflows` *(array, optional for v0, recommended for v1+)*
- `changeLog` *(object, optional but recommended)*
- `links` *(array, optional)* — docs, viewers, capacity tools, inquiry portals

### 6.2 Layer entry fields

Each item in `layers[]`:

- `layerId` *(required)* e.g. `terrain.slope`
- `title` *(required)*
- `description` *(required)*
- `theme` *(optional)* e.g. `terrain`, `solar`, `hazard`, `grid`
- `geometryType` *(vector only)* e.g. `polygon`, `line`, `point`
- `crs` *(required)* e.g. `EPSG:4326` for metadata; artifact may differ
- `bbox` *(required)*
- `resolution` *(raster)* e.g. meters per pixel
- `schema` *(vector)* — pointer to schema doc or embedded column list
- `sourceRef` *(required)* — points to `sources[]` entry
- `licenseRef` *(required)* — points to `licensing` or specific license record
- `artifacts[]` *(required)* — one or more artifacts

### 6.3 Artifact entry fields

Each item in `layer.artifacts[]`:

- `artifactId` *(required)* e.g. `terrain.slope.cog`
- `format` *(required)* e.g. `COG`, `GeoParquet`, `PMTiles`
- `contentType` *(required)* e.g. `image/tiff`, `application/x-parquet`
- `byteSize` *(required)*
- `sha256` *(required)*
- `uri` *(required)* — immutable path (often a signed URL at runtime)
- `createdAt` *(required)*
- `spatialIndex` *(optional)* — e.g. tile pyramid info
- `compression` *(optional)*

---

## 7) Example `spatialpack.json` skeleton (editable)

```json
{
  "packId": "wa-solar-feasibility-pack",
  "packVersion": "2026.01.15",
  "title": "WA Solar Feasibility Pack",
  "description": "Curated spatial layers for solar site screening and early feasibility in Western Australia.",
  "region": {
    "country": "AU",
    "state": "WA",
    "bbox": [112.92, -35.19, 129.00, -13.69]
  },
  "topics": ["solar", "site-screening", "constraints", "feasibility"],
  "createdAt": "2026-01-15T08:00:00Z",
  "updatedAt": "2026-01-15T08:00:00Z",
  "licensing": {
    "redistribution": "allowed",
    "attribution": "See sources[].attribution",
    "constraints": [
      "Capacity layers are link-out only in v0.",
      "Sensitive environmental/heritage datasets are excluded from public v0."
    ]
  },
  "sources": [
    {
      "sourceId": "SOURCE_SOLAR_01",
      "name": "BOM / NASA POWER (placeholder)",
      "attribution": "TBD",
      "license": "TBD",
      "updateCadence": "monthly"
    }
  ],
  "integrity": {
    "manifestSha256": "REPLACE_ME",
    "artifactSha256Policy": "required"
  },
  "layers": [
    {
      "layerId": "terrain.slope",
      "title": "Slope (%)",
      "description": "Derived slope grid for site grading feasibility.",
      "theme": "terrain",
      "crs": "EPSG:4326",
      "bbox": [112.92, -35.19, 129.00, -13.69],
      "sourceRef": "SOURCE_DEM_01",
      "licenseRef": "LIC_OPEN_01",
      "artifacts": [
        {
          "artifactId": "terrain.slope.cog",
          "format": "COG",
          "contentType": "image/tiff",
          "byteSize": 123456789,
          "sha256": "REPLACE_ME",
          "uri": "https://cdn.spatial.properties/packs/wa/solar/2026.01.15/terrain/slope.tif"
        }
      ]
    }
  ],
  "links": [
    {
      "rel": "grid-capacity-signal",
      "title": "Network capacity mapping tool",
      "href": "REPLACE_WITH_LINK"
    }
  ]
}
```

---

## 8) Deterministic workflow hooks (optional v0, recommended v1+)

To prove “pack-first” value quickly, include at least one **deterministic, repeatable** workflow:

### Workflow A: “Solar screening score”
Inputs:
- candidate polygon(s)
- `solar.exposure`, `terrain.slope`, `hazard.bushfire_prone_area`, `soils.classification`

Outputs:
- score table (CSV/Parquet)
- clipped rasters and constraint overlays
- a lightweight “screening report” artifact
- a `manifestPatch` that references derived artifacts

### Workflow B: “Shortlist evidence bundle”
Outputs:
- clipped COGs, subset vectors, and a PDF summary
- re-runable parameters captured in the workflow record

---

## 9) Acceptance criteria (MVP)

- Manifest validates against a JSON Schema
- At least **6 layers** ship (mix of raster + vector + references)
- Artifacts are immutable and hash-verified
- Pack loads in a simple demo app (MapLibre + raster/vector)
- “Screening score” workflow runs end-to-end using pack URIs

---

## 10) Next steps

1) Confirm which datasets you can redistribute for v0.
2) Build **v0 Open/Public pack** with the “minimum viable layers”.
3) Define **v1 add-ons** with tenant-scoped access control.
4) Add a second pack (e.g., transmission corridor screening) using the same schema.

