# Spatial.Properties: Overview and Brand

**Positioning**

**Spatial.Properties is a pack-first, cloud-native geospatial platform.** It authors, curates, and serves **Spatial Packs**—standardized bundles of spatial context—through an edge-optimized CDN and modern APIs designed for analytics, AI, and autonmous agents.


## 0. Brand & Portfolio Alignment (Authoritative)

**Spatial.Properties** is the core platform; it manages geospatial data as **Spatial Packs**—versioned bundles of vector, raster, and point-cloud data enriched with schemas, policies, and examples—delivered via a high-performance CDN and accessed through modern APIs.

**FutureBridgeAI (FBAI)** provides services (strategy, training, advisory, pilots) to de-risk adoption, while **VibeGIS** remains a sandbox for demos and innovation.

### Target Market
Our initial wedge is Western Australian utilities and resources, then state/local government.

### Brand Voice & Tone
**Tone:** Confident, helpful, technically sophisticated; use plain language for non-experts.

### Brand Palette
- **Primary:** Muted Teal `#02b0ad`
- **Accents:** Pink `#f1456d` + Bright Orange `#fe8305`
- **Text:** Black `#121212`
- **Backgrounds:** White `#ffffff`

---

## 1. Executive Summary

Spatial.Properties delivers **AI-first, cloud-native geospatial capabilities** with a **pack-first approach**: authoritative/curated Spatial Packs are the source of truth, published to the spatial context CDN for low-latency consumption across apps, agents, and analysis tools.

### Key Technologies
- **Open Formats:** GeoParquet, COG, COPC, PMTiles
- **Cataloging:** STAC (SpatioTemporal Asset Catalog)
- **Tool Integration:** MCP tools operate on URIs (e.g., `pmtiles://`, `parquet://`) for deterministic, reproducible AI/analysis workflows

### Mission & Vision
Enable real-world decision-making through accessible, intelligent spatial data.

---

## Why This Works

### Performance
- Edge-cached tiles
- Predictable p95 latency
- Offline pack support

### Governance
- First-class licensing management
- Complete provenance tracking
- Tenant isolation

### Extensibility
- New sources/layers are new Spatial Packs
- Tools consume URIs, not databases

### Portfolio Integration
- FBAI accelerates customer outcomes
- VibeGIS remains a safe sandbox

---

Executive Summary (Addendum)

**What’s new**  
- **Context Packet Profile (CSP-1):** a standards-track profile over Spatial Packs enabling agents to fetch only the tiles needed for their near-future operating area (H3/S2 scope, required layers, policy overlays).  
- **Edge/Mesh Transport:** delay-tolerant peer sync, optional sat/LPWAN, and venue beacons (BLE/NFC) for hyperlocal handoffs.  
- **Edge Agent SDKs:** ROS2/Android/iOS/C++ Lite with route-based prefetch, on-device delta apply, and sensor fusion hooks.  
- **Publisher Marketplace:** third-party data onboarding with license/provenance enforcement and revenue share.

**What’s unchanged**  
- Pack-first SoR → CDN delivery (immutable, signed URLs); STAC catalogs; open formats (GeoParquet, PMTiles, COG, COPC); tenancy, SLOs, and governance.


## 2. Goals, Non-Goals, Success Criteria

### Goals

1. **Spatial Packs as Source of Record (SoR)** with versioning + deltas
2. **spatial context CDN** with signed, versioned, cache-friendly assets
3. **Deterministic MCP tools** for NL→GIS and geoprocessing on URIs
4. **Multi-tenant security** (ABAC/RBAC), usage metering, licensing/provenance
5. **HA/DR**, SLO-driven observability, and cost guardrails
6. **CSP-1** as the interchange profile for geo‑intelligence tiles

### Non-Goals

- ❌ Re-hosting WMS/WFS as primary delivery
- ❌ Treating PostGIS as a system of record (it's a cache/scratch space only)
- ❌ Internal reliance on legacy formats (SHP/GDB limited to ingress/egress)

### Success Criteria

#### MVP
- Single-region pack (vector+raster) served via CDN
- TileJSON/PMTiles delivery
- STAC search capability
- Viewer loads by manifest
- MCP buffer/overlay operations
- Basic tenancy
- Local Rules & Restrictions 
- At least one **live layer** (traffic/weather/hazards).  
- **Performance:** p95 first paint < 3s

#### Production
- Multi-region packs with delta support
- Conflation across ≥3 sources
- Offline pack capability
- Event-driven architecture
- License enforcement
- **SLOs:**
  - p95 first paint < 2s
  - p95 tile hit < 500ms
- **Availability:** ≥ 99.9%
- **DR:** RPO ≤ 15 min, RTO ≤ 60 min

---

## 16. Solutions & Go-to-Market Surfaces

### Core Products
- **Spatial Packs Catalog**
- **Agent Tools**
- **Infinite Canvas**
- **Context Packets for Agents (CSP-1)** — SDK-driven consumption for robotics/AR/AV/drones.  
- **Publisher Marketplace** — venue/event/municipal providers publish CSP-1 layers with policy overlays.

### FBAI Services

**FBAI Studio — the advisory & delivery studio by Spatial.Properties.**

Training, pilots, and strategic advisory with initial focus on:
- WA utilities/resources
- Microgrids
- Asset integrity
- Vegetation/bushfire risk management
- Outage response


---

## Naming & External References Policy


**Canonical Name & Usage:** The customer‑facing and product name is **Spatial.Properties** (lowercase when used as a domain: `spatial.properties`). All external documents, UIs, SDKs, APIs, legal contracts, and marketing content MUST use **Spatial.Properties**.

**Internal Working Names:** *VibeGIS* is an internal/sandbox codename only and MUST NOT appear in any public artifact, endpoint, or customer‑facing configuration. If legacy references exist in code or prototypes, add a tracking ticket to remove/rename before release.

**Portfolio Relationship:** **FutureBridgeAI (FBAI)** is a services arm and is referenced only to describe service offerings (strategy, training, advisory, pilots). FBAI must not be implied as a data controller for customer packs; the controller is the customer tenant within Spatial.Properties.

**Asset Naming Rules:**
- Domains: `api.spatial.properties`, `cdn.spatial.properties` (no `vibegis.*` hostnames).
- Pack IDs: `spatial.properties:{region_or_jurisdiction}:{theme}:{semantic_version}` (e.g., `spatial.properties:wa:transport:v12.1.0`).
- GitHub/ECR: `spatial-properties/*` repositories and images.
- UI copy: use the brand palette and tone guidelines only (no alternative brand names).
