# Spatial.Properties: Implementation Plan

## Milestones

### M1 — MVP (Weeks 0–12)

**Deliverables:**
- Single-region pack (vector + raster)
- CDN delivery infrastructure
- STAC search capability
- Viewer loads content by manifest
- MCP buffer/overlay operations
- Basic tenancy implementation
- Base observability
- Manual delta generation

**Success Criteria:**
- p95 first paint < 3s
- Basic functionality validated

---

### M2 — Production (Weeks 13–26)

**Deliverables:**
- Multi-region & multi-tenant support
- Conflation across ≥3 sources
- Automated delta generation
- Offline pack capability
- Event-driven architecture
- License enforcement
- HA/DR implementation
- Full SLO compliance
- Complete observability
- Cost guardrails

**Success Criteria:**
- p95 first paint < 2s
- p95 tile hit < 500ms
- Availability ≥ 99.9%
- DR: RPO ≤ 15 min, RTO ≤ 60 min

### M3 - Agents Pilot (Weeks 36+)
**Deliverables** 
- CSP-1 + 
- Edge SDK 
- Edge Sync (metro) 
 - Marketplace beta

**Success Criteria**
- CSP-1 validators pass; pilot arena packet published.  
- Edge SDKs prefetch and apply deltas on route; telemetry confirms.  
- Edge Sync achieves SLOs; replay tests pass; runbooks approved.  
- Marketplace lists two third‑party packs with compliant licenses.

---

## Epics

### Critical Path Epics

#### E1 — Foundations (Weeks 0–2) 🔴 CRITICAL
**Scope:** IaC (VPC, EKS, S3, CDN), OIDC, Observability

#### E2 — Spatial Pack Spec & Libraries (Weeks 0–3) 🔴 CRITICAL
**Scope:** `spatialpack.json` schema, validators (TS/Py)

#### E3 — Pack Service (Weeks 1–6) 🔴 CRITICAL
**Scope:** APIs for build/publish/delta/search; signed URLs; STAC registry

#### E4 — Worker & Build Pipeline (Weeks 2–7) 🔴 CRITICAL
**Scope:** GDAL/tippecanoe/pmtiles/rio-tiler; ingest→normalize→conflate→build→publish automation

#### E10 — Conflation v1 (Weeks 13–18) 🔴 CRITICAL
**Scope:** Rules engine; lineage; accuracy tests

#### E11 — Delta Automation & Client Sync (Weeks 13–19) 🔴 CRITICAL
**Scope:** Iceberg diff; PMTiles delta; browser delta apply

### E2b — Context Packet Profile (Weeks 17–20) 🔴 CRITICAL
**Scope:** CSP-1 profile; manifest extensions; policy overlay schema; example packets.  

### E14b — Edge Agent SDKs (Weeks 19–27) 🔴 CRITICAL
**Scope:** ROS2 (rclcpp/rclpy), Android/iOS, C++ Lite; route-based prefetch; delta apply; integrity checks. 

#### E16 — Production Readiness (Weeks 24–26) 🔴 CRITICAL
**Scope:** Runbooks v1; incident sims; cost guardrails → M2 delivery


---

### Non-Critical Path Epics

#### E5 — Frontend (Weeks 3–8)
**Scope:** React + MapLibre; manifest loader; layer manager; offline cache; brand palette

#### E6 — MCP Tools (Weeks 4–9)
**Scope:** Gateway + buffer/overlay/clip; publish derived layers

#### E7 — Observability & SLOs (Weeks 4–10)
**Scope:** Metrics/logs/traces; dashboards; alerts

#### E8 — Tenancy & Access (Weeks 5–10)
**Scope:** ABAC; tenant scopes on signed URLs

#### E9 — MVP Hardening (Weeks 10–12)
**Scope:** Performance pass; CDN warmup; runbooks v0 → M1 delivery

#### E11 — Delta Automation & Client Sync (Weeks 13–19)
**Scope:** Iceberg diff; PMTiles delta; browser delta apply

#### E12 — Event Bus & Live Layers (Weeks 15–20)
**Scope:** NATS topics; CDN invalidate worker; client hints

#### E13 — License & Audit (Weeks 16–21)
**Scope:** Rules engine; build-time gates; audit store

#### E14 — Offline/Edge (Weeks 17–22)
**Scope:** Pack bundler; integrity; offline deltas

#### E15 — HA/DR/Security Hardening (Weeks 20–24)
**Scope:** Multi-AZ; cross-region replication; WAF/rate limits


### E2b — Context Packet Profile (Weeks 17–20)
**Scope:** CSP-1 profile; manifest extensions; policy overlay schema; example packets.  
**Deliverables:** spec doc, validators, sample arena packet, STAC extension fields.  
**Acceptance:** Pack validators enforce CSP-1 rules; example loads in viewer.

### E12b — Edge/Mesh Transport (Weeks 21–28)
**Scope:** Edge Sync service; DTN queues; P2P peer discovery; LPWAN/sat gateway integration; BLE/NFC beacon registry.  
**Deliverables:** OpenAPI, NATS subjects, DTN store-and-forward, beacon admin UI.  
**Acceptance:** 95% mesh convergence ≤ 5 min in pilot; replay tests pass; runbooks published.

### E13b — Publisher Marketplace (Weeks 22–30)
**Scope:** Publisher onboarding; license/provenance gates; listing search; rev-share reporting; delist flows.  
**Deliverables:** OpenAPI, UI, billing hooks, reports.  
**Acceptance:** Two third‑party listings pass gates; purchase flow settles revenue report.

### E14b — Edge Agent SDKs (Weeks 19–27)
**Scope:** ROS2 (rclcpp/rclpy), Android/iOS, C++ Lite; route-based prefetch; delta apply; integrity checks.  
**Deliverables:** SDKs, samples, docs; prefetch planner; storage adapters.  
**Acceptance:** Pilot bot completes mission with offline deltas; UAT sign‑off.

---

## Work Breakdown Structure (WBS) / Backlog

### E1 — Foundations

#### E1.1 VPC/EKS cluster with IRSA & autoscaling
- Terraform VPC module (3 AZs)
- EKS cluster with IRSA enabled
- Cluster Autoscaler setup
- Node groups configuration

#### E1.2 S3 buckets + KMS + lifecycle
- `spatial-packs-*` bucket
- `spatial-stac-*` bucket  
- `spatial-logs-*` bucket
- KMS encryption configuration
- Lifecycle policies
- CORS configuration

#### E1.3 CloudFront CDN
- OAC (Origin Access Control)
- TLS certificate setup
- Range request support
- CORS headers
- Domain: `cdn.spatial.properties`

#### E1.4 CI/CD Pipeline
- GitHub OIDC → ECR → Helm → EKS
- ECR repositories per service
- Automated deployments

#### E1.5 Observability base
- Prometheus/Loki/Tempo/Grafana stack
- Base dashboards
- Alert rules

---

### E2 — Pack Spec

#### Tasks
- `spatialpack.json` schema v1.0
- Validators:
  - `@spatialprops/spatialpack` (TypeScript)
  - `spatialpack-py` (Python)
- STAC extension fields
- Unit tests for validators

### E2b:
#### Tasks
- `sp.policy.v1` schema; `packet_scope` validator; examples. 

---

### E3 — Pack Service

#### Tasks
- API scaffold (NestJS/Go)
- OIDC middleware integration
- Build/publish/delta endpoints
- STAC registration logic
- Signed URL issuer
- Search API (tenancy-aware)
- OpenAPI documentation
- Client SDK generation

---

### E4 — Workers

#### Tasks
- Container images with pinned tools:
  - GDAL
  - tippecanoe
  - pmtiles
  - rio-tiler
- Ingest to Iceberg pipeline
- Normalization routines
- Conflation v0 (simple rules)
- Vector tiling → PMTiles
- Raster → COG/PMTiles
- Manifest builder
- Publisher with integrity checks
- Hash/ETag generation

---

### E5 — Frontend

#### Tasks
- OIDC authentication flow
- Manifest loader
- MapLibre layer integration
- Style controls
- IndexedDB offline cache
- DuckDB-WASM for client-side queries
- Brand palette CSS variables
- A11y contrast validation

---

### E6 — MCP Tools

#### Tasks
- Gateway infrastructure
- Job runner (Temporal)
- Tool implementations:
  - `buffer`
  - `overlay`
  - `clip`
- Publish derived layers workflow
- NL→GIS scaffold
- Audit logs for invocations

---

### E7 — Observability

#### Tasks
- Tile hit/miss metrics
- Build duration tracking
- Queue depth monitoring
- Distributed tracing setup
- Alert rule definitions
- SLO dashboard creation

---

### E8 — Tenancy

#### Tasks
- ABAC policy engine
- Per-tenant KMS keys
- Tenant-specific S3 prefixes
- Usage metering service
- Quota enforcement

---

### E9 — MVP Hardening

#### Tasks
- Performance profiling
- Cache warming strategies
- Runbooks v0 documentation
- M1 acceptance testing
- Security audit
- Load testing

- **E12b:** P2P module; DTN gateway; LPWAN envelope; beacon registry; replay protection.  
- **E13b:** Publisher KYC (optional); license/provenance checks; listing CRUD; reports.  
- **E14b:** SDK APIs; delta-apply engine; ROS2 nav2 plugin; Android/iOS offline storage.


---

## Acceptance Criteria

### MVP Criteria
See Success Criteria in Section 2 of design document

### Production Criteria
- Multi-region packs operational
- Delta automation functional
- Offline packs working
- Event-driven architecture live
- License enforcement active
- HA/DR validated (RPO/RTO met)
- SLOs achieved
- Cost guardrails in place

---

## Team Structure & RACI

### Team Composition (Indicative)

#### Platform Engineering
- **Size:** 3–4 engineers
- **Focus:** API, auth, MCP gateway

#### Data Engineering
- **Size:** 3–4 engineers
- **Focus:** Ingest, conflate, build, delta

#### Web Development
- **Size:** 2–3 engineers
- **Focus:** Frontend, offline capabilities

#### Site Reliability Engineering (SRE)
- **Size:** 2 engineers
- **Focus:** IaC, observability, HA/DR, CDN

#### Applied AI
- **Size:** 1–2 engineers
- **Focus:** NL→GIS capabilities

#### Supporting Roles
- **Product Manager:** 1
- **Design:** 1
- **QA:** 1

### RACI Matrix

**Legend:**
- R = Responsible
- A = Accountable
- C = Consulted
- I = Informed

| Epic | Platform | Data | Web | SRE | AI | PM |
|------|----------|------|-----|-----|----|----|
| E1 Foundations | C | C | I | **A/R** | I | I |
| E2 Pack Spec | **A/R** | **R** | C | C | I | A |
| E3 Pack Service | **A/R** | C | C | C | I | A |
| E4 Workers | C | **A/R** | I | C | I | A |
| E5 Frontend | C | I | **A/R** | C | I | A |
| E6 MCP Tools | **A/R** | C | C | C | **R** | A |
| E7 Observability | C | C | C | **A/R** | I | A |
| E8 Tenancy | **A/R** | C | C | **R** | I | A |

| Epic  | Platform | Data | Web | SRE | AI | PM |
|------:|:--------:|:----:|:---:|:---:|:--:|:--:|
| E2b   | **A/R**  | **R**| C   | C   | I  | A  |
| E12b  | **A/R**  | C    | C   | **R**| I  | A  |
| E13b  | **A/R**  | C    | **R**| C  | I  | A  |
| E14b  | **A/R**  | I    | C   | C   | **R**| A |
---

## Dependencies & Critical Path

### External Dependencies
- AWS account with appropriate permissions
- Domain registration for `spatial.properties`
- OIDC provider setup (Auth0/Okta/Cognito)
- GitHub organization for CI/CD

### Internal Dependencies
- E3 (Pack Service) depends on E1 (Foundations)
- E4 (Workers) depends on E2 (Pack Spec)
- E5 (Frontend) depends on E3 (Pack Service)
- E6 (MCP Tools) depends on E3 (Pack Service)
- E12b depends on E2b (CSP-1 manifest hints) and E14b (client delta/apply).
- E13b integrates with E3 (Pack Service) and license/provenance.


### Critical Path
E1 → E2 → E3 → E4 → E10 → E11 → **E2b → E14b → E12b** → E16
```

All other epics can proceed in parallel once their dependencies are met.


---

## Assumptions, Constraints & Definition of Done


## Assumptions & Constraints

- AWS primary region is `ap-southeast-2`; DR is `ap-southeast-1`.
- Domain control for `spatial.properties` is available.
- Source datasets are legally licensable for intended uses (see License & Provenance).
- Engineering capacity as per Team Structure is available ≥80% allocation.

**Constraints:**
- Delivery formats must remain open (PMTiles/COG/COPC/GeoParquet).
- PostGIS acts only as cache/scratch; never SoR.
- Immutability of published assets is mandatory.

## Definition of Done (per Epic)

- OpenAPI updated and published (where applicable)
- Unit/integration tests ≥ target coverage (see §13)
- Observability: metrics, logs, traces wired with dashboards
- Security: threat model reviewed; secrets via Secrets Manager
- Documentation: updated READMEs and runbooks
- Acceptance tests passed in staging; canary validation plan attached

