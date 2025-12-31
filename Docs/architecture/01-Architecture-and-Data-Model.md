# Spatial.Properties: Architecture and Data Model

## 3. Reference Architecture

```
Users/Agents/Integrations
    │  HTTPS (OIDC/OAuth2, Signed URLs)
    ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Control Plane (K8s)                            │
│  • API Gateway / Ingress (WAF, rate limit)                         │
│  • AuthN/AuthZ (OIDC + ABAC/RBAC)                                  │
│  • Pack Service (build/version/delta/publish)                      │
│  • Metadata & Search (STAC API + index)                            │
│  • License & Provenance Service                                    │
│  • Tenancy/Billing/Metering                                        │
│  • MCP Orchestrator (Temporal/Argo)                                │
│  • Event Bus (NATS JetStream / Kafka)                              │
│  • Observability (OTel, Prom, Loki, Tempo, Grafana)                │
└────────────────────────────────────────────────────────────────────┘
    │                           ▲
    │ publish assets (signed)   │ control
    ▼                           │
┌────────────────────────────────────────────────────────────────────┐
│                          Data Plane                                │
│  • Object Storage (S3/R2 + KMS)                                    │
│  • spatial context CDN (CloudFront/Cloudflare)                 │
│  • Worker Pools (GDAL/tippecanoe/pmtiles/rio-tiler)                │
│  • Lakehouse (Iceberg tables on object storage)                    │
│  • PostGIS (cache/scratch), DuckDB (adhoc)                         │
│  • Formats: Parquet, COG, COPC                                     │
└────────────────────────────────────────────────────────────────────┘
    │
    ▼
Web Frontend (React + MapLibre GL + DuckDB-WASM + IndexedDB offline)
MCP Clients (tools accept URIs; return pack layers + manifest patches)
```

## 3.1 Indexing & Scope
- **H3/S2**; regional sharding for scalability.  
- **CSP-1 Scope:** One or more **H3 cells at fixed resolution** or an S2 cell level; packet size guidance: ≤ 50MB target, ≤ 200MB hard cap per packet.

## 4. Data Model & Formats

### Vector Data
- **Source of Record:** GeoParquet
- **Delivery:** PMTiles
- **Interchange:** FlatGeobuf

### Raster Data
- **Source of Record:** COG (Cloud Optimized GeoTIFF)
- **Performance Option:** Raster PMTiles

### Point Cloud Data
- **Source of Record:** COPC (Cloud Optimized Point Cloud)

### Catalog
- **Format:** STAC Collections/Items with Spatial.Properties extensions

### Indexing
- **Spatial Indexes:** H3/S2
- **Scaling:** Regional sharding for scalable packs

---

## 4.1a Spatial Pack Manifest

### Schema: `spatialpack.json` (Abridged)

```json
{
  "pack_id": "spatial.properties:wa:transport:v12",
  "version": "12.1.0",
  "created_at": "2025-10-24T12:00:00Z",
  "bbox": [-125.0, 45.5, -116.9, 49.1],
  "crs": "EPSG:4326",
  "tenant": "acme",
  
  "license": {
    "id": "CDLA-Permissive-2.0",
    "attribution": "..."
  },

  "contract_ref": "https://cdn.spatial.properties/packs/v12/contract.json",
  "policy_ref": "https://cdn.spatial.properties/packs/v12/policy.json",
  "integrity_uri": "https://cdn.spatial.properties/packs/v12/integrity.json",
  "signature_uri": "https://cdn.spatial.properties/packs/v12/spatialpack.json.sig",
  
  "provenance": {
    "sources": [
      {
        "name": "Overture",
        "version": "2025-09-01",
        "license": "ODbL-1.0",
        "sha256": "..."
      },
      {
        "name": "LocalDOT",
        "version": "2025-08-10",
        "license": "internal"
      }
    ],
    "derived_from": ["spatial.properties:wa:transport:v11"]
  },
  
  "layers": [
    {
      "id": "roads",
      "type": "vector",
      "schema": "overture.roads.core.v3",
      "schema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0",
      "schema_profile": "geoparquet@1",
      "extensions": [
        "https://schemas.spatial.properties/ext/spatial-properties:lineage@1.0.0"
      ],
      "tilejson": "https://cdn.spatial.properties/tiles/v12/roads/tile.json",
      "pmtiles": "https://cdn.spatial.properties/packs/v12/roads.pmtiles",
      "parquet": "s3://spatial-packs/v12/roads/*.parquet",
      "index": {
        "h3_res": 9
      },
      "stats": {
        "features": 143225912,
        "updated_at": "..."
      },
      "security": {
        "classification": "internal",
        "visibility": ["acme:analyst"]
      },
      "validation": {
        "conformance_uri": "https://schemas.spatial.properties/reports/run.../roads.json",
        "status": "pass",
        "validator": "spatial.properties.validator@1.3.2",
        "rule_set_hash": "sha256:...",
        "checked_at": "2025-10-24T12:00:00Z",
        "summary": { "errors": 0, "warnings": 5 }
      }
    }
  ],
  
  "deltas": [
    {
      "from": "12.0.0",
      "to": "12.1.0",
      "pmtiles_delta": "https://cdn.spatial.properties/packs/delta/12.0.0-12.1.0/roads.pdlt",
      "parquet_delta": "s3://spatial-packs/delta/12.0.0-12.1.0/roads/*",
      "size_bytes": 421338992,
      "sha256": "..."
    }
  ],
  
  "integrity": {
    "manifest_sha256": "...",
    "asset_hashes": {
      "roads.pmtiles": "..."
    }
  },
  
  "retention": {
    "min_ttl_days": 180
  },
  
  "extensions": {
    "stac_collection": "https://api.spatial.properties/stac/collections/spatial.properties:wa:transport"
  }
}
```

### Related Architecture Documents

For detailed specifications on schema validation and trust artifacts, see:
- **[03-Schema-Registry-and-Validation.md](./03-Schema-Registry-and-Validation.md)**: Schema registry, extensions framework, validation & conformance
- **[04-Trust-and-Compatibility-Strategy.md](./04-Trust-and-Compatibility-Strategy.md)**: Signed manifests, integrity receipts, license/policy contracts, lineage graph

---

## 4.1b CSP-1: Manifest Extensions

CSP-1 is a **profile** layered on the existing `spatialpack.json` manifest. It adds:

```json
{
  "profile": "CSP-1",
  "packet_scope": { "h3": ["8a2a1072b59ffff"], "s2_level": null },
  "required_layers": [
    "base.map", "poi.core", "regulations.local_rules", "safety.no_fly_zones"
  ],
  "policy_overlays": {
    "schema": "sp.policy.v1",
    "overlays": [
      {
        "id": "roads.speed_limits",
        "jurisdiction": "state/local",
        "source": "transport.authority",
        "license": "public"
      },
      {
        "id": "air.no_fly_zones",
        "jurisdiction": "CAA",
        "source": "uas.registry",
        "license": "public"
      }
    ]
  },
  "live_layers": {
    "topics": [
      "live.traffic.flow",
      "live.weather.alerts",
      "live.hazards.incidents"
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
``` 

### 4.1 Required Layers (Normative)
- **base.map** (roads, paths, buildings, admin)  
- **poi.core** (operational POIs, opening hours)  
- **regulations.local_rules** (speed limits, parking, curb use, venue rules)  
- **safety.no_fly_zones** (UAS restrictions; indoor/venue “no go” areas where applicable)

### 4.2 Policy Overlays (Normative)

`sp.policy.v1` overlay elements contain: `id`, `jurisdiction`, `source`, `effective_from/through`, `license`, `classification`, `visibility`, and a `geom` reference (URI) pointing to PMTiles/Parquet subsets. Overlays MUST support **immutability** and be **delta‑addressable**.

### 4.3 Live Layers (Recommended)

CSP-1 packets define **event topics** (e.g., NATS JetStream subjects) and client QoS/retention hints. Live payloads carry **cell keys** (H3/S2) for quick **merge** with on-device caches.
---



## 4.2 Pack Naming & Versioning Rules


**Pack ID Components:**

```
{authority}:{geography}:{theme}:{version}
authority := spatial.properties | partner-authority
geography := iso_3166_au_state | country | grid | basin | custom-tenant-scope
theme := transport | utilities | land | imagery | elevation | risk | ... (lowercase kebab-case)
version := SemVer (MAJOR.MINOR.PATCH) aligned to manifest `version`
```

**Semantic Versioning Policy:**
- **MAJOR**: incompatible schema changes or layer set changes.
- **MINOR**: additive changes (new attributes/layers), back‑compatible.
- **PATCH**: corrections or performance-only changes (no schema change).

**Immutability:** All versioned asset paths are immutable; new versions are published under a new `/{version}/` prefix. Clients must never rely on mutable overwrites.

**Geodetic & CRS Policy:**
- Source CRS is preserved in lineage metadata; SoR stored as EPSG:4326 unless strong justification exists.
- Reprojection occurs during build for delivery formats as needed; reprojection parameters (authority, accuracy, area of use) are captured in manifest provenance.

**Data Quality Metrics (per layer):**
- Topology error rate (per 10k features)
- Geometry validity (% valid by `ST_IsValid`)
- Attribute completeness (non-null ratio per field)
- Positional accuracy (RMSE or stated accuracy where available)
- Temporal currency (max(source_ts), median age)
These metrics are computed during build and published under `layers[].stats` to enable objective comparisons across versions.

**Indexing Strategy:**
- Default H3 resolution: choose by feature density to target ~50–200 features/cell at Z14 equivalent.
- For very dense urban vectors, enable S2 supplemental index for routing operations.



---

## 4.3 Manifest Extensions: Governance & Offline Bundles


To support governance and offline scenarios, manifests extend with:

```json
{
  "retention": { "min_ttl_days": 180 },
  "security": { "classification": "public|internal|restricted", "visibility": ["tenant:role"] },
  "offline": {
    "bundles": [
      { "name": "lite", "max_bytes": 2000000000, "includes": ["roads", "buildings"] },
      { "name": "full", "max_bytes": 10000000000, "includes": ["*"] }
    ],
    "integrity": { "sha256": "..." }
  }
}
```
**Classification vocabulary:** `public` (no sensitive restrictions), `internal` (tenant only), `restricted` (fine‑grained groups). Tie these to ABAC in authorization (see Security docs).



## 6. Data Pipelines

### Pipeline Stages

#### 1. Ingest
- Land data in staging buckets
- Capture source metadata, license, checksums
- CRS normalization to EPSG:4326

#### 2. Normalize & Conflate
- **Rules engine** to canonical schemas (e.g., `overture.*`)
- **Conflict resolution** based on:
  - Recency
  - Priority
  - Geometric quality
- **Lineage tracking:** `source_id`, `source_ts`, `weight`

#### 3. Build
- **Vector:** tippecanoe → PMTiles (multi-zoom)
- **Raster:** COG pyramids
- **Point Cloud:** COPC validation
- Generate stats & hashes
- Create manifest

#### 4. Publish
- Upload with appropriate ACLs
- Set cache headers
- Register with STAC
- Emit events
- Server publishes **PMTiles/Parquet deltas**; CSP-1 clients MUST support **delta apply** and **full refresh fallback**. 

#### 5. Delta Generation
- Iceberg snapshot diff
- Generate Parquet partitions
- Create PMTiles tile-patch sets
- Build manifest delta chain
- **Result:** Clients apply minimal bytes for updates
- Integrity: **manifest and asset hashes**; clients MUST verify hashes before commit.
---


## 7. Security & Tenancy (Profile Guidance)

- Asset access via **Signed URLs** (HMAC/JWT) with claims extended for **`device_id`** and optional **`attestation_nonce`**.  
- Classification and **ABAC** continue to apply at layer and overlay granularity.

## 7. Examples

Minimal CSP-1 packet for an arena (H3 ring at res 9) with venue rules and BLE beacon hints. (See `/examples/csp1-arena.json`).

---

## 8. Pack Composition Patterns

Spatial Packs can be composed to support complex workflows. This section documents common composition patterns.

### 8.1 Three-Pack Compliance Model

For compliance and audit workflows, packs separate concerns into three layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTEXT PACK                              │
│  • Regulatory rules (machine-readable JSON)                 │
│  • Jurisdiction boundaries                                   │
│  • Environmental overlays                                    │
│  • Public/Licensed — reusable across customers              │
└─────────────────────────────────────────────────────────────┘
                              +
┌─────────────────────────────────────────────────────────────┐
│                    PRIVATE PACK                              │
│  • Customer-owned assets (e.g., network infrastructure)     │
│  • Stable asset IDs                                          │
│  • Private — customer-scoped                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    [ Compliance Tools ]
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    EVIDENCE PACK                             │
│  • Photos, inspection forms, task events                    │
│  • Audit reports                                             │
│  • Immutable — system of record                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles:**
- **Context packs** are reusable across customers; they encode jurisdiction-specific rules and boundaries without customer data.
- **Private packs** contain customer-owned assets; they are combined with context packs for analysis.
- **Evidence packs** capture immutable, audit-grade records of operations; they reference artifacts from both context and private packs.

**Example: Bushfire Vegetation Clearance**
- Context: `au-wa-bushfire-veg-clearance-context` (rules, boundaries, fire risk areas)
- Private: `{customer}-wa-power-network` (poles, spans, conductors)
- Evidence: `{customer}-veg-clearance-evidence` (photos, forms, audit reports)

> See `spec/features/0005-wa-bushfire-vegetation-clearance.md` for full specification.

### 8.2 Rules Artifact Pattern

Compliance packs include machine-readable rules as JSON artifacts:

```json
{
  "rule_id": "clearance.horizontal.hv_bare",
  "version": "2025.01",
  "description": "Minimum horizontal clearance for HV bare conductors",
  "parameters": {
    "conductor_class": "HV",
    "conductor_type": "bare",
    "fire_risk_modifier": 1.5
  },
  "formula": "base_clearance * fire_risk_modifier",
  "base_clearance_m": 3.0,
  "legal_basis": "WA Electricity Regulations 2024 s.42(1)(b)"
}
```

**Requirements:**
- Rules MUST include `rule_id` and `version` for audit trails
- Rules MUST reference `legal_basis` where applicable
- Rule changes MUST follow semver; breaking changes require major version bump

### 8.3 Evidence Artifact Pattern

Evidence packs use content-addressable storage with integrity verification:

```json
{
  "artifact_id": "evidence/photos/site_001_20250101_120000.jpg",
  "hash": "blake3:abc123...",
  "captured_at": "2025-01-01T12:00:00Z",
  "captured_by": "field_user_01",
  "location": {
    "lat": -31.9505,
    "lon": 115.8605,
    "accuracy_m": 5
  },
  "references": {
    "task_id": "task_001",
    "asset_id": "span_042",
    "rule_id": "clearance.horizontal.hv_bare@2025.01"
  }
}
```

**Requirements:**
- Every artifact MUST have a content hash
- Every artifact MUST be timestamped and spatially anchored
- Artifacts MUST reference originating tasks and rules
- Evidence packs are immutable once published