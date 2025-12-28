Below is drop-in “Pack Explorer” demo content you can ship on the website: a sample spatialpack.json, a layer set tailored to the WA utilities/resources wedge, plus a narrative walkthrough that shows why “pack-first” matters (performance, governance, determinism, offline). 

00-Overview-and-Brand

 

01-Architecture-and-Data-Model

Demo note (use this verbatim in small print in the UI):
“This is illustrative demo content. Sources, licensing, and coverage vary by customer, jurisdiction, and contract. Your packs enforce license/provenance gates at publish time.” 

02-Services-and-APIs

1) Sample spatialpack.json (WA Utilities + Bushfire Risk — Pilbara)

This example is designed to feel real in your Pack Explorer: versioned URLs, immutable paths, mixed classification at the layer level, open formats (GeoParquet/PMTiles/COG), STAC linkage, and deltas. 

01-Architecture-and-Data-Model

 

02-Services-and-APIs

{
  "pack_id": "spatial.properties:wa:utilities-risk:v1",
  "version": "1.2.0",
  "created_at": "2025-12-01T02:14:00Z",
  "bbox": [-121.8, -23.6, -114.7, -16.3],
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
        "name": "Bureau of Meteorology / Hazards feed (illustrative)",
        "version": "2025-11-28",
        "license": "public",
        "sha256": "sha256:ccc...demo"
      },
      {
        "name": "Utility Asset Register (customer-provided)",
        "version": "2025-11-20",
        "license": "internal",
        "sha256": "sha256:ddd...demo"
      }
    ],
    "derived_from": ["spatial.properties:wa:utilities-risk:v1@1.1.0"]
  },

  "layers": [
    {
      "id": "base.map",
      "type": "vector",
      "schema": "sp.base.map.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/base.map/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/base.map/base.map.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/base.map/*.parquet",
      "index": { "h3_res": 9 },
      "stats": {
        "features": 18652340,
        "updated_at": "2025-11-30T00:00:00Z",
        "quality": {
          "geometry_valid_pct": 99.2,
          "attr_completeness_pct": 96.8
        }
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:*"]
      }
    },
    {
      "id": "poi.core",
      "type": "vector",
      "schema": "sp.poi.core.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/poi.core/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/poi.core/poi.core.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/poi.core/*.parquet",
      "index": { "h3_res": 9 },
      "stats": {
        "features": 248120,
        "updated_at": "2025-11-29T00:00:00Z"
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:*"]
      }
    },
    {
      "id": "utilities.power_network",
      "type": "vector",
      "schema": "sp.wa.utilities.power_network.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/utilities.power_network/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/utilities.power_network/utilities.power_network.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/utilities.power_network/*.parquet",
      "index": { "h3_res": 9 },
      "stats": {
        "features": 5123480,
        "updated_at": "2025-11-20T00:00:00Z"
      },
      "security": {
        "classification": "restricted",
        "visibility": ["demo:analyst", "demo:field_ops"]
      }
    },
    {
      "id": "regulations.local_rules",
      "type": "vector",
      "schema": "sp.regulations.local_rules.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/regulations.local_rules/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/regulations.local_rules/regulations.local_rules.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/regulations.local_rules/*.parquet",
      "index": { "h3_res": 10 },
      "stats": {
        "features": 1189040,
        "updated_at": "2025-11-25T00:00:00Z"
      },
      "security": {
        "classification": "internal",
        "visibility": ["demo:analyst", "demo:field_ops"]
      }
    },
    {
      "id": "safety.no_fly_zones",
      "type": "vector",
      "schema": "sp.safety.no_fly_zones.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/safety.no_fly_zones/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/safety.no_fly_zones/safety.no_fly_zones.pmtiles",
      "parquet": "s3://spatial-packs-demo/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/safety.no_fly_zones/*.parquet",
      "index": { "h3_res": 8 },
      "stats": {
        "features": 18420,
        "updated_at": "2025-11-28T00:00:00Z"
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:*"]
      }
    },
    {
      "id": "risk.bushfire_risk_index",
      "type": "raster",
      "schema": "sp.risk.bushfire_index.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/risk.bushfire_risk_index/tile.json",
      "cog": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/risk.bushfire_risk_index/risk.bushfire_risk_index.cog.tif",
      "raster_pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/risk.bushfire_risk_index/risk.bushfire_risk_index.pmtiles",
      "index": { "h3_res": 7 },
      "stats": {
        "pixel_resolution_m": 30,
        "updated_at": "2025-11-30T00:00:00Z"
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:*"]
      }
    },
    {
      "id": "elevation.dem_30m",
      "type": "raster",
      "schema": "sp.elevation.dem_30m.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/elevation.dem_30m/tile.json",
      "cog": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/elevation.dem_30m/elevation.dem_30m.cog.tif",
      "index": { "h3_res": 7 },
      "stats": {
        "pixel_resolution_m": 30,
        "updated_at": "2025-10-31T00:00:00Z"
      },
      "security": {
        "classification": "public",
        "visibility": ["demo:*"]
      }
    }
  ],

  "deltas": [
    {
      "from": "1.1.0",
      "to": "1.2.0",
      "pmtiles_delta": "https://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/deltas/1.1.0-1.2.0/utilities.power_network.pdlt",
      "parquet_delta": "s3://spatial-packs-demo/packs/spatial.properties:wa:utilities-risk:v1/deltas/1.1.0-1.2.0/utilities.power_network/*",
      "size_bytes": 38192712,
      "sha256": "sha256:eee...demo"
    }
  ],

  "offline": {
    "bundles": [
      {
        "name": "lite",
        "max_bytes": 2000000000,
        "includes": ["base.map", "poi.core", "risk.bushfire_risk_index", "safety.no_fly_zones", "regulations.local_rules"]
      },
      {
        "name": "full",
        "max_bytes": 10000000000,
        "includes": ["*"]
      }
    ],
    "integrity": { "sha256": "sha256:fff...demo" }
  },

  "integrity": {
    "manifest_sha256": "sha256:111...demo",
    "asset_hashes": {
      "base.map/base.map.pmtiles": "sha256:222...demo",
      "utilities.power_network/utilities.power_network.pmtiles": "sha256:333...demo"
    }
  },

  "retention": { "min_ttl_days": 180 },

  "extensions": {
    "stac_collection": "https://api.spatial.properties/stac/collections/spatial.properties:wa:utilities-risk:v1"
  }
}


Why this matches your product reality:

Pack-first SoR (layers include GeoParquet + delivery formats) 

01-Architecture-and-Data-Model

Immutable, versioned delivery (URLs include pack + version; served as signed URLs in practice) 

02-Services-and-APIs

WA wedge alignment (utilities/resources + bushfire risk/field ops) 

00-Overview-and-Brand

Offline bundles + deltas are first-class (exactly what field crews and edge agents need) 

01-Architecture-and-Data-Model

2) Example layers (how they should appear in Pack Explorer)

Use this as the layer list + descriptions in the demo UI (cards or accordion). It’s written to sell to WA utility operators and show investors you have hard edges.

Base Context

base.map (PMTiles + GeoParquet)
“Roads, tracks, buildings, admin boundaries. Fast to render, queryable for analytics.”

poi.core (PMTiles + GeoParquet)
“Operational POIs: depots, hospitals, fuel, airstrips, helipads, key sites.”

Utilities

utilities.power_network (Restricted) (PMTiles + GeoParquet)
“Lines, poles, towers, substations, feeders. Restricted by role. Designed for asset integrity + outage response.”
Demo moment: show “Restricted” badge and the role list (demo:analyst, demo:field_ops).

Risk & Terrain

risk.bushfire_risk_index (COG + Raster PMTiles)
“30m bushfire risk index suitable for quick triage and corridor planning.”

elevation.dem_30m (COG)
“Terrain context for slope/hillshade and access planning.”

Rules & Safety

regulations.local_rules (Internal) (PMTiles + GeoParquet)
“Local rules & restrictions: access constraints, closures, speed limits, work rules.”

safety.no_fly_zones (PMTiles + GeoParquet)
“No-fly zones (for drones/inspection missions) and exclusion areas.”

These “required layers” align with the CSP-1 normative set (base map, POIs, local rules, safety) so later your demo can show “CSP-1 Ready” as a real claim. 

01-Architecture-and-Data-Model

3) Bonus: a CSP-1 context packet for a Pilbara field crew (sample JSON)

This is the “agent/edge” payoff: a small packet scoped to a working area (H3 ring), with required layers + policy overlays + live topics + client hints. The spec guidance is ≤50MB target, ≤200MB hard cap. 

01-Architecture-and-Data-Model

{
  "pack_id": "spatial.properties:wa:context-packet:v1",
  "version": "1.2.0",
  "created_at": "2025-12-01T03:10:00Z",
  "bbox": [-117.0, -21.0, -116.6, -20.6],
  "crs": "EPSG:4326",
  "tenant": "demo",

  "provenance": {
    "derived_from": ["spatial.properties:wa:utilities-risk:v1@1.2.0"]
  },

  "profile": "CSP-1",
  "packet_scope": {
    "h3": ["8a2a1072b59ffff", "8a2a1072b597fff", "8a2a1072b587fff"],
    "s2_level": null
  },

  "required_layers": [
    "base.map",
    "poi.core",
    "regulations.local_rules",
    "safety.no_fly_zones",
    "risk.bushfire_risk_index"
  ],

  "policy_overlays": {
    "schema": "sp.policy.v1",
    "overlays": [
      {
        "id": "roads.speed_limits",
        "jurisdiction": "state/local",
        "source": "transport.authority (illustrative)",
        "license": "public"
      },
      {
        "id": "fire.total_fire_ban",
        "jurisdiction": "wa",
        "source": "hazards.authority (illustrative)",
        "license": "public"
      }
    ]
  },

  "live_layers": {
    "topics": [
      "live.weather.alerts",
      "live.hazards.incidents",
      "live.traffic.flow"
    ],
    "broker": "nats",
    "qos": "at-least-once"
  },

  "client_hints": {
    "prefetch_radius_m": 800,
    "delta_apply_max_bytes": 50000000,
    "ttl_seconds": 3600
  }
}


This connects directly to your “context packets for agents” positioning and the Edge/Sync surfaces. 

00-Overview-and-Brand

 

02-Services-and-APIs

4) Narrative walkthrough (WA wedge): “Vegetation clearance + outage readiness in the Pilbara”

Use this as the guided story mode inside Pack Explorer (a right-hand “Tour” panel with Next/Back).

Step 1 — Find the pack

Search: “Pilbara utilities bushfire risk”
Result card:

WA Utilities + Bushfire Risk (Pilbara)

Badges: PMTiles, COG, GeoParquet, Offline, Deltas, CSP-1 Ready 

01-Architecture-and-Data-Model

Step 2 — Understand trust fast (provenance + licensing)

Open the pack → “Provenance” tab shows:

source list with versions + checksums

derived-from chain (1.1.0 → 1.2.0)

“License gates: Passed” (microcopy: “Incompatible sources are blocked before publish.”) 

02-Services-and-APIs

Step 3 — Turn on the WA-relevant layers

In the layer pane:

Toggle utilities.power_network → prompts: “Restricted layer — requires Field Ops or Analyst role.”

Toggle risk.bushfire_risk_index → instant visual overlay

Toggle regulations.local_rules → highlights access constraints for crews 

00-Overview-and-Brand

Step 4 — Do a real planning question (without pretending it’s magic)

In the “Ask / Query” box (even if it’s just scripted for demo):

“Show distribution lines inside high bushfire risk cells near accessible tracks.”

What Pack Explorer demonstrates (no fluff):

map preview uses PMTiles (fast)

analytics view queries GeoParquet (deterministic + reproducible) 

01-Architecture-and-Data-Model

 

02-Services-and-APIs

Step 5 — Create a derived layer (the ‘platform’ moment)

Click Create Derived Layer → choose:

Operation: buffer (100m) around utilities.power_network

Output: pmtiles

Publish back into this pack as derived.veg_clearance_buffer

If you want the demo to feel very real, show the tool payload (collapsed by default):

{
  "tool": "buffer",
  "input": {
    "layer_uri": "pmtiles://cdn.spatial.properties/packs/spatial.properties:wa:utilities-risk:v1/1.2.0/utilities.power_network/utilities.power_network.pmtiles",
    "distance": { "value": 100, "units": "m" },
    "dissolve": false
  },
  "output": {
    "format": "pmtiles",
    "publish": true,
    "layer_name": "derived.veg_clearance_buffer"
  }
}


This matches your MCP contract style: tools accept URIs and return publishable layers/manifest patches. 

02-Services-and-APIs

Step 6 — Show updates as deltas (field reality)

Open “Updates” tab:

“Delta available: 1.1.0 → 1.2.0 (36.4 MB)”

Buttons: Apply delta / Full refresh

Microcopy: “If deltas exceed thresholds, clients fall back to a full refresh.” 

01-Architecture-and-Data-Model

Step 7 — Generate a field-ready packet (CSP-1)

Click Create Context Packet (CSP-1):

Set “Work area”: Karratha depot (demo pin)

Set “Radius”: 800m

Output: “Packet target size ≤ 50MB”

Include toggles: “+ Live hazards”, “+ No-fly zones” 

01-Architecture-and-Data-Model

Step 8 — Offline bundle (the “yes, crews can actually use it” finish)

Click “Offline”:

Lite bundle (base + risk + rules)

Full bundle (includes restricted assets)

“Integrity verified” checkmark (sha256) 

01-Architecture-and-Data-Model

5) Microcopy you can paste directly into the Pack Explorer UI

Immutability badge tooltip: “This version will never change. New data publishes as a new version.” 

02-Services-and-APIs

Delta badge tooltip: “Update efficiently by applying only the changed bytes.” 

01-Architecture-and-Data-Model

Restricted layer tooltip: “Access controlled by classification + role (ABAC/RBAC).” 

02-Services-and-APIs

CSP-1 tooltip: “A small, H3/S2-scoped context packet for agents and offline field work.”