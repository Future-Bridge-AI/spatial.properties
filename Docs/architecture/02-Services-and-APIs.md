# Spatial.Properties: Services and APIs

**FBAI Studio — the advisory & delivery studio by Spatial.Properties.**


## 5. Core Services & Contracts

### 5.1 Auth & Tenancy

#### Authentication
**Authentication:** OIDC (Auth0/Okta/Cognito) for humans; **mTLS device identity** for agents.  
**Authorization:** ABAC/RBAC (tenant, role, classification, **device type**).

#### Asset Security
- **Signed URLs:** HMAC/JWT with claims:
- `tenant` — tenant id  
- `pack_id` — spatial pack id  
- `scope` — read subset (layers, overlays)  
- `expires_at` — epoch seconds  
- **`device_id` — hardware-bound identifier**  
- **`attestation_nonce` — anti-replay (optional)**

**Device Identity Service:**
- CA-backed device certificates (x509) + rotation
- CRL/OCSP or short-lived certs (recommended)
- Attestation plug-ins (Android/Apple/EAT TPM) — optional

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
- **Pre‑publish gates:** license compatibility checks, provenance graph validation  
- **Marketplace policy lenses:** restrict incompatible data from public listings  
- **Lineage API:** exposes derived-from chains for buyers



#### Audit & Lineage
- Append-only audit trail
- Lineage graph API
- Source attribution

---

### 5.4a Schema Artifact Hosting

> See [03-Schema-Registry-and-Validation.md](./03-Schema-Registry-and-Validation.md) for full specification.

**Responsibilities:**
- Host and serve schema/extension artifacts via stable, immutable URIs
- Publish version metadata and compatibility policy

**OpenAPI Endpoints:**
```
GET  /schemas/{namespace}/{name}@{version}    # JSON Schema document
GET  /extensions/{publisher}:{ext_name}@{version}  # Extension artifact
GET  /catalog/schemas?tag=&status=            # (Optional) Discovery
```

**URI Conventions:**
- Schemas: `https://schemas.spatial.properties/v1/{namespace}/{name}@{version}`
- Extensions: `https://schemas.spatial.properties/ext/{publisher}:{ext_name}@{version}`

---

### 5.4b Validation Service

> See [03-Schema-Registry-and-Validation.md](./03-Schema-Registry-and-Validation.md) for full specification.

**Responsibilities:**
- Validate datasets (GeoParquet/PMTiles) against schema + extensions
- Generate conformance reports
- Provide CI-friendly outputs

**OpenAPI Endpoints:**
```
POST /validate                  # Payload: pack/layer URIs + schema/ext URIs
GET  /reports/{run_id}          # Full conformance report
GET  /reports/{run_id}/summary  # Summary only
```

**Conformance Report Fields:**
- `run_id`, `validator` (name/version), `inputs`, `results`, `hashes`, `rule_set_hash`

---

### 5.4c UDG-lite Lineage Graph API

> See [04-Trust-and-Compatibility-Strategy.md](./04-Trust-and-Compatibility-Strategy.md) for full specification.

**Responsibilities:**
- Expose traversable provenance graph: pack → version → layer → asset → source → contract/policy
- Policy-aware redaction (tenant-scoped, respect visibility constraints)

**OpenAPI Endpoints:**
```
GET  /v1/graph/pack/{pack_id}  # Traversal bundle
POST /v1/graph/query           # Constrained query with depth/filter options
```

**Graph Relationships:**
- `derived_from` — provenance sources
- `licensed_by` / `restricted_by` — contract/policy references
- `covers_cell` — H3/S2 spatial index
- `valid_at` — temporal versioning

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

**Compliance Operations (Deterministic):**
- `compliance:compute_clearance` - Calculate required vegetation clearances
- `compliance:assign_responsibility` - Determine responsible party for compliance actions
- `compliance:danger_zone_gate` - Safety classification for work near hazards
- `compliance:environmental_gate` - Environmental permit trigger checks
- `compliance:risk_to_action` - Convert risk flags to prioritised task lists

**Compliance Operations (LLM-Assisted, Bounded):**
- `compliance:explain_flag` - Human-readable explanation of compliance flags
- `compliance:draft_notice` - Generate formal notice text
- `compliance:audit_narrative` - Summarise compliance activity with citations

> See `spec/features/0005-wa-bushfire-vegetation-clearance.md` for full compliance toolset specification.

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
marketplace.publisher.onboarded
marketplace.pack.listed
edge.peer.sync
edge.beacon.updated
device.certificate.rotated
security.replay.detected
```

#### Operation Trace Envelope

> See [04-Trust-and-Compatibility-Strategy.md](./04-Trust-and-Compatibility-Strategy.md) for full specification.

All events include a standardized trace envelope for auditability and reproducibility:

```json
{
  "op_id": "op_01ABC...",
  "op_type": "pack.publish",
  "subjects": ["spatial.properties:wa:land-greenfield:v1"],
  "actor": "publisher:demo@spatial.properties",
  "timestamp": "2025-12-30T10:00:00Z",
  "status": "completed",
  "inputs": { "manifest_uri": "s3://...", "artifact_uris": ["s3://..."] },
  "outputs": { "pack_id": "...", "cdn_uri": "https://..." },
  "provenance": { "builder": "spatialpack-cli@1.2.0", "inputs_hash": "blake3:..." },
  "trace": { "trace_id": "abc123", "span_id": "def456" }
}
```

**Required fields:** `op_id`, `op_type`, `subjects`, `actor`, `timestamp`, `status`
**Optional fields:** `inputs`, `outputs`, `provenance`, `trace`

---

### 5.7 spatial context CDN

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

### 5.8 Marketplace Service

**Responsibilities**
- Publisher onboarding (KYC optional), policy acceptance
- Pack listing creation with pricing and license terms
- Automated **license/provenance gates**
- Metering hooks and revenue share statements
- Dispute workflow and delisting

**OpenAPI (Abridged)**
```
POST   /v1/marketplace/publishers
POST   /v1/marketplace/listings
GET    /v1/marketplace/listings?bbox=&schema=&license=
POST   /v1/marketplace/listings/{id}/delist
GET    /v1/marketplace/reports/{publisherId}/revenue
```

### 5.9 Edge Sync Service

**Responsibilities**
- Opportunistic **P2P/mesh** sync (gossip or brokered leaf nodes)
- **DTN** store-and-forward queues (sat/LPWAN gateways)
- **BLE/NFC** beacon registry for venue/POI handoff
- On-device **delta apply orchestration** (client hints)
- Replay protection and integrity verification

**OpenAPI (Abridged)**
```
POST   /v1/edge/peers/register
POST   /v1/edge/exchanges
POST   /v1/edge/beacons
GET    /v1/edge/hints?packId=&h3=
```

**CDN Interaction**
- Edge Sync issues pre‑signed, short‑lived URLs with device claims; clients fetch small **CSP-1** tiles only.

---



## 6. Web App & SDK

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

- Add **Edge SDKs** download & docs: ROS2 (rclcpp/rclpy), Android/iOS, C++ Lite.  
- SDK features: **route-based prefetch**, TTL/expiry policies, delta-apply for PMTiles/Parquet, sensor fusion hooks, offline-first cache with integrity checks.

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

## 7. Security, Compliance, Privacy

### Transport & Storage Security
- **TLS:** 1.2+ with HSTS
- **mTLS for agents**; device cert lifecycle and rotation. 
- **Encryption at Rest:** KMS
- **Secrets Management:** Vault/AWS Secrets Manager
- **Key Rotation:** Automated

### Access Control
- **Authorization:** ABAC/RBAC
- **Asset Access:** Signed URLs
- **Nonce-bound signed URLs**; reject reuse on different devices. 
- **Principle:** Least privilege

### License & Provenance
- Enforced at build time
- Enforced at tool execution
- **Quarantine:** Non-compliant sources isolated

### Privacy & Compliance
- **PII Detection:** At ingest
- **Data Residency:** Tags for compliance
- **Erasure Workflows:** GDPR/CCPA support
- Privacy: beacon IDs contain no PII; opt‑in for venue owners.

### STRIDE Threat Model
- **Spoofing:** OIDC/mTLS
- **Tampering:** Checksums/immutable paths
- **Repudiation:** Comprehensive auditing
- **Information Disclosure:** WAF/rate limiting
- **Denial of Service:** Rate limits
- **Elevation of Privilege:** Role scoping

---

## 8. API Contracts (Abridged)

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

## 9 API Conventions & Cross-Cutting Policies

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

- Idempotent endpoints with `If-None-Match` support on manifests.  
- Pagination on listings and searches.  
- Webhooks: `marketplace.sale.settled`, `edge.sync.failure`.


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

