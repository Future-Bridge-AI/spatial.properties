Demo Pack #2 — WA Resources / Approvals

Pack name (UI): Pilbara Mine Access + Constraints (Demo)
Pack ID: spatial.properties:wa:resources-access-constraints:v1 

00-Overview-and-Brand


What it proves: “One manifest loads everything needed to plan access corridors and work areas—without guessing sources, licensing, or which layer is current.” 

01-Architecture-and-Data-Model

1) Sample spatialpack.json (Resources / Approvals)
{
  "pack_id": "spatial.properties:wa:resources-access-constraints:v1",
  "version": "1.0.1",
  "created_at": "2025-12-03T06:22:00Z",
  "bbox": [113.0, -24.5, 121.8, -19.2],
  "crs": "EPSG:4326",
  "tenant": "demo",

  "license": {
    "id": "SP-LicenseRef-Mixed-Demo-2025",
    "attribution": "See provenance.sources. Some layers are restricted to tenant roles."
  },

  "security": {
    "classification": "public",
    "visibility": ["demo:*"]
  },

  "provenance": {
    "sources": [
      {
        "name": "WA Open Data (illustrative)",
        "version": "2025-11",
        "license": "CC-BY-4.0",
        "sha256": "sha256:aaa...demo"
      },
      {
        "name": "Geoscience Australia (illustrative)",
        "version": "2025-10",
        "license": "CC-BY-4.0",
        "sha256": "sha256:bbb...demo"
      },
      {
        "name": "DMIRS / Tenure extracts (illustrative)",
        "version": "2025-11-20",
        "license": "internal",
        "sha256": "sha256:ccc...demo"
      },
      {
        "name": "Heritage / sensitive constraints (customer-provided)",
        "version": "2025-11-18",
        "license": "restricted",
        "sha256": "sha256:ddd...demo"
      }
    ],
    "derived_from": ["spatial.properties:wa:resources-access-constraints:v1@1.0.0"]
  },

  "layers": [
    {
      "id": "base.map",
      "type": "vector",
      "schema": "sp.base.map.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/base.map/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/base.map/base.map.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/base.map/*.parquet",
      "index": { "h3_res": 9 },
      "stats": { "features": 16200412, "updated_at": "2025-11-30T00:00:00Z" },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "transport.tracks_roads",
      "type": "vector",
      "schema": "sp.wa.transport.tracks_roads.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/transport.tracks_roads/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/transport.tracks_roads/transport.tracks_roads.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/transport.tracks_roads/*.parquet",
      "index": { "h3_res": 10 },
      "stats": {
        "features": 3241200,
        "updated_at": "2025-11-29T00:00:00Z",
        "quality": { "geometry_valid_pct": 99.5, "attr_completeness_pct": 93.1 }
      },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "imagery.sentinel_mosaic_recent",
      "type": "raster",
      "schema": "sp.imagery.mosaic.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/imagery.sentinel_mosaic_recent/tile.json",
      "cog": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/imagery.sentinel_mosaic_recent/imagery.sentinel_mosaic_recent.cog.tif",
      "raster_pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/imagery.sentinel_mosaic_recent/imagery.sentinel_mosaic_recent.pmtiles",
      "index": { "h3_res": 7 },
      "stats": { "pixel_resolution_m": 10, "updated_at": "2025-11-27T00:00:00Z" },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "terrain.dem_30m",
      "type": "raster",
      "schema": "sp.terrain.dem_30m.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/terrain.dem_30m/tile.json",
      "cog": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/terrain.dem_30m/terrain.dem_30m.cog.tif",
      "index": { "h3_res": 7 },
      "stats": { "pixel_resolution_m": 30, "updated_at": "2025-10-31T00:00:00Z" },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "terrain.slope_deg",
      "type": "raster",
      "schema": "sp.terrain.slope.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/terrain.slope_deg/tile.json",
      "cog": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/terrain.slope_deg/terrain.slope_deg.cog.tif",
      "index": { "h3_res": 7 },
      "stats": { "pixel_resolution_m": 30, "updated_at": "2025-11-01T00:00:00Z" },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "land.tenure_mining_titles",
      "type": "vector",
      "schema": "sp.wa.tenure.mining_titles.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/land.tenure_mining_titles/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/land.tenure_mining_titles/land.tenure_mining_titles.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/land.tenure_mining_titles/*.parquet",
      "index": { "h3_res": 8 },
      "stats": { "features": 148220, "updated_at": "2025-11-20T00:00:00Z" },
      "security": { "classification": "internal", "visibility": ["demo:analyst", "demo:planner"] }
    },

    {
      "id": "constraints.environmental_sensitivity",
      "type": "vector",
      "schema": "sp.wa.constraints.environmental.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.environmental_sensitivity/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.environmental_sensitivity/constraints.environmental_sensitivity.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.environmental_sensitivity/*.parquet",
      "index": { "h3_res": 9 },
      "stats": { "features": 912340, "updated_at": "2025-11-25T00:00:00Z" },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "constraints.hydrology_watercourses",
      "type": "vector",
      "schema": "sp.wa.constraints.hydrology.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.hydrology_watercourses/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.hydrology_watercourses/constraints.hydrology_watercourses.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.hydrology_watercourses/*.parquet",
      "index": { "h3_res": 10 },
      "stats": { "features": 1840010, "updated_at": "2025-11-22T00:00:00Z" },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "constraints.heritage_sensitive_sites",
      "type": "vector",
      "schema": "sp.wa.constraints.heritage_sensitive.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.heritage_sensitive_sites/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.heritage_sensitive_sites/constraints.heritage_sensitive_sites.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.heritage_sensitive_sites/*.parquet",
      "index": { "h3_res": 9 },
      "stats": { "features": 48210, "updated_at": "2025-11-18T00:00:00Z" },
      "security": { "classification": "restricted", "visibility": ["demo:planner", "demo:legal"] }
    },

    {
      "id": "safety.no_fly_zones",
      "type": "vector",
      "schema": "sp.safety.no_fly_zones.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/safety.no_fly_zones/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/safety.no_fly_zones/safety.no_fly_zones.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/safety.no_fly_zones/*.parquet",
      "index": { "h3_res": 8 },
      "stats": { "features": 21420, "updated_at": "2025-11-28T00:00:00Z" },
      "security": { "classification": "public", "visibility": ["demo:*"] }
    },

    {
      "id": "regulations.local_rules",
      "type": "vector",
      "schema": "sp.regulations.local_rules.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/regulations.local_rules/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/regulations.local_rules/regulations.local_rules.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/regulations.local_rules/*.parquet",
      "index": { "h3_res": 10 },
      "stats": { "features": 640120, "updated_at": "2025-11-26T00:00:00Z" },
      "security": { "classification": "internal", "visibility": ["demo:analyst", "demo:planner"] }
    }
  ],

  "deltas": [
    {
      "from": "1.0.0",
      "to": "1.0.1",
      "pmtiles_delta": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/deltas/1.0.0-1.0.1/constraints.environmental_sensitivity.pdlt",
      "parquet_delta": "s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/deltas/1.0.0-1.0.1/constraints.environmental_sensitivity/*",
      "size_bytes": 21488219,
      "sha256": "sha256:eee...demo"
    }
  ],

  "offline": {
    "bundles": [
      {
        "name": "lite",
        "max_bytes": 2000000000,
        "includes": [
          "base.map",
          "transport.tracks_roads",
          "imagery.sentinel_mosaic_recent",
          "constraints.environmental_sensitivity",
          "constraints.hydrology_watercourses",
          "safety.no_fly_zones",
          "regulations.local_rules"
        ]
      },
      {
        "name": "full",
        "max_bytes": 12000000000,
        "includes": ["*"]
      }
    ],
    "integrity": { "sha256": "sha256:fff...demo" }
  },

  "integrity": {
    "manifest_sha256": "sha256:111...demo",
    "asset_hashes": {
      "transport.tracks_roads/transport.tracks_roads.pmtiles": "sha256:222...demo",
      "constraints.environmental_sensitivity/constraints.environmental_sensitivity.pmtiles": "sha256:333...demo"
    }
  },

  "retention": { "min_ttl_days": 180 },

  "extensions": {
    "stac_collection": "https://api.spatial.properties/stac/collections/spatial.properties:wa:resources-access-constraints:v1"
  }
}


Why this is the right demo shape: it uses your canonical manifest pattern (layers with PMTiles/COG/GeoParquet, deltas, integrity hashes, offline bundles, STAC linkage, and layer-level classification). 

01-Architecture-and-Data-Model

2) How it should appear in Pack Explorer (layer cards)
Base + Access

transport.tracks_roads
“Existing access network: tracks, gazetted roads, service corridors. The layer planners touch first.”

imagery.sentinel_mosaic_recent
“Fresh mosaic for reality-checking: new disturbances, flood scarring, vegetation.”

Constraints (the approvals story)

constraints.environmental_sensitivity
“Environmental sensitivity zones and buffers. Visual first, queryable when needed.”

constraints.hydrology_watercourses
“Creeks, drainage lines, watercourse buffers — the corridor-killers if you miss them.”

constraints.heritage_sensitive_sites (Restricted)
“Role-gated sensitive heritage constraints: visible only to planner/legal roles.”

Terrain & Safety

terrain.dem_30m + terrain.slope_deg
“Slope and terrain: quick feasibility filter for routes and pad locations.”

safety.no_fly_zones
“Drone/inspection constraints for site recon and compliance.”

Tenure / Rules

land.tenure_mining_titles (Internal)
“Tenement context & boundaries. Not public; role-gated.”

regulations.local_rules (Internal)
“Local constraints: closures, conditions, operational rules.”

This aligns cleanly to the “pack-first SoR → CDN delivery” posture (and your WA wedge messaging). 

00-Overview-and-Brand

 

01-Architecture-and-Data-Model

3) Narrative walkthrough (Resources wedge): “Pick a drill access corridor that won’t blow up approvals”

This is the guided “Tour” content for Pack Explorer (right panel with Next/Back).

Step 1 — Start with the question that actually matters

Goal: “We need an access corridor from existing tracks to a proposed drill area — minimal slope, minimal sensitive constraints, and defensible provenance.”

Step 2 — Load the pack (one click, no layer hunting)

Click Load Pack → Map shows base + tracks + imagery.

Tour microcopy:
“Everything here is versioned. If it changes, it becomes a new version — no silent overwrites.” 

01-Architecture-and-Data-Model

Step 3 — Turn on constraints (so you don’t design fantasy routes)

Toggle:

Environmental sensitivity

Watercourses

No-fly zones

What the demo proves: you can see constraints instantly via PMTiles, then query the same sources via GeoParquet when you need numbers. 

01-Architecture-and-Data-Model

Step 4 — Add tenure + rules (role-gated)

Toggle Mining titles → shows “Internal” badge
Toggle Heritage sensitive sites → shows “Restricted” badge + “Planner/Legal only”

Tour microcopy:
“Layer-level classification is part of the pack. Access control isn’t bolted on later.” 

01-Architecture-and-Data-Model

Step 5 — Do a “real” corridor filter (not magic)

In the “Query / Ops” box:

“Find candidate corridors within 300m of existing tracks, slope < 8°, avoid environmental sensitivity high, avoid watercourse buffers.”

The demo can show results as:

a highlighted corridor polygon

a table (length, % in constraints, avg slope)

a reproducible ops payload (collapsed by default)

Step 6 — Publish a derived layer (the platform moment)

Click Create Derived Layer → choose:

Operation: overlay (candidate corridor ∩ constraints)

Operation: clip (to AOI)

Output: pmtiles

Publish as: derived.corridor_candidates_v1

This is exactly the “tools accept URIs and publish manifest patches” story you’ve defined. 

01-Architecture-and-Data-Model

Step 7 — Show the update model (deltas)

Open “Updates” tab:

“Delta available: 1.0.0 → 1.0.1 (20.5 MB)”

Buttons: Apply delta / Full refresh

Tour microcopy:
“If deltas get too big, clients fall back to full refresh. Determinism first.” 

01-Architecture-and-Data-Model

Step 8 — Offline handoff (field reality)

Open “Offline” tab:

Lite bundle (tracks + imagery + key constraints)

Full bundle (includes internal/restricted layers)

Tour microcopy:
“Offline isn’t a different product. It’s a first-class export of the same pack.” 

00-Overview-and-Brand

4) Pack Explorer UI microcopy (paste-ready)

Internal badge tooltip: “Tenant-only layer. Not public data.” 

01-Architecture-and-Data-Model

Restricted badge tooltip: “Visible only to explicit roles (e.g., planner/legal).” 

01-Architecture-and-Data-Model

Delta badge tooltip: “Update by applying only changed bytes.” 

01-Architecture-and-Data-Model

Provenance tab intro: “Every layer lists sources, versions, and lineage. If we can’t prove it, we don’t publish it.”