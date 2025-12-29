# 05 — Trust & Compatibility Roadmap (Two-Track Strategy)

## Overview

This document outlines the phased implementation of trust artifacts and Spatial Web compatibility.

**Key Principle:** Ship valuable primitives now (Track A); defer Spatial Web standards until market pull (Track B).

---

## Track A — Always Valuable (Ship Now)

### Timeline Overview

| Component | Phase | Target |
|-----------|-------|--------|
| A1: Integrity receipts + signing | Phase 1 | MVP |
| A1: Verification CLI | Phase 1 | MVP |
| A2: contract.json + policy.json schemas | Phase 1 | MVP |
| A2: Manifest references (license_ref, policy_ref) | Phase 1 | MVP |
| A3: UDG-lite graph materialization | Phase 2 | Post-MVP |
| A3: Graph API (tenant-scoped) | Phase 2 | Post-MVP |
| A4: Trace envelope in NATS events | Phase 1 | MVP |
| Pack Explorer trust summary UI | Phase 2 | Post-MVP |

---

### A1: Signed Manifests + Integrity Receipts

**Phase 1 Deliverables:**
- `integrity.json` schema definition
- Signing workflow in pack builder CLI
- `spatialpack.json.sig` generation
- Verification CLI: `spatialpack verify --pack <uri>`

**Acceptance Criteria:**
- [ ] Every published pack has `integrity.json` with BLAKE3/SHA256 hashes
- [ ] Every published pack has verifiable signature
- [ ] Verification works offline with cached CRL

---

### A2: Machine-Readable Contracts

**Phase 1 Deliverables:**
- `contract.json` schema (license, attribution, redistribution, derivatives, constraints)
- `policy.json` schema (classification, access constraints, visibility)
- Manifest fields: `contract_ref`, `policy_ref`

**Acceptance Criteria:**
- [ ] Every published pack references `contract.json` and `policy.json`
- [ ] Pack Explorer displays "what you can do with this data" summary

---

### A3: UDG-lite Lineage Graph

**Phase 2 Deliverables:**
- Graph materialization job (from STAC + manifests + provenance)
- `GET /v1/graph/pack/{pack_id}` endpoint
- `POST /v1/graph/query` endpoint
- Policy-aware redaction

**Acceptance Criteria:**
- [ ] Client can traverse pack → versions → layers → assets → provenance
- [ ] Restricted nodes redacted based on tenant/role

---

### A4: Operation Trace Envelope

**Phase 1 Deliverables:**
- Envelope schema: `op_id`, `op_type`, `subjects`, `actor`, `timestamp`, `status`, `inputs`, `outputs`, `provenance`, `trace`
- Events emit envelopes: `pack.published`, `tool.completed`, `license.violation`

**Acceptance Criteria:**
- [ ] All key events include complete trace envelope
- [ ] Operations reproducible from logged inputs + integrity receipts

---

## Track B — Spatial Web Optional (Parked)

### Activation Criteria (Hard Gates)

We only start Track B when **at least one** is true:

| Gate | Trigger |
|------|---------|
| Buyer pull | ≥2 decision-makers say "Spatial Web compliance changes procurement outcome" |
| Partner pull | Strategic partner requires DID/HSML/HSTP alignment |
| Go-to-market shift | Pivot into robotics/agent ecosystems where DID is table-stakes |
| Tender requirement | RFP explicitly scores Spatial Web standards compliance |

**If none are true, Track B stays parked.**

### Track B Components (Future)

| Component | Description | Trigger |
|-----------|-------------|---------|
| B1: SWID/DID everywhere | Canonical identifiers for publishers, packs, agents | Partner/buyer pull |
| B2: HSML/JSON-LD exports | Dual-publish for Spatial Web consumers | Partner request |
| B3: HSTP-like operations | Semantic operation envelope | Ecosystem integration |
| B4: Public UDG | Cross-domain linkable graph | Marketplace scale |

---

## Success Measures

Track A should measurably improve:

| Metric | Target |
|--------|--------|
| Sales enablement | Buyer confidence in data quality/licensing increases (survey) |
| Integration speed | Time-to-first-map reduced by 30% |
| Compliance credibility | Defensible audit trail for regulatory obligations |
| Product differentiation | Pack Explorer becomes trust interface, not file browser |

---

## Implementation Dependencies

```
Phase 1: A1 (Integrity) + A2 (Contracts) + A4 (Traces)
         ↓
Phase 2: A3 (Graph) + Pack Explorer UI
         ↓
Track B: Only if activation criteria met
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Over-complicating contract schema | Start with minimal fields covering core use cases |
| Graph API performance at scale | Implement caching and depth limits |
| Premature Track B investment | Hard gates prevent starting without clear signal |

---

## References

- Feature Spec: `spec/features/0003-trust-and-policy-artifacts.md`
- Architecture: `Docs/architecture/04-Trust-and-Compatibility-Strategy.md`
- Source: `Docs/Updates/SpatialWebAlignment.md`
