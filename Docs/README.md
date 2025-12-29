# Spatial.Properties: Complete Documentation Package

This documentation package contains the complete design, implementation plan, and operational guides for the Spatial.Properties platform.

## 📚 Document Overview

### ⭐ Critical Updates - All Gaps Filled

This documentation package now includes **three critical foundational documents** that were identified as essential before implementation:

1. **Cost Modeling & Budget (06)** - Complete financial planning with estimates from MVP to 1PB scale
2. **Network & Security Architecture (07)** - Production-ready network topology and security controls
3. **IAM Roles & Permissions (08)** - Complete IRSA configuration and access management

**Status:** ✅ Documentation is now **complete and implementation-ready**

---

### Document Summary

### [00-Overview-and-Brand.md](./00-Overview-and-Brand.md)
**Purpose:** Brand alignment, executive summary, goals, and success criteria

**Contents:**
- Brand identity and portfolio positioning
- Executive summary of the Spatial.Properties platform
- Core technology stack and approach
- Goals, non-goals, and success criteria for MVP and Production
- Go-to-market surfaces and FBAI services

**Audience:** All stakeholders, executives, product managers

---

### [01-Architecture-and-Data-Model.md](./01-Architecture-and-Data-Model.md)
**Purpose:** Technical architecture and data formats

**Contents:**
- Reference architecture diagram (Control Plane + Data Plane)
- Data model specifications
- Spatial Pack manifest schema
- Open format specifications (GeoParquet, COG, COPC, PMTiles)
- Data pipeline stages
- STAC catalog integration

**Audience:** Architects, platform engineers, data engineers

---

### [02-Services-and-APIs.md](./02-Services-and-APIs.md)

**FBAI Studio — the advisory & delivery studio by Spatial.Properties.**

**Purpose:** Core services, API contracts, and security

**Contents:**
- Authentication and authorization (OIDC, ABAC/RBAC)
- Pack Service APIs and contracts
- Metadata and search capabilities
- License and provenance management
- MCP Orchestrator and tool catalog
- Event bus architecture
- spatial context CDN specifications
- Web application stack
- Security, compliance, and privacy measures

**Audience:** Platform engineers, backend developers, security team

---

### [03-Operations-and-Testing.md](./architecture/03-Operations-and-Testing.md)
**Purpose:** SLOs, observability, DR, and testing strategies

**Contents:**
- Service Level Objectives (SLOs)
- Capacity planning and cost management
- Observability stack (metrics, logs, traces)
- Disaster recovery and backup strategies
- Comprehensive testing strategy
- Rollout and migration procedures
- Risk register and mitigations

**Audience:** SREs, DevOps, QA engineers, operations team

---

### [03-Schema-Registry-and-Validation.md](./architecture/03-Schema-Registry-and-Validation.md) NEW
**Purpose:** Schema registry, extensions framework, and validation

**Contents:**
- Schema artifact structure and URI conventions
- Extensions framework with maturity lifecycle
- Encoding profiles (GeoParquet, MVT, GeoJSON)
- Conformance reports and validation
- Pack lifecycle policy (draft vs published)
- Developer experience (CLI, CI/CD, SDK)

**Audience:** Platform engineers, data engineers, publishers

---

### [04-Trust-and-Compatibility-Strategy.md](./architecture/04-Trust-and-Compatibility-Strategy.md) NEW
**Purpose:** Two-track strategy for trust artifacts and Spatial Web compatibility

**Contents:**
- Track A (Ship Now): Signed manifests, integrity receipts, contracts, lineage
- Track B (Ship on Pull): Spatial Web compatibility (DID, HSML, HSTP)
- Activation criteria for Track B
- Implementation roadmap and success measures

**Audience:** Architects, platform engineers, security team

---

### [02-Schema-and-Validation-Roadmap.md](./planning/02-Schema-and-Validation-Roadmap.md) NEW
**Purpose:** Phased roadmap for schema registry and validation

**Contents:**
- Phase 1: Thin-slice MVP (schema_uri, extensions[], validation)
- Phase 2: Product-grade discovery (if pull exists)
- Phase 3: Ecosystem scaling (with multiple publishers)
- Success measures and risk mitigation

**Audience:** Product managers, platform engineers

---

### [04-Implementation-Plan.md](./planning/04-Implementation-Plan.md)
**Purpose:** Milestones, epics, work breakdown, and team structure

**Contents:**
- M1 (MVP) and M2 (Production) milestone definitions
- 16 epics with critical path identification
- Detailed work breakdown structure (WBS)
- Task-level backlog for each epic
- Acceptance criteria for MVP and Production
- Team composition and RACI matrix
- Dependencies and critical path analysis

**Audience:** Project managers, team leads, all engineering teams

---

### [05-Trust-and-Compatibility-Roadmap.md](./planning/05-Trust-and-Compatibility-Roadmap.md) NEW
**Purpose:** Two-track roadmap for trust artifacts and Spatial Web compatibility

**Contents:**
- Track A timeline and deliverables (signed manifests, contracts, lineage, traces)
- Track B activation criteria (≥2 buyers, partner pull, tender requirement)
- Success measures (sales enablement, integration speed, compliance credibility)
- Risk mitigation strategies

**Audience:** Product managers, architects, executives

---

### [05-Infrastructure-Setup-Guide.md](./planning/05-Infrastructure-Setup-Guide.md)
**Purpose:** Step-by-step SRE guide for AWS infrastructure setup

**Contents:**
- Prerequisites and environment setup
- **E1.1:** VPC and EKS cluster with IRSA and autoscaling
- **E1.2:** S3 buckets with KMS encryption and lifecycle policies
- **E1.3:** CloudFront CDN with OAC, Range support, and CORS
- **E1.4:** CI/CD pipeline (GitHub Actions → ECR → Helm → EKS)
- **E1.5:** Observability base (Prometheus, Loki, Tempo, Grafana)
- Verification checklists
- Common pitfalls and troubleshooting
- Rollback and cleanup procedures

**Audience:** SREs, infrastructure engineers, DevOps

---

### [06-Cost-Modeling-and-Budget.md](./06-Cost-Modeling-and-Budget.md) ⭐ NEW
**Purpose:** Comprehensive cost modeling and financial planning

**Contents:**
- Monthly cost estimates for MVP, small, medium, and large deployments
- Cost breakdown by service (compute, storage, CDN, database, etc.)
- Per-user and per-API-call economics
- Single-region vs multi-region cost comparison
- Cost optimization strategies (20-50% potential savings)
- Budget guardrails and monitoring
- ROI and pricing strategy models
- Quarterly cost review checklist

**Audience:** Financial planning, executives, platform engineers, SREs

---

### [07-Solar-Pack-Example-and-Licensing.md](./planning/07-Solar-Pack-Example-and-Licensing.md) NEW
**Purpose:** WA Solar Feasibility Pack guide and licensing matrix

**Contents:**
- Pack promise (ranking, filtering, estimation, reporting)
- Release strategy (v0.1 open, v0.2 enhanced, v1.0 add-ons)
- Licensing matrix by category (Open, Derived, Restricted, Commercial, BYO, Link-out)
- Layer-by-layer breakdown with licenses and cadence
- Go/no-go checklist for publishing
- Screening workflow and acceptance criteria

**Audience:** Product managers, data engineers, publishers

---

### [07-Network-and-Security-Architecture.md](./architecture/07-Network-and-Security-Architecture.md) ⭐ NEW
**Purpose:** Complete network topology and security controls

**Contents:**
- VPC architecture with CIDR allocation strategy
- Security group definitions for all services
- Network ACLs (NACLs) for defense-in-depth
- VPC endpoints configuration (gateway and interface)
- Egress filtering and NAT gateway strategy
- AWS WAF configuration with rules
- DDoS protection strategy
- Network flow logs and analysis
- TLS/SSL configuration
- Multi-region topology
- Network audit checklist and incident response runbooks

**Audience:** Network engineers, security engineers, SREs, architects

---

### [08-IAM-Roles-and-Permissions.md](./08-IAM-Roles-and-Permissions.md) ⭐ NEW
**Purpose:** Complete IAM roles, policies, and IRSA configuration

**Contents:**
- IAM role architecture overview
- Infrastructure roles (EKS cluster, nodes, Lambda)
- IRSA roles for all EKS workloads (pack service, MCP gateway, workers, etc.)
- CI/CD roles (GitHub Actions OIDC, Terraform)
- Human/admin roles with MFA requirements
- Complete service account to IAM role mapping
- Terraform implementation examples
- Secrets management strategy
- Least privilege validation procedures
- Audit and compliance checklist
- Emergency procedures for compromised credentials

**Audience:** Platform engineers, security engineers, SREs, DevOps

---

## 🚀 Getting Started

### For Executives and Product Managers
1. Start with **00-Overview-and-Brand.md** for context and vision
2. Review **06-Cost-Modeling-and-Budget.md** for financial planning
3. Check **04-Implementation-Plan.md** for timeline and milestones

### For Architects and Technical Leads
1. Read **00-Overview-and-Brand.md** for context
2. Study **01-Architecture-and-Data-Model.md** for system design
3. Review **07-Network-and-Security-Architecture.md** for network topology
4. Check **02-Services-and-APIs.md** for service contracts
5. Reference **04-Implementation-Plan.md** for dependencies

### For Platform and Backend Engineers
1. Review **01-Architecture-and-Data-Model.md** for system overview
2. Study **08-IAM-Roles-and-Permissions.md** for authentication setup
3. Deep dive into **02-Services-and-APIs.md** for implementation details
4. Reference **04-Implementation-Plan.md** for your epic/task assignments

### For SREs and Infrastructure Engineers
1. Skim **00-Overview-and-Brand.md** for context
2. **Start with these critical docs:**
   - **07-Network-and-Security-Architecture.md** - Network design
   - **08-IAM-Roles-and-Permissions.md** - IAM/IRSA setup
   - **06-Cost-Modeling-and-Budget.md** - Budget planning
3. Use **05-Infrastructure-Setup-Guide.md** as step-by-step implementation guide
4. Review **03-Operations-and-Testing.md** for operational requirements

### For Security Engineers
1. Review **07-Network-and-Security-Architecture.md** for security controls
2. Study **08-IAM-Roles-and-Permissions.md** for access management
3. Check **02-Services-and-APIs.md** for security requirements

### For Financial Planning
1. **06-Cost-Modeling-and-Budget.md** provides complete cost breakdown
2. Use cost calculators and ROI models for business case
3. Review quarterly cost optimization strategies

### For QA and Test Engineers
1. Review **03-Operations-and-Testing.md** for testing strategy
2. Check **04-Implementation-Plan.md** for acceptance criteria

---

## 📋 Key Concepts

### Spatial Packs
Versioned bundles of geospatial data (vector, raster, point cloud) enriched with:
- Schemas and metadata
- Licensing and provenance information
- Delta updates for efficient synchronization

### spatial context CDN
High-performance content delivery network serving:
- Immutable, versioned spatial assets
- Signed URLs for security
- Range request support for large files

### Open Formats
- **Vector:** GeoParquet (storage), PMTiles (delivery)
- **Raster:** COG (Cloud Optimized GeoTIFF)
- **Point Cloud:** COPC (Cloud Optimized Point Cloud)
- **Catalog:** STAC (SpatioTemporal Asset Catalog)

### MCP Tools
Model Context Protocol tools for geospatial operations:
- Accept URIs as input (e.g., `pmtiles://`, `parquet://`)
- Produce published pack layers
- Enable AI-driven workflows

---

## 🎯 Success Metrics

### MVP (M1 - Week 12)
- Single-region pack delivery operational
- p95 first paint < 3s
- Basic MCP tools functional

### Production (M2 - Week 26)
- Multi-region, multi-tenant deployment
- p95 first paint < 2s
- p95 tile hit < 500ms
- Availability ≥ 99.9%
- DR: RPO ≤ 15 min, RTO ≤ 60 min

---

## 🎨 Brand Guidelines

### Color Palette
- **Primary:** Muted Teal `#02b0ad`
- **Accents:** Pink `#f1456d`, Bright Orange `#fe8305`
- **Text:** Black `#121212`
- **Backgrounds:** White `#ffffff`

### Voice & Tone
- Confident and helpful
- Technically sophisticated yet accessible
- Plain language for non-experts

---

## 📞 Support & Resources

### Internal
- **Design Reviews:** Platform Architecture team
- **Implementation Support:** Engineering leads per epic
- **Infrastructure Issues:** SRE team

### External
- [STAC Specification](https://stacspec.org/)
- [PMTiles Documentation](https://github.com/protomaps/PMTiles)
- [Cloud Optimized GeoTIFF](https://www.cogeo.org/)
- [MapLibre GL JS](https://maplibre.org/)

---

## 📝 Document Version

**Version:** 1.0 (Final)  
**Date:** October 24, 2025  
**Status:** Build-ready

---

---

## ✅ Documentation Completion Status

### Phase 1: Initial Documentation ✅ Complete
- Architecture and data model
- Services and APIs
- Operations and testing
- Implementation plan
- Infrastructure setup guide

### Phase 2: Critical Gaps Filled ✅ Complete

All three critical missing components have been added:

#### 1. Cost Modeling & Budget (Document 06) ✅
**Added:** Complete financial modeling across all scales
- MVP environment: ~$680/month
- Production (10TB): ~$5,862/month
- Production (100TB): ~$22,770/month
- Production (1PB): ~$101,775/month
- Per-user and per-API-call economics
- Cost optimization strategies (20-50% savings potential)
- Budget guardrails and monitoring

#### 2. Network & Security Architecture (Document 07) ✅
**Added:** Production-ready network design
- Complete VPC architecture with CIDR allocation
- All security groups with specific rules
- Network ACLs for defense-in-depth
- VPC endpoints configuration
- WAF rules and DDoS protection
- Network flow logs and monitoring
- Multi-region topology

#### 3. IAM Roles & Permissions (Document 08) ✅
**Added:** Complete access management
- 18 IAM roles defined (infrastructure, IRSA, CI/CD, admin)
- IRSA configuration for all EKS workloads
- Complete policy documents (JSON)
- Service account to IAM role mapping
- Terraform implementation examples
- Secrets management strategy
- Audit and compliance procedures

### Implementation Readiness: ✅ READY TO PROCEED

**All prerequisites met:**
- ✅ Architecture fully documented
- ✅ Cost model approved and budgeted
- ✅ Network security design complete
- ✅ IAM/IRSA roles defined
- ✅ Implementation plan detailed
- ✅ Infrastructure setup guide ready
- ✅ Brand and portfolio aligned

**Next Action:** Begin E1 (Foundations) as outlined in Document 05

---

## 🔄 Document Maintenance

This documentation package should be:
- **Reviewed:** Monthly during active development
- **Updated:** When architectural decisions change
- **Versioned:** Using semantic versioning
- **Archived:** Previous versions retained for reference

---

# Spatial.Properties: Complete Documentation Package — Agents & Edge Update

**Version:** 1.1 (Agents & Edge)  
**Date:** 2025-11-05  
**Status:** Publication-ready

This package updates the Spatial.Properties documentation to include **four new epics** and their supporting architecture, APIs, operations, security, IAM, and cost models for **mobile autonomous AI agents**.

## ⭐ New Epics Added

- **E2b — Context Packet Profile (CSP-1)**: A standards-track profile on top of Spatial Packs for small, cacheable, H3/S2-scoped “context packets” (regs, hazards, live layers).  
- **E12b — Edge/Mesh Transport**: Delay-tolerant peer sync, LPWAN/sat fallbacks, and optional BLE/NFC venue beacons for local handoff.  
- **E13b — Publisher Marketplace**: Onboarding, license/provenance gates, revenue share, and policy enforcement for third-party publishers.  
- **E14b — Edge Agent SDKs**: ROS2/Android/iOS/C++ Lite SDKs with route-based prefetch, on-device delta apply, and sensor-fusion hooks.

## Updated Documents

- **00-Overview-and-Brand.md** — adds agent-facing positioning and CSP-1 summary
- **01-Architecture-and-Data-Model.md** — defines CSP-1 schema and policy overlays
- **02-Services-and-APIs.md** — adds Marketplace, Edge Sync Service, device identity & attestation
- **03-Operations-and-Testing.md** — adds DTN testing, edge SLOs, replay-protection runbooks
- **04-Implementation-Plan.md** — adds new epics to WBS, dependencies, RACI, and acceptance
- **05-Infrastructure-Setup-Guide.md** — adds optional sat/LPWAN, BLE/NFC, and NATS bridging steps
- **06-Cost-Modeling-and-Budget.md** — adds per-agent pricing lens and new cost lines (PKI, sat/LPWAN)
- **07-Network-and-Security-Architecture.md** — adds device identity, attestation, P2P/DTN security
- **08-IAM-Roles-and-Permissions.md** — adds roles for Marketplace and Edge Sync services

> These updates **do not change core principles**: pack-first SoR, STAC+open formats, immutable CDN, tenancy, and SLO-driven ops.

## Quick Start

1. Read **00-Overview-and-Brand.md** for scope and positioning.  
2. For architecture & formats, see **01-Architecture-and-Data-Model.md** (CSP-1).  
3. For APIs/services, see **02-Services-and-APIs.md** (Marketplace, Edge Sync, claims).  
4. For delivery plan, see **04-Implementation-Plan.md** (new epics).

---

## Changelog (v1.1)

- Added **CSP-1** profile (context packets) and **policy overlays** schema.
- Added **Edge Sync Service** with DTN/P2P, LPWAN/sat, BLE/NFC handoff.
- Added **Marketplace Service** with license/provenance gates and rev-share.
- Added **Edge Agent SDKs** with route-based prefetch and delta-apply.
- Updated **security**: device certificates, optional attestation, nonce-bound signed URLs.
- Updated **SLOs and runbooks** for edge/DTN.
- Updated **cost model** with per-agent pricing and PKI/sat lines.



## Acronym & Terms Glossary

- **ABAC** — Attribute‑Based Access Control. Authorization based on attributes such as tenant, classification, and role.
- **ALB** — Application Load Balancer.
- **CDN** — Content Delivery Network.
- **COG** — Cloud Optimized GeoTIFF (raster format).
- **COPC** — Cloud Optimized Point Cloud.
- **CRS** — Coordinate Reference System.
- **DR** — Disaster Recovery.
- **EBS** — Elastic Block Store.
- **ECR** — Elastic Container Registry.
- **EKS** — Elastic Kubernetes Service.
- **ETag** — HTTP entity tag used for cache validation.
- **GA** — General Availability.
- **GDAL** — Geospatial Data Abstraction Library.
- **HA** — High Availability.
- **HSTS** — HTTP Strict Transport Security.
- **IAM** — Identity and Access Management.
- **IRSA** — IAM Roles for Service Accounts (EKS).
- **KMS** — Key Management Service.
- **MCP** — Model Context Protocol (tool execution protocol).
- **NACL** — Network Access Control List.
- **NATS** — High‑performance messaging system used for the event bus.
- **OIDC** — OpenID Connect (authentication protocol).
- **P99/P95** — Percentile latencies (99th/95th).
- **PWA** — Progressive Web App.
- **RBAC** — Role‑Based Access Control.
- **RDS** — Relational Database Service (PostgreSQL/PostGIS here).
- **RPO** — Recovery Point Objective.
- **RTO** — Recovery Time Objective.
- **S3** — Simple Storage Service.
- **SDK** — Software Development Kit.
- **SLA** — Service Level Agreement.
- **SLO** — Service Level Objective.
- **SLI** — Service Level Indicator.
- **SoR** — System of Record.
- **STAC** — SpatioTemporal Asset Catalog.
- **TLS** — Transport Layer Security.
- **VPC** — Virtual Private Cloud.
- **WAF** — Web Application Firewall.
- **PMTiles** — Portable, single‑file MBTiles‑like format for tiles.
- **GeoParquet** — Columnar vector storage based on Apache Parquet.
- **DuckDB‑WASM** — In‑browser DuckDB used for client‑side analytics.
- **Temporal/Argo** — Workflow engines for orchestrating build jobs.
- **Signed URL** — Time‑limited URL that authorizes access to assets.
- **Spatial Pack** — Versioned bundle of spatial assets + manifest; the core delivery unit in Spatial.Properties.


> **Naming note:** The external brand is **Spatial.Properties** (domain: `spatial.properties`). *VibeGIS* is a sandbox codename and must never appear in public endpoints, docs, or UI.
