# Spatial.Properties: Services and APIs

## 5. Core Services & Contracts

### 5.1 Auth & Tenancy

#### Authentication
- **Provider:** OIDC (Auth0/Okta/Cognito)
- **Authorization:** ABAC/RBAC (tenant, role, dataset classification)

#### Asset Security
- **Signed URLs:** HMAC/JWT with claims:
  - `tenant`
  - `pack_id`
  - `scope`
  - `expires_at`

#### Data Security
- Per-tenant KMS keys
- Usage metering & quotas

---

### 5.2 Pack Service (Control Plane)

#### Responsibilities
- Ingest scheduling
- Data normalization & conflation
- Schema validation
- Build PMTiles/COG/Parquet
- Generate `spatialpack.json`
- Compute & publish deltas
- STAC registration
- Lifecycle management & rollback

#### OpenAPI Endpoints (Abridged)

```
POST   /v1/packs                    # Start build
GET    /v1/packs/{packId}           # Get pack details
POST   /v1/packs/{packId}           # Publish pack
POST   /v1/packs/{packId}/delta     # Create delta
POST   /v1/packs/search             # Catalog search
```

---

### 5.3 Metadata & Search

#### Components
- **STAC API** with search index
- **Search Backend:** OpenSearch/Elasticsearch

#### Search Facets
- Schema
- License
- Bounding box
- Time range
- Tenant

---

### 5.4 License & Provenance

#### License Management
- License inheritance rules
- Compatibility validation
- **Hard fail** on conflicts

#### Audit & Lineage
- Append-only audit trail
- Lineage graph API
- Source attribution

---

### 5.5 MCP Orchestrator & Tools

#### Orchestration
- **Engine:** Temporal/Argo
- **Protocol:** gRPC/HTTP
- **Payload Format:** JSON

#### Tool Contract
Tools accept URIs and produce:
- Published pack layers
- Manifest patches

#### Available Tools

**Spatial Operations:**
- `buffer` - Buffer geometries
- `overlay` - Overlay analysis
- `clip` - Clip to boundary
- `select` - Attribute/spatial selection
- `spatial-join` - Join by location

**Raster Operations:**
- `raster:hillshade` - Generate hillshade
- `raster:slope` - Calculate slope

**Point Cloud Operations:**
- `pointcloud:sample` - Sample points

**Network Operations:**
- `network:shortest_path` - Routing

**AI Operations:**
- `nl:query_to_ops` - Natural language to operations

#### Buffer Tool Contract (Example)

```json
{
  "tool": "buffer",
  "input": {
    "layer_uri": "pmtiles://cdn.spatial.properties/packs/v12/roads.pmtiles",
    "distance": {
      "value": 100,
      "units": "m"
    },
    "dissolve": false
  },
  "output": {
    "format": "pmtiles",
    "publish": true,
    "layer_name": "roads_buffer"
  }
}
```

---

### 5.6 Event Bus

#### Technology
- **Primary:** NATS JetStream
- **Alternative:** Kafka

#### Event Topics

```
pack.published         # New pack version available
pack.delta            # Delta published
cache.invalidate      # CDN cache invalidation
tool.completed        # MCP tool execution complete
license.violation     # License compliance issue
usage.meter          # Usage tracking event
```

---

### 5.7 Spatial Context API/CDN

#### Storage & Distribution
- **Object Storage:** S3/R2
- **CDN:** CloudFront/Cloudflare

#### URL Structure
- **Pattern:** `/packs/{pack_id}/{version}/...`
- **Immutability:** Versioned paths are immutable

#### Cache Strategy
- **Cache-Control:** Long TTL
- **Validation:** Strong ETags
- **Range Support:** Enabled for large files
- **Security:** Signed URLs

#### Cache Invalidation
- **Policy:** Purge only on new versions
- **No mutable overwrites**

---

## 7. Web App & SDK

### Technology Stack
- **Framework:** React 18 + Vite
- **Mapping:** MapLibre GL
- **State:** Zustand/Redux
- **Mode:** Progressive Web App (PWA)

### Features

#### Core Functionality
- Load `spatialpack.json` manifests
- Fetch TileJSON/layers dynamically
- **Offline Support:**
  - IndexedDB caching
  - Background delta sync

#### Advanced Features
- **Client-side Analytics:** DuckDB-WASM for Parquet queries (when permitted)
- **Infinite Canvas:** Compose multiple packs
- **Styling:** Dynamic layer styling
- **Views:** Save and restore custom views

### Brand Implementation

#### CSS Variables
```css
:root {
  --sp-teal: #02b0ad;
  --sp-pink: #f1456d;
  --sp-orange: #fe8305;
  --sp-black: #121212;
  --sp-white: #ffffff;
}

body {
  color: var(--sp-black);
  background: var(--sp-white);
}

.button-primary {
  background: var(--sp-teal);
}

.badge-accent {
  background: var(--sp-orange);
}

.highlight {
  color: var(--sp-pink);
}
```

#### Brand Alignment
- Microcopy aligns to brand voice
- UI colors via CSS variables
- Palette and tone per brand manifesto

---

## 8. Security, Compliance, Privacy

### Transport & Storage Security
- **TLS:** 1.2+ with HSTS
- **Encryption at Rest:** KMS
- **Secrets Management:** Vault/AWS Secrets Manager
- **Key Rotation:** Automated

### Access Control
- **Authorization:** ABAC/RBAC
- **Asset Access:** Signed URLs
- **Principle:** Least privilege

### License & Provenance
- Enforced at build time
- Enforced at tool execution
- **Quarantine:** Non-compliant sources isolated

### Privacy & Compliance
- **PII Detection:** At ingest
- **Data Residency:** Tags for compliance
- **Erasure Workflows:** GDPR/CCPA support

### STRIDE Threat Model
- **Spoofing:** OIDC/mTLS
- **Tampering:** Checksums/immutable paths
- **Repudiation:** Comprehensive auditing
- **Information Disclosure:** WAF/rate limiting
- **Denial of Service:** Rate limits
- **Elevation of Privilege:** Role scoping

---

## 12. API Contracts (Abridged)

### Pack Service
- **Specification:** OpenAPI 3
- **ID Format:** Deterministic IDs
- **Versioning:** Semantic versioning

### License/Provenance Service
```
GET  /v1/license/validate
GET  /v1/provenance/{packId}
```

### MCP Service
```
POST /v1/mcp/execute
```
- Signed webhooks for completion callbacks


---

## 5.8 API Conventions & Cross-Cutting Policies


### 5.8 API Conventions & Cross-Cutting Policies

**Versioning:** All endpoints are namespaced under `/v1/` with semantic changes introduced as `/v2/` (no breaking changes in minor versions).

**Authentication:** OIDC Bearer tokens on all control‑plane endpoints. Signed URLs protect data‑plane assets with claims for `tenant`, `pack_id`, `scope`, `expires_at` (see §5.1).

**Idempotency:** For any POST that mutates state (e.g., `/v1/packs` build, `/v1/packs/{id}` publish), clients must send `Idempotency-Key` header. The server stores hash+ttl to ensure safe retries.

**Pagination:** Use `page_size` + opaque `page_token`. Default `page_size=50`, max `1000`. Responses include `next_page_token` when more results are available.

**Filtering & Search:** STAC search endpoint follows the STAC API spec; other list endpoints accept `bbox`, `time_range`, `schema`, `license`, `tenant`, `classification` as optional filters.

**Rate Limits & Quotas:** Default tenant quota: 10 requests/sec burst 100 on control plane; data plane enforced via CDN token bucket per signed URL scope. Exceeding limits returns `429 Too Many Requests` with `Retry-After` header.

**Errors (RFC 7807 Problem Details):**
```json
{
  "type": "https://api.spatial.properties/errors/license-conflict",
  "title": "License compatibility violation",
  "status": 409,
  "detail": "ODbL content cannot be combined with proprietary layer X under current policy.",
  "instance": "urn:spatial.properties:error:1b2c...",
  "meta": { "pack_id": "spatial.properties:wa:transport:v12" }
}
```

**Security Headers:** Always set `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`. CORS allows `GET, HEAD` from any origin for CDN assets; control plane is restricted to approved origins per tenant.

**OpenAPI:** The Pack Service and MCP Service publish OpenAPI 3.1 definitions; client SDKs are generated (TS/Go/Py). Linting gates prevent undocumented breaking changes.



---

## 5.9 Signed URL Semantics


#### Signed URL Example

```
GET https://cdn.spatial.properties/packs/spatial.properties:wa:transport/v12/roads.pmtiles?sig=eyJhbGciOiJIUzI1NiIsInR5cCI6...
Claims:
  tenant=acme
  pack_id=spatial.properties:wa:transport:v12
  scope=read
  expires_at=2025-11-30T12:00:00Z
```
If any claim is invalid or expired, CDN returns `403`. Cache keys include signature to avoid cross‑tenant leakage.

