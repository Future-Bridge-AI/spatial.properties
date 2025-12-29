Technical Architecturea

0) One-liner

A signed, cacheable, offline-first “context pack” standard (tiled by H3/S2) plus a distribution fabric (edge PoPs + P2P + local beacons) and an Agent SDK that predicts, fetches, verifies, fuses, and expires the right local data—maps, rules, anchors, hazards, 3D, events—on demand.

1) High-level components
[Data Sources] → [Ingest/Normalize] → [Context Pack Builder] → [Registry & Signing]
                                                  ↓
                                           [Distribution Fabric]
                         ┌─────────── Edge PoPs ────────────┬───────────── Local Beacons ────────────┬───────── P2P Mesh ──────────┐
                         │ CDN/HTTP Range (PMTiles)          │ BLE/NFC/UWB pointers + small deltas   │ Wi-Fi Aware / WebRTC / V2X │
                         └───────────────────────────────────┴────────────────────────────────────────┴─────────────────────────────┘
                                                                   ↓
                                                           [Agent SDK on device]
        Route/Intent → Predictive Prefetch → Verify → Local Cache → Sensor Fusion (SLAM/VIO/LiDAR) → Policy Reasoner → Planner

2) The “Context Pack” (the product you sell/standardize)

2.1 Tiling & identity

Spatial index: H3 (res selectable per use case) or S2; packs are cells or cell mosaics (e.g., H3 r=12 for city blocks, r=10 for neighborhoods).

Pack ID: ctx:<publisher>/<region>@<epoch>#<hash>

region = H3 index or named AOI; epoch = UTC minute bucket; hash = content address (Merkle root/CID).

2.2 File/container formats (all read-only, random-access friendly)

Vector base & POIs: PMTiles (MVT), FlatGeobuf (FGB), or GeoParquet (columnar analytics).

Rasters: COG (Cloud-Optimized GeoTIFF) with internal overviews.

Point clouds: COPC (LAZ within octree).

3D city/venue: OGC 3D Tiles (tileset.json + b3dm/i3dm).

Rules & policies: JSON-LD (or Protobuf) “Context Graph” (see §4.3).

Anchors/localization: compact protobufs for visual anchors, fiducials, or venue maps (AR/VPS hints).

Events/deltas: append-only Parquet changelog + small protobuf “hot” feed.

Manifest & signatures: manifest.json + sig.cose (COSE/Ed25519) + optional transparency proof.

2.3 Directory structure (example)

/manifest.json
/sig.cose
/base/world.pmtiles                  # streets, landuse, addresses
/pois/pois.fgb
/rules/context-graph.jsonld          # regs, no-go, hours, speeds, venue SOP
/anchors/visual.anchors.pb
/terrain/terrain.cog
/pc/copc/*.copc.laz
/3d/tileset.json + /3d/tiles/*.b3dm
/events/changes.parquet              # last N days
/events/hotfeed.delta.pb             # high-priority deltas


2.4 Manifest v0.1 (essentials)

{
  "id": "ctx:ctxcdn/perth-cbd@2025-08-14T08:00Z#bafy...cid",
  "region": {"h3": ["8a2a1072b59ffff","8a2a1072b5bffff"]},
  "epoch": "2025-08-14T08:00:00Z",
  "publisher": "ctxcdn",
  "layers": [
    {"name":"base", "format":"pmtiles", "path":"/base/world.pmtiles", "schema":"mvt:v1"},
    {"name":"pois", "format":"flatgeobuf", "path":"/pois/pois.fgb", "schema":"pois:v2"},
    {"name":"rules", "format":"jsonld", "path":"/rules/context-graph.jsonld", "schema":"ctxgraph:v1"},
    {"name":"terrain", "format":"cog", "path":"/terrain/terrain.cog", "crs":"EPSG:4326"},
    {"name":"pc", "format":"copc", "path":"/pc/copc/"},
    {"name":"3d", "format":"3dtiles", "path":"/3d/tileset.json"},
    {"name":"anchors", "format":"pb", "path":"/anchors/visual.anchors.pb"}
  ],
  "hotfeed": {"path":"/events/hotfeed.delta.pb", "ttl_s": 3600},
  "validity": {"not_before":"2025-08-14T08:00:00Z", "not_after":"2025-08-14T20:00:00Z"},
  "license": "ODbL + partner terms",
  "provenance": [
    {"source":"Overture 2025-08-12","layers":["base","pois"]},
    {"source":"City of Perth temporary works API 2025-08-14","layers":["rules","events"]},
    {"source":"BOM weather 10-min grid 2025-08-14","layers":["rules"]}
  ],
  "hashes": {"/base/world.pmtiles":"blake3:...","/rules/context-graph.jsonld":"blake3:..."}
}


2.5 Trust & safety

Signing: COSE/Ed25519 of manifest + per-file BLAKE3 hashes.

Transparency log: append publisher signatures to a Rekor-like log; include inclusion proof in pack.

Revocation: short-lived CRL pack (tiny file) carried by beacons/peers; agents reject revoked manifests offline.

3) Distribution fabric (online + offline)

3.1 Edge PoPs (online)

HTTP/3 (QUIC) with Range requests for PMTiles/COGs.

Predictive prefetch API: POST mission/polyline → returns pack IDs + byte ranges to cache.

Regional PoPs compute delta bundles between epochs to cut bytes.

3.2 Local beacons (offline/micro-online)

BLE: advertising packets broadcast ctx:region, epoch, pack_id, short URL, Eddystone-TLM for freshness.

NFC/QR: static anchor holding long-term pack pointer (content address + optional venue key).

UWB (optional): precise ranging + context pointer in control frames for indoor robots.

LPWAN (LoRa/NR-RedCap): push hotfeed deltas (few KB) for wide areas.

3.3 P2P mesh (agent↔agent & agent↔edge)

Wi-Fi Aware / Wi-Fi Direct or WebRTC DataChannel for chunk exchange with tit-for-tat fairness.

DTN Bundle Protocol v7 for delay-tolerant store-and-forward in sparse networks.

Deduplication: content-addressed chunks (CAR/IPLD blocks) prevent duplicate transfer.

4) Agent SDK (what runs on the robot/phone)

4.1 Modules

Intent→Region Resolver: Converts route/mission into H3 cells (+ buffer corridor) and time window.

Pack Planner: Scores packs by distance, TTL, delta size, risk class; outputs fetch plan.

Fetcher: HTTP/3, BLE pull, P2P; supports range on PMTiles/COG; resumes partials.

Verifier: COSE check, Merkle/BLake3 checks; CRL consult; transparency proof validate.

Local Cache: Content-addressed store with priority LRU (see §4.4).

Fusion Bridge: ROS 2 / Android / iOS adapters; aligns context to SLAM/VIO frame; fuses anchor graph.

Policy Reasoner: Evaluates Context Graph rules into runtime constraints (no-go geofences, speed caps, after-hours restrictions).

Change Listener: Subscribes to hotfeed; updates in-memory overlays without mutating base files.

4.2 Minimal API (pseudo)

// Select packs for next 30 mins & 5km corridor
const plan = ctx.plan({
  polyline: route, durationMins: 30, corridorMeters: 500
});

// Fetch & verify
await ctx.fetch(plan); // pulls base + hotfeed deltas

// Query fused layers
const speedLimit = ctx.rules.getSpeedLimit(here);
const noGo = ctx.rules.isNoGo(here, "UAS");
const anchor = ctx.anchors.match(frame.features);

// Stream updates to planner
ctx.events.on("delta", (d) => planner.applyDelta(d));


4.3 Context Graph (rules & semantics)

Model: JSON-LD (or protobuf) property graph with typed relations:

Entities: Zone, RoadSegment, Venue, Entrance, TimeWindow, Restriction, Hazard.

Relations: appliesTo, validDuring, exceptFor, evidence (provenance).

Evaluation: Compile to constraint sets (e.g., polygon no-go, scalar speed cap, venue SOP checklist).

Validation: SHACL-like schema; reject unknown or conflicting rules unless signed by trusted authority tier.

4.4 Cache policy

Score = α·distance + β·time_to_need + γ·risk_class + δ·byte_cost − ε·freshness

Eviction: multi-queue LRU with pinning for safety-critical layers (rules/hotfeed > base > 3D/PC).

Compression: Zstd for protobufs, Brotli for JSON-LD, native LZ for tiles.

5) Ingest → Normalize → Build

5.1 Ingest

Connectors for Overture/OSM, cadastral/roads, traffic, weather, UTM airspace, construction permits, venue floorplans, AR anchors, point clouds, photogrammetry.

Schema registry: versioned contracts for each layer.

5.1.1 Schema Registry Architecture

The schema registry provides canonical, versioned schemas for every layer type:

URI Convention: `https://schemas.spatial.properties/v1/{namespace}/{name}@{version}`

Examples:
- `schemas.spatial.properties/v1/base/transport/roads@12.1.0`
- `schemas.spatial.properties/v1/base/land/parcels@3.2.0`

Schema Artifacts include:
- JSON Schema for validation
- Encoding profiles (geoparquet@1, mvt@1, geojson@1)
- Conformance rules (required properties, geometry constraints, value ranges)
- Documentation + examples

Extensions Framework:
- Composable add-ons via `extensions[]` array in layer entries
- Third-party extensions use vendor prefix: `wa:planning-constraints@0.1.0`
- Maturity levels: `experimental` → `candidate` → `stable` → `deprecated`

Validation Service:
- CLI: `spatialpack validate --pack spatialpack.json`
- CI integration: GitHub Actions, GitLab CI templates
- Conformance reports: JSON output with validator version, rule-set hash, pass/fail, error/warn counts

See `Docs/architecture/03-Schema-Registry-and-Validation.md` for full specification.

5.2 Normalize

CRS normalization (EPSG:4326 + local projected where needed).

Topology fixes (snap, simplify, validate).

Change detection: spatial joins vs prior epoch; diff outputs in Parquet (adds/mods/deletes).

5.3 Build

Vector tiling (tippecanoe + custom filters by risk/use).

PMTiles index build; COG overviews; COPC subsampling for density tiers.

3D tilesets with per-tile metadata (LOD, bbox, lastModified).

Manifest assembly → sign → push to Registry → publish to PoPs & Beacons.

6) Security, privacy, licensing

AuthZ tiers: public, municipal-trusted, venue-private (encrypted layer payloads; keys via short-lived tokens burned into beacons).

PII guardrails: no raw CCTV or device IDs; only derived, non-identifying hazards/events.

Provenance chain: every rule/event has evidence link (URL, hash, or notarized statement).

Offline revocation: tiny CRL packs; agents prefer newest CRL seen from any source.

6.1 Trust Artifacts (Two-Track Strategy)

Track A — Ship Now (always valuable):

A1: Signed Manifests + Integrity Receipts
- `integrity.json`: Per-asset BLAKE3/SHA256 hashes
- `spatialpack.json.sig`: COSE/Ed25519 manifest signature
- Verification CLI: `spatialpack verify --pack <uri>`
- Works offline with cached CRL

A2: Machine-Readable Contracts
- `contract.json`: License, attribution, redistribution, derivatives, constraints
- `policy.json`: Classification, access constraints, visibility rules
- Manifest references via `contract_ref` and `policy_ref` fields

A3: UDG-lite Lineage Graph (Phase 2)
- Graph materialization from STAC + manifests + provenance
- API: `GET /v1/graph/pack/{pack_id}`, `POST /v1/graph/query`
- Policy-aware redaction based on tenant/role

A4: Operation Trace Envelope
- Every event includes: op_id, op_type, subjects, actor, timestamp, status, inputs, outputs, provenance, trace
- Events: `pack.published`, `tool.completed`, `license.violation`

Track B — Ship on Pull (optional, Spatial Web compatibility):

B1: SWID/DID everywhere (if partner/buyer pull exists)
B2: HSML/JSON-LD exports (if partner request)
B3: HSTP-like operations (if ecosystem integration needed)
B4: Public UDG (if marketplace scale reached)

Activation criteria for Track B: ≥2 buyers say "Spatial Web compliance changes procurement outcome" OR strategic partner requires DID/HSML alignment.

See `Docs/architecture/04-Trust-and-Compatibility-Strategy.md` for full strategy.

7) Ops, SLOs, and telemetry (privacy-preserving)

SLO examples:

95th pct pack fetch < 3s for ≤50MB over PoP; < 30s over BLE.

Hotfeed propagation: < 2 min within 5km of event.

Edge metrics: popularity of packs, delta hit-rates, per-layer byte costs.

On-device telemetry (opt-in): Bloom-filter summaries (no raw coordinates) for cache misses/hazards encountered to improve future packing.

8) Interop & standards

Align with OGC (3D Tiles, GeoPackage), COG/COPC, PMTiles, FlatGeobuf/GeoParquet.

Define an open “OGC GeoContext Pack” profile (manifest + signing + deltas + rule schemas).

Publish a conformance suite + sample packs (e.g., Perth CBD and Fremantle Port).

9) Example sizing (rough guide, city core ~3×3 km)

Base (PMTiles, zoom 16): ~30–80 MB

POIs (FGB): 5–20 MB

Rules/Context Graph: 0.5–5 MB

Terrain (COG, 1–2 m): 20–60 MB

3D Tiles (LOD1/2 photogrammetry): 200–800 MB

Anchors: 1–10 MB

Hotfeed (rolling 24h): 0.1–2 MB

Agents pick subsets; safety-critical stays small.

9.1 WA Solar Feasibility Pack (Hero Example)

The WA Solar Feasibility Pack demonstrates pack sizing for site selection use cases:

| Layer | Format | Estimated Size | License |
|-------|--------|----------------|---------|
| Solar exposure | COG | 50-100 MB | Open (BOM/NASA) |
| DEM | COG | 100-200 MB | Open (National DEM) |
| Slope | COG | 50-100 MB | Derived |
| Aspect | COG | 50-100 MB | Derived |
| Bushfire | GeoParquet + PMTiles | 20-50 MB | Open (WA) |
| Soils | GeoParquet/COG | 30-80 MB | Open (ASRIS) |
| Roads | GeoParquet + PMTiles | 50-100 MB | Open (OSM) |
| **v0 Total** | | **350-730 MB** | |

Use case: Solar developers ranking candidate land by solar resource, slope, and constraint layers.

Release strategy:
- v0.1: Open data only (6+ layers)
- v0.2: Add flood/drainage proxy, protected areas
- v1.0: Add-ons for cadastre (BYO-license), commercial irradiance (contract)

See `Docs/planning/07-Solar-Pack-Example-and-Licensing.md` for full details.

10) MVP slice (8–10 weeks)

Spec v0.1: manifest + signing + 5 core layers (base, POIs, rules, anchors, hotfeed).

Builder: CLI + CI pipeline to cut Perth-CBD r=10 H3 packs hourly.

Edge PoP + Beacon: single PoP; 10 BLE beacons around a test route.

Agent SDK: Android + ROS 2 reference; predictive prefetch; cache; rule evaluation; SLAM alignment.

Demo: a delivery-bot sim (Gazebo/Isaac) + a real phone-based AR guide crossing between beacon zones, staying compliant with local rules when offline.

11) Moats & business hooks

Open spec, premium data. Monetize premium sources (traffic/UTM/venues) and SLA’d refresh.

Trust & provenance. Signed packs + transparency log become the default “safe to operate” evidence.

Ecosystem. Marketplace for publishers to sell/offer verified local layers into context packs.

12) Immediate next steps (actionable)

Finalize Manifest v0.1 (I can draft the JSON Schema).

Choose H3 resolution policy per agent class (UAS vs ground robot vs AR).

Lock formats (PMTiles + FGB + COG + 3D Tiles + COPC + JSON-LD).

Stand up Registry & Rekor-like transparency (Sigstore stack).

Build Perth-CBD pack and a tiny Beacon app (BLE advertiser on RasPi).

Ship SDK alpha with: plan→fetch→verify→cache→rules→hotfeed.