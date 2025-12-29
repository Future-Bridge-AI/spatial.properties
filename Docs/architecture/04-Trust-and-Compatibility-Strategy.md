# 04 — Trust & Compatibility Strategy (Two-Track Approach)

## Purpose

We want the benefits of "Spatial Web-shaped" interoperability **without** taking on early scope that slows shipping or distracts from our WA greenfield compliance wedge.

This document defines a **two-track strategy**:

- **Track A — Always Valuable (Ship Now)**: Improves trust, compliance credibility, and integrator experience even if Spatial Web adoption never happens.
- **Track B — Spatial Web Optional (Ship on Pull)**: Adds formal compatibility hooks only when there is real market pull.

---

## 0. Principles

- **Wedge first**: Anything we do must directly support "site selection + de-risking + compliance" outcomes.
- **Additive only**: No breaking changes to pack consumers.
- **Provenance & policy are product**: Trust, licensing clarity, and auditability are differentiators.
- **Keep the door open**: Design Track A so Track B can attach cleanly later.

---

## 1. Track A — Always Valuable (Ship Now)

### A1) Signed Manifests + Integrity Receipts

**What:**
- Packs publish an immutable `spatialpack.json`
- Add:
  - **Manifest signature** (publisher signing key)
  - **Integrity receipt**: canonical hashes for each asset + manifest, plus build metadata

**Why it moves the needle:**
- Builds buyer trust ("this is what you say it is")
- Enables safe caching/offline validation for agents/field teams
- Gives compliance and audit stakeholders something concrete

**Deliverables:**
- `spatialpack.json.sig` (or embedded signature section)
- `integrity.json` (hash list + algorithm + build metadata)
- Verification CLI or lightweight verifier endpoint

**Data Contract:**
```json
// integrity.json
{
  "manifest_sha256": "sha256:abc123...",
  "algorithm": "blake3",
  "asset_hashes": {
    "land.tenure.pmtiles": "blake3:def456...",
    "land.tenure.parquet": "blake3:ghi789..."
  },
  "build": {
    "builder": "spatialpack-cli@1.2.0",
    "timestamp": "2025-12-30T10:00:00Z",
    "inputs_hash": "blake3:jkl012..."
  }
}
```

---

### A2) Machine-Readable License/Policy Contract Artifact

**What:**
- Make licensing and usage constraints explicit and machine-checkable
- Convert "terms" into artifacts referenced by packs/layers

**Why it moves the needle:**
- Enterprise legal review becomes faster
- Marketplace scaling becomes safer
- Enables policy-aware filtering and prevents accidental misuse

**Deliverables:**
- `contract.json` (license + obligations + constraints + attribution requirements)
- `policy.json` (classification, access constraints, embargo windows)
- Pack manifest references: `license_ref`, `policy_ref`

**Data Contracts:**
```json
// contract.json
{
  "license_id": "custom-wa-greenfield-eval",
  "name": "WA Greenfield Evaluation License",
  "attribution": "© 2025 Spatial.Properties and data licensors",
  "redistribution": "allowed",
  "derivatives": "with-attribution",
  "constraints": [
    "Non-commercial use only for v0",
    "No redistribution of sensitive environmental layers"
  ],
  "url": "https://spatial.properties/licenses/wa-greenfield-eval-v1"
}

// policy.json
{
  "classification": "mixed",
  "access_constraints": [
    { "layer_pattern": "env.*", "min_role": "analyst" },
    { "layer_pattern": "land.*", "min_role": "viewer" }
  ],
  "embargo_window": null,
  "visibility": ["demo:viewer", "demo:analyst"]
}
```

---

### A3) UDG-lite (Lineage/Discovery Graph) — Internal First

**What:**
- Build a **scoped graph** from what we already store:
  - pack → version → layer → asset
  - `derived_from` provenance sources
  - `licensed_by` / `restricted_by` relationships
  - `covers_cell` (H3/S2) and `valid_at` time/version edges

**Why it moves the needle:**
- Powers "Pack Explorer" discovery and differentiation
- Enables explainability ("why should I trust this layer?")
- Enables compliance narratives ("this pack supports obligation X because it includes layers Y derived from sources Z with license L")

**Deliverables:**
- Graph materialization job (from STAC + manifests + provenance)
- Minimal API:
  - `GET /v1/graph/pack/{pack_id}` (returns traversal bundle)
  - `POST /v1/graph/query` (constrained query)
- Policy-aware redaction/filtering

> Note: This is **not** a public global graph. Start tenant-scoped, then selectively expose for public packs.

---

### A4) Operation Trace Envelope (Not HSTP)

**What:**
- Standardize tracing for key actions:
  - publish pack/version
  - publish delta
  - run MCP tool
- Use a consistent envelope across REST + NATS event payloads

**Why it moves the needle:**
- Debuggability improves
- Customers get operational confidence
- Enables audit logs and reproducibility

**Deliverables:**
- Envelope fields: `op_id`, `op_type`, `subjects`, `actor`, `timestamp`, `status`, `inputs`, `outputs`, `provenance`, `trace`
- NATS events emit envelopes with consistent fields

**Data Contract:**
```json
{
  "op_id": "op_01ABC...",
  "op_type": "pack.publish",
  "subjects": ["spatial.properties:wa:land-greenfield:v1"],
  "actor": "publisher:demo@spatial.properties",
  "timestamp": "2025-12-30T10:00:00Z",
  "status": "completed",
  "inputs": {
    "manifest_uri": "s3://...",
    "artifact_uris": ["s3://..."]
  },
  "outputs": {
    "pack_id": "spatial.properties:wa:land-greenfield:v1",
    "cdn_uri": "https://cdn...."
  },
  "provenance": {
    "builder": "spatialpack-cli@1.2.0",
    "inputs_hash": "blake3:..."
  },
  "trace": {
    "trace_id": "abc123",
    "span_id": "def456"
  }
}
```

---

## 2. Track B — Spatial Web Optional (Ship on Pull)

> This track is only activated when we have strong evidence it changes buying decisions, partnerships, or procurement outcomes.

### B1) SWID/DID Canonical Identity Everywhere

**What:**
- Assign DID/SWID-style identifiers to:
  - publisher/tenant
  - pack, version, layer, asset
  - agent/device

**When it's worth it:**
- A buyer/integrator explicitly needs DID anchoring
- Government/defence interoperability requirements reward DID-based identity
- Partner ecosystems want resolvable identifiers outside our platform

**Deliverables:**
- DID documents resolvable via HTTPS (`did:web` pattern)
- Offline-capable device identities (`did:key`) where needed

---

### B2) HSML / JSON-LD Interop Views

**What:**
- Dual-publish:
  - Operational truth remains `spatialpack.json`
  - Export an HSML-ish JSON-LD view for "Spatial Web consumers"

**When it's worth it:**
- A strategic partner asks for it
- We pursue a Spatial Web coalition narrative for investors/partners
- Tooling exists in target ecosystem that makes HSML exports valuable

---

### B3) HSTP-Like Operation Compatibility

**What:**
- Wrap existing REST + NATS operations in an HSTP-ish semantic envelope

**When it's worth it:**
- We integrate into ecosystems already using HSTP semantics
- We are targeting agent networks that expect standardized operations

---

### B4) Public UDG (Beyond UDG-lite)

**What:**
- Publish a broader, linkable, cross-domain graph

**When it's worth it:**
- Public marketplace scale requires cross-domain interoperability
- Governance model and legal posture can support it

---

## 3. MVP Cutline (What We Ship First)

### MVP = Track A Only

**We ship:**
- Signed manifests + integrity receipts (A1)
- Machine-readable contract artifacts (A2)
- UDG-lite internal graph (A3)
- Operation trace envelope for publish + tool execute (A4)

**We explicitly do NOT ship in MVP:**
- DID/SWID everywhere (B1)
- HSML exports (B2)
- HSTP compatibility (B3)
- Public UDG (B4)

This keeps us focused on wedge traction while building durable primitives.

---

## 4. Acceptance Criteria (MVP)

### Identity & Integrity
- Every published pack version has:
  - A deterministic manifest
  - An integrity receipt with hashes for all assets
  - A verifiable signature chain (publisher key)

### Policy & Licensing
- Every pack/layer references:
  - `contract.json` (license + obligations)
  - `policy.json` (classification + access constraints)
- Pack Explorer can display "what you can do with this data" in plain English derived from these artifacts

### Graph & Discovery
- Given a pack ID, a client can traverse:
  - pack → versions → layers → assets → provenance → contract/policy
- Graph responses respect tenancy/policy and redact restricted nodes/edges

### Operations & Auditability
- `pack.published`, `tool.completed`, and `license.violation` events include:
  - `op_id`, `subjects`, `actor`, `status`, `timestamp`
- A publish operation can be replayed/reproduced using logged inputs + integrity receipts

### No Regressions
- Existing pack consumers remain unaffected
- CDN paths and performance remain unchanged

---

## 5. Success Measures

Track A should measurably improve:
- **Sales enablement**: faster buyer confidence in data quality and licensing clarity
- **Integration speed**: clearer contracts + predictable manifests reduce time-to-first-map
- **Compliance credibility**: defensible provenance and audit trail for regulatory obligations
- **Product differentiation**: Pack Explorer becomes a trust-and-lineage interface, not just a file browser

---

## 6. Activation Criteria for Track B (Hard Gates)

We only start Track B when **at least one** is true:

1. **Buyer pull**: ≥2 decision-makers say "Spatial Web compliance changes procurement outcome"
2. **Partner pull**: A strategic partner requires DID/HSML/HSTP alignment
3. **Go-to-market shift**: We pivot into robotics/agent ecosystems where DID + standardized operations are table-stakes
4. **Tender requirement**: An RFP explicitly scores standards compliance that Spatial Web compatibility satisfies

**If none of these are true, Track B stays parked.**

---

## 7. Implementation Roadmap

### Track A Timeline

| Deliverable | Target |
|-------------|--------|
| A1: Integrity receipt schema + signing workflow | Phase 1 |
| A1: Verification CLI | Phase 1 |
| A2: contract.json + policy.json schemas | Phase 1 |
| A2: Manifest references (license_ref, policy_ref) | Phase 1 |
| A3: UDG-lite graph materialization | Phase 2 |
| A3: Graph API (tenant-scoped) | Phase 2 |
| A4: Trace envelope in NATS events | Phase 1 |
| Pack Explorer trust summary UI | Phase 2 |

### Track B Timeline

**Parked** until activation criteria met.

---

## 8. Open Questions (Track A Focused)

1. What is the minimal "contract" schema that covers:
   - Redistribution rights
   - Derivative rights
   - Attribution rules
   - Allowed use constraints (commercial/non-commercial)

2. Where do we store integrity receipts:
   - Alongside artifacts in object storage, and/or also in metadata DB?

3. How do we present provenance to non-technical stakeholders in Pack Explorer:
   - "Trust summary" + drill-down graph?

---

## References

- Feature Spec: `spec/features/0003-trust-and-policy-artifacts.md`
- Source: `Docs/Updates/SpatialWebAlignment.md`
- Related: `Docs/architecture/03-Schema-Registry-and-Validation.md`
