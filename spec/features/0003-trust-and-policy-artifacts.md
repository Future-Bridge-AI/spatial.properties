# Feature 0003 — Trust & Policy Artifacts (Track A)

**Feature Branch**: `0003-trust-and-policy-artifacts`
**Created**: 2025-12-30
**Status**: Draft
**Input**: SpatialWebAlignment.md Track A — Always Valuable (Ship Now)

## Goal

Build buyer trust, compliance credibility, and integration speed through durable primitives that improve the platform even if Spatial Web adoption never happens:

- **A1) Signed Manifests + Integrity Receipts**: cryptographic proof of pack authenticity
- **A2) Machine-Readable License/Policy Contracts**: explicit, checkable usage constraints
- **A3) UDG-lite Lineage Graph**: traversable provenance for explainability
- **A4) Operation Trace Envelope**: auditable, reproducible operations

## Users

- **Pack Consumer** verifying manifest signatures and integrity hashes
- **Enterprise Legal** reviewing machine-readable license/policy contracts
- **Agent/Service** querying lineage graph for provenance explanations
- **Operations Team** auditing publish/tool operations via trace envelopes
- **Compliance Officer** producing evidence trails for regulatory obligations

---

## User Scenarios & Testing

### User Story 1 - Consumer Verifies Pack Integrity (Priority: P1)

A pack consumer downloads a manifest and verifies its signature and asset hashes before trusting the data. This works offline.

**Why this priority**: Foundation of trust — "this is what you say it is."

**Independent Test**: Consumer can verify manifest signature and all asset hashes using CLI or lightweight verifier endpoint.

**Acceptance Scenarios**:

1. **Given** a published pack with `spatialpack.json.sig` and `integrity.json`, **When** consumer runs verification, **Then** signature validates and all asset hashes match.
2. **Given** a pack where one asset was modified after publish, **When** consumer verifies, **Then** verification fails indicating which asset hash mismatches.
3. **Given** a revoked publisher key, **When** consumer attempts verification, **Then** verification fails with "revoked key" error.

---

### User Story 2 - Legal Reviews Machine-Readable Contract (Priority: P2)

Enterprise legal counsel reviews a pack's `contract.json` to understand redistribution rights, derivative rights, attribution rules, and usage constraints before procurement.

**Why this priority**: Faster legal review enables faster sales; prevents accidental misuse.

**Independent Test**: Pack Explorer displays "what you can do with this data" derived from contract.json in plain English.

**Acceptance Scenarios**:

1. **Given** a pack with `contract.json` specifying `redistribution: allowed`, **When** legal views contract summary, **Then** UI shows "Redistribution: Allowed" with attribution requirements.
2. **Given** a pack with `policy.json` specifying `classification: restricted`, **When** legal views policy summary, **Then** UI shows access constraints and embargo windows.
3. **Given** a pack missing `contract.json`, **When** pack is submitted for publish, **Then** publish fails with "missing contract artifact" error.

---

### User Story 3 - Agent Queries Lineage Graph (Priority: P3)

An AI agent asks "why should I trust this layer?" and traverses the lineage graph to explain data provenance from pack → version → layer → asset → source → license.

**Why this priority**: Enables explainability for compliance narratives; differentiates Pack Explorer.

**Independent Test**: Agent can query `/v1/graph/pack/{pack_id}` and receive traversal bundle with provenance chain.

**Acceptance Scenarios**:

1. **Given** a pack with provenance sources, **When** agent queries graph API, **Then** response includes pack → versions → layers → assets → sources → contracts path.
2. **Given** a user without access to a restricted layer, **When** querying graph, **Then** that layer node is redacted from response.
3. **Given** a pack derived from another pack, **When** querying lineage, **Then** `derived_from` relationships are included.

---

### User Story 4 - Operations Audits via Trace Envelope (Priority: P4)

Operations team audits a publish operation by reviewing the trace envelope, which includes `op_id`, `subjects`, `actor`, `timestamp`, `status`, `inputs`, `outputs`, and `provenance`.

**Why this priority**: Debuggability and reproducibility; customer operational confidence.

**Independent Test**: NATS event for `pack.published` includes complete trace envelope; operation can be replayed using logged inputs.

**Acceptance Scenarios**:

1. **Given** a pack publish operation, **When** event is emitted, **Then** envelope includes `op_id`, `op_type: pack.publish`, `subjects: [pack_id]`, `actor`, `timestamp`, `status`.
2. **Given** an MCP tool execution, **When** event is emitted, **Then** envelope includes `inputs`, `outputs`, and `provenance` fields.
3. **Given** a license violation detection, **When** event is emitted, **Then** envelope includes violation details and affected subjects.

---

### Edge Cases

- What happens if publisher's signing key is compromised? → Revoke via CRL; consumers reject packs signed after revocation timestamp.
- What happens if contract.json references a license URL that 404s? → Publish allowed but warning logged; consumer sees "unresolvable license" notice.
- What happens if graph query exceeds depth limit? → Return partial graph with `truncated: true` flag.

---

## Requirements

### Functional Requirements

- **FR-001**: Every published pack MUST have a signed manifest (`spatialpack.json.sig` or embedded signature).
- **FR-002**: Every published pack MUST include `integrity.json` with BLAKE3/SHA256 hashes for all assets.
- **FR-003**: Every pack/layer MUST reference `contract.json` (license + obligations) via `license_ref`.
- **FR-004**: Every pack/layer MUST reference `policy.json` (classification + access constraints) via `policy_ref`.
- **FR-005**: Graph API MUST expose traversal from pack → version → layer → asset → provenance → contract/policy.
- **FR-006**: Graph responses MUST respect tenancy/policy and redact restricted nodes.
- **FR-007**: `pack.published`, `tool.completed`, `license.violation` events MUST include trace envelope with `op_id`, `subjects`, `actor`, `status`, `timestamp`.
- **FR-008**: Publish operations MUST be reproducible using logged inputs + integrity receipts.

### Key Entities

- **Integrity Receipt**: `{ manifest_sha256, asset_hashes: { [name]: hash }, algorithm, build_metadata }`
- **Contract Artifact**: `{ license_id, name, attribution, redistribution, derivatives, constraints[], url }`
- **Policy Artifact**: `{ classification, access_constraints[], embargo_window, visibility[] }`
- **Lineage Graph Node**: `{ type, id, version, relationships[], provenance[], contract_ref, policy_ref }`
- **Operation Trace Envelope**: `{ op_id, op_type, subjects[], actor, timestamp, status, inputs, outputs, provenance, trace }`

### Data Contracts

**New pack-level artifacts:**
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

**Manifest additions:**
```json
{
  "integrity_uri": "https://cdn.../integrity.json",
  "signature_uri": "https://cdn.../spatialpack.json.sig",
  "contract_ref": "https://cdn.../contract.json",
  "policy_ref": "https://cdn.../policy.json"
}
```

---

## API (v0)

### Verification
- `GET /v0/packs/{pack_id}/verify` → verification result (signature valid, hashes match)
- CLI: `spatialpack verify --pack <uri>`

### Graph API (UDG-lite)
- `GET /v1/graph/pack/{pack_id}` → traversal bundle (pack → layers → assets → provenance)
- `POST /v1/graph/query` → constrained query with depth/filter options

### Events (NATS)
- `pack.published` → trace envelope
- `tool.completed` → trace envelope
- `license.violation` → trace envelope with violation details

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every published pack has verifiable signature + integrity receipt.
- **SC-002**: Contract/policy artifacts present in 100% of published packs.
- **SC-003**: Pack Explorer displays trust summary for all packs.
- **SC-004**: Publish operations reproducible from audit logs (verified quarterly).
- **SC-005**: Legal review time reduced by 50% (post-launch survey).

---

## Non-Goals (v0)

- DID/SWID canonical identity everywhere (Track B).
- HSML/JSON-LD interop views (Track B).
- HSTP-like operation compatibility (Track B).
- Public UDG beyond tenant-scoped graph (Track B).

---

## Metrics (v0)

- Verification calls per day
- Verification failures (signature/hash mismatch)
- Graph API queries per day
- Contract/policy resolution success rate
- Trace envelope completeness (% with all required fields)

---

## Rollout

1. Define integrity.json, contract.json, policy.json schemas.
2. Implement signing workflow in pack builder CLI.
3. Implement verification CLI and optional endpoint.
4. Add contract/policy reference fields to spatialpack.json.
5. Build UDG-lite graph materialization from STAC + manifests + provenance.
6. Implement minimal graph API (tenant-scoped).
7. Add trace envelope to NATS event payloads.
8. Update Pack Explorer to display trust summary.

---

## Risks

- Over-complicating contract schema before understanding buyer needs.
- Graph API performance issues at scale.

**Mitigations:**
- Start with minimal contract fields covering core use cases.
- Implement graph caching and depth limits.

---

## Open Questions

- What is the minimal contract schema? (redistribution, derivatives, attribution, constraints, allowed_use)
- Where to store integrity receipts? (alongside artifacts + metadata DB?)
- How to present provenance to non-technical stakeholders? ("trust summary" + drill-down graph?)

---

## References

- `Docs/Updates/SpatialWebAlignment.md` (source - Track A)
- `Docs/architecture/04-Trust-and-Compatibility-Strategy.md` (technical detail)
