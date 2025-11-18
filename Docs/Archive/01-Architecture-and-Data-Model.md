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
│  • Spatial Context API/CDN (CloudFront/Cloudflare)                 │
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

---

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

## 4.1 Spatial Pack Manifest

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

---

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

#### 5. Delta Generation
- Iceberg snapshot diff
- Generate Parquet partitions
- Create PMTiles tile-patch sets
- Build manifest delta chain
- **Result:** Clients apply minimal bytes for updates


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

