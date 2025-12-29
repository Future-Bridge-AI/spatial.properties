Market map (by archetype)

1) Open basemap & tiling ecosystems (foundation data)

Overture Maps Foundation (open, cloud-hosted layers: Admins/Base/Buildings/Divisions/Places/Transportation; Addresses underway). Strong for global coverage + open licensing, outputs in cloud-native formats (Parquet/GeoParquet). Good “base layer” for context packs. 
docs.overturemaps.org
Registry of Open Data
Overture Maps Foundation

OpenStreetMap (+ Geofabrik extracts / planet files). Global, fast-updated, but variable quality; extracts are easy to pre-cut per region—useful for making offline packs. 
Geofabrik
OpenStreetMap

Packaging/transport formats used by the ecosystem today (adjacent to what we’d ship):

PMTiles (single-file, random-access tile archive; HTTP range-friendly; read-only). Good candidate for “context pack” basemap layers. 
docs.protomaps.com

MBTiles (SQLite-based tiles). Battle-tested offline container; wide client support. 
GitHub

OGC GeoPackage (SQLite container for vectors & raster tiles). Standardized, portable—could carry more than just map tiles in one file. 
Open Geospatial Consortium

Relevance: These don’t solve “what local knowledge should an AI agent carry right now,” but they’re the raw materials (and the file/tiling patterns) most context-pack products will build on.

2) Map SDKs with true offline modes (mobile/edge developer tooling)

Mapbox iOS/Android – robust offline “tile/style pack” APIs with quotas & TOS limits (no redistribution of Mapbox server-fetched packs). Great UX, but licensing restricts distributing pre-baked context packs. 
Mapbox

HERE SDK – full offline maps/nav SDKs widely used in automotive & enterprise (good technical fit for agents; licensing varies by use). 
Niantic Spatial, Inc.

TomTom SDKs – comparable to HERE; offline & traffic/nav features. (Docs exist similarly to HERE.) 
libp2p

Relevance: Closest today for rendering & nav offline, but not designed as a neutral “context CDN” you can redistribute or sign as your own packs—licensing + proprietary tiles are the friction.

3) HD maps for ADAS/AV (centimeter-level lanes, semantics, change-feeds)

HERE HD Live Map – lane-level HD map with live change updates; used in BMW Level-3 features. Strong data operations + OEM ties. 
HERE
+1

TomTom HD Map + RoadDNA – HD map + localization layers for redundancy across sensors. 
download.tomtom.com
TomTom

Mobileye REM – crowdsourced HD mapping updated from fleet scale; powering ADAS/AV stacks. 
Mobileye

Relevance: These are automotive-centric pipelines and not packaged for general AI agents or arbitrary domains (drones, wearables, service robots). Great incoming signal sources to refresh “context packs,” but not neutral distribution layers.

4) AR/VPS “visual localization” layers (micro-localization & anchors)

Google ARCore Geospatial API (VPS) – uses Street View-derived global localization model; anchors anywhere VPS covers. Online-oriented, but shows what “micro-context” looks like. 
Google for Developers

Niantic Lightship VPS – centimeter-level localization with crowd-scanned POIs; public/private locations; SDKs for content anchoring. 
Niantic Spatial, Inc.

Apple ARKit Location/Geo Anchors – OS-level anchors tied to lat/lon/alt; availability varies, and typically requires fetching localization imagery. 
Apple Developer

Relevance: Excellent local pose sources an agent would want. Not packaged as offline distributable “context bundles,” and most require a network lookup. Big signal for what to include (anchors, meshes, “where AR content sticks”).

5) Domain-specific “dynamic context” feeds (to down-select per locale)

Airspace / Drone UTM – Altitude Angel GuardianUTM (national-scale U-space services). Signals what “local rules & no-go zones” could look like. 
altitudeangel.com

Traffic / mobility – HERE Traffic, TomTom Traffic, INRIX provide real-time layers; useful for agent decision-making if we can snapshot deltas into packs. 
arXiv
libp2p
docs.ipfs.tech

POI / Places – Foursquare Places (rich POI + metadata; changing pricing/API surface). Could seed “what’s around me” in packs. 
docs.foursquare.com
+1

Relevance: Today these are online APIs; the offline gap is how to legally/efficiently subset, sign, and refresh “just what’s needed here” for an agent without a connection.

6) 3D/remote-sensing standards (packaging more than 2D base layers)

OGC 3D Tiles (Cesium) – standard for streaming massive 3D content (photogrammetry, buildings, point clouds). A strong standard to include for 3D local context packs. 
Open Geospatial Consortium
+1

COG/COPC/FlatGeobuf/GeoParquet – cloud/offline-friendly rasters, point clouds, and vectors that can be subset and signed per region. (FlatGeobuf is a good vector container for lossless local features.) 
guide.cloudnativegeo.org

Relevance: These are the right containers for an offline “context pack” beyond tiles—perfect for an agent that needs elevation, semantics, or dense 3D.

What nobody is (really) doing yet

Neutral, redistributable “context packs” tuned for agents: A signed, versioned bundle per geofence that mixes base map tiles, 3D (3D Tiles), places, rules (no-fly, speed limits, opening hours), micro-local anchors, and the last-mile deltas (e.g., construction). Existing SDKs focus on rendering/navigation, not agent cognition, and often restrict redistribution. 
Mapbox

Smart packaging/diffing and trust: PMTiles/GeoPackage exist, but no one ships a standard manifest + provenance + delta update flow aimed at mobile AI agents that intermittently meet each other (or an edge appliance) to exchange updates. 
docs.protomaps.com

Cross-vertical scope: AV HD-map firms do cars. VPS players do AR. UTM players do drones. Cities use disparate feeds. No common, offline-friendly bundle that an arbitrary agent can just “grab” for Perth-CBD (today) and Fremantle (tomorrow).

Competitive pressures & where a “Context CDN” can wedge in

Hyperscalers & nav vendors (Google/Apple/HERE/TomTom/Mapbox)

Strengths: SDKs, global data ops, distribution.

Gaps for us: licensing (prebaking/redistribution), neutrality, multi-source fusion across domains, and agent-centric content (anchors, local policies, 3D, rules). 
Mapbox

Open data coalitions (Overture/OSM)

Strengths: open licensing, cloud-native formats, constant refresh.

Gaps for us: not curated into “drop-in local packs,” no signed manifests/deltas for offline agents. 
docs.overturemaps.org
Registry of Open Data

ADAS/AV HD map suppliers (HERE, TomTom, Mobileye)

Strengths: highest precision, change-feeds, OEM integrations.

Gaps for us: automotive-centric data rights & packaging; rarely distributable for general agents or offline sideloading. 
HERE
download.tomtom.com
Mobileye

VPS/AR stacks (ARCore/ARKit/Niantic)

Strengths: centimeter-level localization; anchor graph.

Gaps for us: typically require connectivity; not shipped as portable, redistributable context packs. 
Google for Developers
Apple Developer
Niantic Spatial, Inc.

UTM/Traffic/POI APIs

Strengths: live operational data.

Gaps for us: online-only, licensing for offline redistribution unclear—opportunity to negotiate “pack rights.” 
altitudeangel.com
libp2p
arXiv

Takeaways for our play

Best raw ingredients exist (Overture/OSM + PMTiles/GeoPackage + 3D Tiles), but nobody packages them for agents with delta updates, signatures, and mixed domain layers as a standard product.
docs.overturemaps.org
docs.protomaps.com
Open Geospatial Consortium
+1

Most commercial SDKs support offline rendering—but not neutral, redistributable packs—creating a licensing moat we can turn into a differentiator (open + bring-your-own sources).
Mapbox

VPS/AR + UTM/traffic/POI show the kinds of locale-specific signals an agent wants; our edge is making them available offline as signed, small "context capsules."

---

7) Schema Registry & Validation Competitors

Schema registries for geospatial data are emerging but fragmented:

fiboa (Field Boundaries for Agriculture)
- Focus: Agricultural field boundaries
- Format: GeoParquet only
- Schema: JSON Schema hosted on GitHub
- Extensions: Community-driven, STAC-like
- Gap: Single domain, no signing/trust

STAC Extensions (stac-extensions.github.io)
- Focus: Spatiotemporal assets (satellite imagery, raster)
- Format: STAC Items/Catalogs
- Schema: JSON Schema fragments with prefix namespacing
- Extensions: Mature ecosystem (eo:, sar:, proj:, etc.)
- Gap: Raster-centric, no vector schemas, no conformance reports

Vecorel (emerging)
- Focus: Vector geospatial data
- Format: Multiple (GeoParquet, GeoJSON, PMTiles)
- Schema: SDL-authored, JSON Schema generated
- Extensions: Encoding profiles per format
- Gap: Early stage, no production deployments yet

OGC Simple Features / GML Application Schemas
- Focus: Standards compliance
- Format: GML, GeoJSON
- Schema: XSD, JSON Schema
- Gap: Heavyweight, not cloud-native friendly, no versioning strategy

Spatial.Properties Differentiation:
- Versioned schemas with semantic versioning
- Multiple encoding profiles (geoparquet@1, mvt@1, geojson@1)
- Conformance reports as first-class artifacts
- Signed schemas + trust integration
- Extensions framework with maturity lifecycle

---

8) Solar/Renewable Energy Market Segment

Growing demand for geospatial data in renewable energy site selection:

Existing Players

Solcast (irradiance)
- Commercial solar irradiance data
- API-based, no offline packs
- High accuracy but expensive

Global Solar Atlas (World Bank)
- Free solar resource maps
- Limited resolution, no offline packaging
- Good for initial screening

RE-Powering America (NREL)
- US-focused renewable energy data
- GIS layers but no pack concept
- Government source, open license

Nearmap / Eagleview
- High-resolution aerial imagery
- Subscription model, no redistribution
- Useful for detailed site assessment

Market Gap

Nobody provides:
- Curated renewable energy "site selection packs"
- Multi-layer bundles (solar + terrain + constraints + zoning)
- Offline-first delivery for field assessments
- Signed, versioned data for due diligence audit trails
- Screening workflows integrated with data

WA Solar Feasibility Pack Positioning:
- Hero example demonstrating pack-first approach
- Open data foundation (v0) + premium add-ons (v1)
- Screening workflow with reproducible results
- Evidence trail for investment decisions

Target Customers:
- Solar developers (early-stage site screening)
- Energy consultants (feasibility studies)
- Financial institutions (due diligence)
- Government (planning policy)

See `Docs/planning/07-Solar-Pack-Example-and-Licensing.md` for pack details.

---

9) Spatial Web Consortium

The Spatial Web Foundation promotes standards for spatial computing:

Key Concepts

SWID (Spatial Web Identifier)
- Universal identifier for spatial entities
- Based on DID (Decentralized Identifier) spec
- Enables cross-domain entity linking

HSML (Hyperspace Modeling Language)
- Semantic markup for spatial content
- JSON-LD based
- Describes spatial relationships and properties

HSTP (Hyperspace Transaction Protocol)
- Protocol for spatial operations
- Query, update, subscribe semantics
- Designed for decentralized spatial web

Our Position (Two-Track Strategy)

Track A (Ship Now): Build valuable primitives without Spatial Web dependencies
- Signed manifests, integrity receipts
- Machine-readable contracts (license + policy)
- UDG-lite lineage graph
- Operation trace envelopes

Track B (Ship on Pull): Add Spatial Web compatibility only when market demands
- Activation criteria: ≥2 buyers say compliance changes procurement outcome
- Components: SWID/DID, HSML exports, HSTP-like operations

Rationale: Spatial Web standards are promising but not yet mainstream. Track A delivers immediate value; Track B preserves future optionality.