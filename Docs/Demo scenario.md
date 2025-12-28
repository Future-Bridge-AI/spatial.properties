Demo scenario

“Pick a drill access corridor that won’t blow up approvals.”
We’ll create three derived layers:

Buffer candidate corridor around existing tracks

Overlay constraints intersection + scoring

Clip + Publish a final “recommended corridor” layer back into the pack

Assume base pack:

pack_id: spatial.properties:wa:resources-access-constraints:v1

version: 1.0.1

key layers: transport.tracks_roads, constraints.environmental_sensitivity, constraints.hydrology_watercourses, constraints.heritage_sensitive_sites (restricted), terrain.slope_deg 

01-Architecture-and-Data-Model

A) Buffer — “corridor search band” around existing tracks

Purpose: Create a candidate corridor band (e.g., 300m) around existing tracks/roads.
Tool contract style: matches your buffer example: input is a URI, output is publishable. 

02-Services-and-APIs

{
  "job": {
    "id": "demo-job-001",
    "title": "Buffer tracks to create corridor band",
    "tenant": "demo",
    "pack_id": "spatial.properties:wa:resources-access-constraints:v1",
    "pack_version": "1.0.1",
    "persona": "planner"
  },
  "tool": "buffer",
  "input": {
    "layer_uri": "pmtiles://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/transport.tracks_roads/transport.tracks_roads.pmtiles",
    "distance": { "value": 300, "units": "m" },
    "dissolve": true,
    "options": {
      "simplify_tolerance_m": 1.0,
      "preserve_topology": true
    }
  },
  "output": {
    "format": "pmtiles",
    "publish": true,
    "layer_name": "derived.corridor_band_300m",
    "schema": "sp.derived.corridor_band.v1",
    "visibility": ["demo:planner", "demo:analyst"],
    "classification": "internal"
  },
  "audit": {
    "reason": "Create a candidate search corridor for access planning",
    "source_layers": ["transport.tracks_roads"]
  }
}


Expected demo result in UI

New layer appears: derived.corridor_band_300m

Pack Explorer shows “Published to pack version 1.0.1 as derived layer” (or optionally 1.0.2 if you want the demo to show “publish creates a new version”). Your architecture supports immutable versioned paths; demo can show either. 

01-Architecture-and-Data-Model

B) Overlay — “what constraints does the corridor touch?” + score

Purpose: Compute intersections between corridor band and constraints, then annotate candidate areas with a simple risk score.

This uses your overlay tool concept (MCP tools include overlay, and they produce published layers + manifest patches). 

02-Services-and-APIs

{
  "job": {
    "id": "demo-job-002",
    "title": "Overlay corridor band with constraints and score",
    "tenant": "demo",
    "pack_id": "spatial.properties:wa:resources-access-constraints:v1",
    "pack_version": "1.0.1",
    "persona": "planner"
  },
  "tool": "overlay",
  "input": {
    "a_layer_uri": "pmtiles://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/derived.corridor_band_300m/derived.corridor_band_300m.pmtiles",
    "b_layers": [
      {
        "id": "env",
        "layer_uri": "pmtiles://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.environmental_sensitivity/constraints.environmental_sensitivity.pmtiles",
        "weight": 3
      },
      {
        "id": "hydro",
        "layer_uri": "pmtiles://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.hydrology_watercourses/constraints.hydrology_watercourses.pmtiles",
        "weight": 2
      },
      {
        "id": "heritage",
        "layer_uri": "pmtiles://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/constraints.heritage_sensitive_sites/constraints.heritage_sensitive_sites.pmtiles",
        "weight": 10,
        "requires_role": "demo:legal"
      }
    ],
    "operation": "intersection",
    "attributes": {
      "emit_fields": ["env.class", "hydro.type", "heritage.sensitivity"],
      "compute": [
        {
          "field": "risk_score",
          "expr": "(env.present? * 3) + (hydro.present? * 2) + (heritage.present? * 10)"
        }
      ]
    }
  },
  "output": {
    "format": "geoparquet",
    "publish": true,
    "layer_name": "derived.corridor_constraints_scored",
    "schema": "sp.derived.corridor_constraints_scored.v1",
    "visibility": ["demo:planner", "demo:analyst"],
    "classification": "internal"
  },
  "audit": {
    "reason": "Score corridor candidates by constraint overlap",
    "source_layers": [
      "derived.corridor_band_300m",
      "constraints.environmental_sensitivity",
      "constraints.hydrology_watercourses",
      "constraints.heritage_sensitive_sites"
    ]
  }
}


UI moment that sells governance

If the viewer persona is not demo:legal, Pack Explorer can show:

“Heritage layer omitted (restricted). Score computed without restricted layer.”
That maps to your ABAC/RBAC, classification + visibility approach. 

02-Services-and-APIs

 

07-Network-and-Security-Archite…

C) Clip — “final recommended corridor” within an AOI + publish as PMTiles

Purpose: Clip scored results to a user-defined AOI and publish a final corridor layer suitable for fast web rendering (PMTiles). 

02-Services-and-APIs

{
  "job": {
    "id": "demo-job-003",
    "title": "Clip scored corridor to AOI and publish PMTiles",
    "tenant": "demo",
    "pack_id": "spatial.properties:wa:resources-access-constraints:v1",
    "pack_version": "1.0.1",
    "persona": "planner"
  },
  "tool": "clip",
  "input": {
    "layer_uri": "parquet://s3://spatial-packs-demo/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/derived.corridor_constraints_scored/*.parquet",
    "clip_geom": {
      "type": "Polygon",
      "coordinates": [
        [
          [116.72, -20.92],
          [116.72, -20.78],
          [116.95, -20.78],
          [116.95, -20.92],
          [116.72, -20.92]
        ]
      ]
    },
    "where": "risk_score <= 4",
    "options": {
      "multipart": false,
      "simplify_tolerance_m": 2.0
    }
  },
  "output": {
    "format": "pmtiles",
    "publish": true,
    "layer_name": "derived.recommended_corridor_v1",
    "schema": "sp.derived.recommended_corridor.v1",
    "visibility": ["demo:planner", "demo:field_ops"],
    "classification": "internal"
  },
  "audit": {
    "reason": "Produce a fast, map-ready recommended corridor for review and field use",
    "source_layers": ["derived.corridor_constraints_scored"]
  }
}

D) Publish step — explicit manifest patch (what Pack Explorer can display)

Your docs explicitly call out that MCP tools produce published pack layers + manifest patches. So in the demo, after each job completes, show the patch in a collapsible “What changed?” panel. 

02-Services-and-APIs

Example patch returned from Job 003:

{
  "pack_id": "spatial.properties:wa:resources-access-constraints:v1",
  "base_version": "1.0.1",
  "patch": {
    "op": "add",
    "path": "/layers/-",
    "value": {
      "id": "derived.recommended_corridor_v1",
      "type": "vector",
      "schema": "sp.derived.recommended_corridor.v1",
      "tilejson": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/derived.recommended_corridor_v1/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/derived.recommended_corridor_v1/derived.recommended_corridor_v1.pmtiles",
      "index": { "h3_res": 10 },
      "stats": {
        "features": 482,
        "updated_at": "2025-12-03T06:30:12Z",
        "quality": { "geometry_valid_pct": 99.8 }
      },
      "security": {
        "classification": "internal",
        "visibility": ["demo:planner", "demo:field_ops"]
      }
    }
  },
  "integrity": {
    "manifest_sha256": "sha256:demo-new-manifest-hash",
    "asset_hashes": {
      "derived.recommended_corridor_v1/derived.recommended_corridor_v1.pmtiles": "sha256:demo-asset-hash"
    }
  }
}


This also reinforces your immutability + integrity hash story. 

01-Architecture-and-Data-Model

E) Optional “job envelope” for the MCP Orchestrator (if you want it to look operational)

Your services doc says orchestration via Temporal/Argo and events like tool.completed. If you want an extra layer of realism, you can show a simplified “job submission” and “completion” pair in the UI. 

02-Services-and-APIs

Submit

{
  "endpoint": "POST /v1/mcp/execute",
  "idempotency_key": "demo-job-003",
  "payload_ref": "inline",
  "callback": {
    "type": "webhook",
    "url": "https://app.spatial.properties/demo/mcp/callbacks/demo-job-003"
  }
}


Completion event

{
  "event": "tool.completed",
  "job_id": "demo-job-003",
  "status": "succeeded",
  "duration_ms": 18340,
  "outputs": [
    "pmtiles://cdn.spatial.properties/packs/spatial.properties:wa:resources-access-constraints:v1/1.0.1/derived.recommended_corridor_v1/derived.recommended_corridor_v1.pmtiles"
  ]
}

F) Pack Explorer “Tour” script (tight, paste-ready)

You can wire these three payloads to a guided panel:

Buffer: “Create a 300m search band around tracks.”

Overlay: “Intersect with constraints and score.”

Clip + Publish: “Filter to low-risk and publish a map-ready corridor.”

That’s the demo: deterministic, governed, and publishable—exactly your product thesis. 

00-Overview-and-Brand