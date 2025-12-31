# Feature 0005 — WA Bushfire Vegetation Clearance (Compliance Vertical)

**Feature Branch**: `0005-wa-bushfire-vegetation-clearance`
**Created**: 2025-12-30
**Status**: Draft
**Input**: wa-bushfire-vegetation-clearance-context-pack.md, wa-power-network-private-pack.md, bushfire-vegetation-clearance-toolset.md, vegetation-clearance-evidence-pack.md

## Goal

Deliver a complete **compliance vertical** demonstrating how Spatial Packs enable auditable, traceable vegetation clearance operations for power infrastructure in Western Australia. This vertical showcases:

- **Pack composition**: Regulatory context + private assets + evidence artifacts
- **Deterministic tooling**: Rules-first compliance decisions with full audit trail
- **LLM-assisted outputs**: Bounded AI for explanations, notices, and narratives
- **Separation of concerns**: Context packs (reusable) vs private packs (customer-scoped) vs evidence packs (immutable records)

**Primary Audience**: Regional utilities, network operators, local governments, compliance teams
**Geography**: Western Australia (AU-WA)
**Regulatory Scope**: Bushfire risk, vegetation clearance near overhead conductors

---

## Pack Promise

When a customer deploys this compliance vertical, they can:

- **Compute required clearances** based on conductor class, span length, and fire-risk modifiers
- **Assign responsibility** (network operator vs landowner) using land tenure and vegetation classification
- **Gate operations** with safety checks (danger zones) and environmental triggers (native vegetation)
- **Generate auditable evidence** (photos, inspection forms, task events) as immutable packs
- **Produce compliance narratives** that cite specific rules, artifacts, and evidence IDs

---

## Pack Architecture (Three-Pack Model)

### Pack 1: WA Bushfire Vegetation Clearance Context Pack

**Pack ID**: `au-wa-bushfire-veg-clearance-context`
**Visibility**: Public / Licensed
**Purpose**: Jurisdiction-specific regulatory and spatial context

This pack does **not** contain customer asset data. It is designed to be combined with private network packs.

#### Artifacts

| Category | Artifact | Description |
|----------|----------|-------------|
| Rules | `rules/clearance_rules.json` | Min horizontal/vertical clearances by conductor class, span length, fire-risk modifier |
| Rules | `rules/responsibility_rules.json` | Responsibility assignment (verge vs private, planted vs natural) |
| Rules | `rules/safety_gates.json` | Danger-zone definitions for work near live conductors |
| Rules | `rules/environmental_gates.json` | Native vegetation permit-check triggers |
| Boundaries | `boundaries/road_reserves.parquet` | Road reserve geometries |
| Boundaries | `boundaries/cadastre_parcels.parquet` | Cadastral parcel boundaries |
| Boundaries | `boundaries/local_government_areas.parquet` | LGA boundaries |
| Environment | `environment/fire_risk_areas.parquet` | Fire risk classification areas |
| Environment | `environment/native_vegetation_sensitivity.parquet` | Native vegetation sensitivity zones |
| Docs | `docs/regulatory_sources.md` | Source regulations and legislation |
| Docs | `docs/rule_interpretation_notes.md` | Interpretation guidance |

#### Manifest (Conceptual)

```json
{
  "pack_id": "au-wa-bushfire-veg-clearance-context",
  "version": "2025.01",
  "jurisdiction": "AU-WA",
  "topics": ["bushfire", "vegetation", "compliance", "infrastructure"],
  "contract_ref": "contract.json",
  "policy_ref": "policy.json",
  "integrity_uri": "integrity.json",
  "artifacts": ["rules/*", "boundaries/*", "environment/*", "docs/*"]
}
```

---

### Pack 2: WA Power Network Private Pack

**Pack ID**: `{customer}-wa-power-network`
**Visibility**: Private (customer-scoped)
**Purpose**: Customer-owned power network assets

This pack gains value only when combined with regulatory context packs and compliance toolsets.

#### Artifacts

| Category | Artifact | Description |
|----------|----------|-------------|
| Network | `network/poles.parquet` | Pole locations and attributes |
| Network | `network/spans.parquet` | Span geometries (pole-to-pole) |
| Network | `network/conductors.parquet` | Conductor geometries and types |
| Attributes | `network/asset_attributes.json` | Voltage class, conductor type, span length, asset IDs |

#### Data Requirements

- Geometry must be spatially valid
- Asset IDs must be stable across versions
- Attributes must map cleanly to clearance rules

#### Manifest (Conceptual)

```json
{
  "pack_id": "customer-x-wa-power-network",
  "version": "2025.01",
  "visibility": "private",
  "topics": ["power", "infrastructure", "network"],
  "contract_ref": "contract.json",
  "policy_ref": "policy.json",
  "artifacts": ["network/*"]
}
```

---

### Pack 3: Vegetation Clearance Evidence Pack

**Pack ID**: `{customer}-veg-clearance-evidence`
**Visibility**: Private (audit-grade)
**Purpose**: Immutable, audit-grade evidence from compliance operations

This pack is the **system of record** for what occurred during vegetation clearance operations.

#### Artifacts

| Category | Artifact | Description |
|----------|----------|-------------|
| Evidence | `evidence/photos/*` | Geo-tagged inspection photos |
| Evidence | `evidence/inspection_forms/*.json` | Completed inspection forms |
| Evidence | `evidence/task_events.parquet` | Task execution events with timestamps |
| Reports | `reports/audit_report_YYYYMMDD.pdf` | Generated audit reports |

#### Properties

- **Immutable** once published
- **Content-addressable** artifacts (hash-verified)
- **Time-stamped** and **spatially anchored**

#### Intended Use

- Regulatory audits
- Internal assurance
- Incident response
- Legal defensibility

#### Manifest (Conceptual)

```json
{
  "pack_id": "customer-x-veg-clearance-evidence",
  "version": "2025.01",
  "topics": ["compliance", "evidence", "audit"],
  "integrity_uri": "integrity.json",
  "signature_uri": "spatialpack.json.sig",
  "artifacts": ["evidence/*", "reports/*"]
}
```

---

## Compliance Toolset

All tools follow the principle: **Rules before language. Deterministic first, LLM second.**

### Deterministic Tools (Auditable)

These tools produce traceable outputs that can be reproduced and audited.

#### 1. compute_required_clearance

Calculates vegetation clearance requirements based on encoded rules.

**Inputs:**
- Span geometry
- Conductor attributes (voltage class, bare/insulated)
- Clearance rules pack reference

**Outputs:**
- Required horizontal clearance (m)
- Required vertical clearance (m)
- Fire-risk modifiers applied
- Rule trace (rule ID + version)

---

#### 2. assign_responsible_party

Determines responsibility for vegetation management.

**Inputs:**
- Asset location
- Parcel and verge boundaries
- Responsibility rules reference

**Outputs:**
- Responsible party classification (network operator / landowner / shared)
- Legal basis reference

---

#### 3. danger_zone_gate

Safety classification for work near live conductors.

**Inputs:**
- Proposed task geometry
- Voltage class

**Outputs:**
- Safety classification (safe / restricted / prohibited)
- Required controls / exclusions

---

#### 4. environmental_gate

Environmental compliance trigger check.

**Inputs:**
- Task geometry
- Environmental overlays

**Outputs:**
- Permit or exemption check required (yes/no)
- Triggered overlays list

---

#### 5. risk_to_action

Converts risk assessments into prioritised actions.

**Inputs:**
- Risk flags from assessments
- Operational thresholds

**Outputs:**
- Prioritised task list
- SLA recommendations

---

### LLM-Assisted Tools (Bounded)

These tools use LLM capabilities within strict boundaries. They always cite artifact IDs and rule references.

#### explain_flag

Produces human-readable explanation of compliance flags.

**Output includes:**
- Why an asset is non-compliant
- Which rule triggered (ID + version)
- What action is required

---

#### draft_notice

Generates formal notice text for responsible parties.

**Output includes:**
- Responsible party identification
- Asset reference
- Required action and deadline
- Legal basis citation

---

#### audit_narrative

Summarises compliance activity for audit purposes.

**Output includes:**
- Risk identified (with artifact refs)
- Actions taken (with timestamps)
- Evidence captured (with artifact IDs)

---

## User Scenarios & Testing

### User Story 1 - Network Operator Assesses Clearance Compliance (Priority: P1)

A network operator loads the context pack and their private network pack, then runs `compute_required_clearance` to identify spans requiring vegetation management.

**Why this priority**: Core compliance workflow.

**Acceptance Scenarios**:

1. **Given** both packs loaded, **When** operator runs clearance assessment on a span, **Then** required clearances are returned with rule trace.
2. **Given** a span in a high fire-risk area, **When** clearance is computed, **Then** fire-risk modifier is applied and documented.
3. **Given** assessment results, **When** operator exports report, **Then** rule IDs and versions are included.

---

### User Story 2 - Compliance Team Assigns Responsibility (Priority: P2)

A compliance team uses `assign_responsible_party` to determine who must clear vegetation for each flagged location.

**Acceptance Scenarios**:

1. **Given** a flagged location on private land, **When** responsibility is computed, **Then** landowner is identified with legal basis.
2. **Given** a flagged location on road reserve, **When** responsibility is computed, **Then** network operator is identified.
3. **Given** planted vegetation near conductor, **When** responsibility is computed, **Then** appropriate rule is applied.

---

### User Story 3 - Field Team Captures Evidence (Priority: P3)

A field team completes vegetation clearance work and captures geo-tagged photos, inspection forms, and task events into an evidence pack.

**Acceptance Scenarios**:

1. **Given** work completed at a site, **When** evidence is captured, **Then** artifacts include location and timestamp.
2. **Given** evidence pack published, **When** integrity is verified, **Then** all hashes match.
3. **Given** audit request, **When** evidence pack is retrieved, **Then** artifacts are traceable to original task.

---

### User Story 4 - Auditor Reviews Compliance Trail (Priority: P4)

An auditor retrieves context pack, assessment outputs, and evidence pack to verify compliance decisions.

**Acceptance Scenarios**:

1. **Given** all three packs available, **When** auditor traces a decision, **Then** rule → assessment → action → evidence chain is complete.
2. **Given** LLM-generated narrative, **When** auditor reviews, **Then** all citations resolve to valid artifacts.
3. **Given** same inputs, **When** assessment is re-run, **Then** outputs are identical (deterministic).

---

## Requirements

### Functional Requirements

- **FR-001**: Context pack MUST include clearance, responsibility, safety, and environmental rules as machine-readable JSON.
- **FR-002**: Private network pack MUST include poles, spans, and conductors with stable asset IDs.
- **FR-003**: Evidence pack MUST be immutable once published with integrity hashes for all artifacts.
- **FR-004**: All deterministic tools MUST include rule trace in outputs (rule ID + version).
- **FR-005**: All LLM-assisted tools MUST cite artifact IDs; no unbounded inference.
- **FR-006**: Context pack MUST NOT contain customer asset data.
- **FR-007**: Evidence pack MUST support regulatory audits with content-addressable artifacts.
- **FR-008**: All packs MUST include `contract.json` and `policy.json` references.

### Non-Functional Requirements

- **NFR-001**: Deterministic tools MUST produce identical outputs for identical inputs.
- **NFR-002**: Evidence pack artifacts MUST be time-stamped and spatially anchored.
- **NFR-003**: Rule updates MUST follow semver; breaking changes require major version bump.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Context pack validates against spatialpack.json schema with zero errors.
- **SC-002**: At least 4 deterministic tools operational (clearance, responsibility, safety, environmental).
- **SC-003**: Evidence pack integrity verification passes for all artifacts.
- **SC-004**: Audit trail from rule → assessment → evidence is traversable.
- **SC-005**: At least 1 pilot customer completes full compliance workflow.
- **SC-006**: LLM-assisted outputs always include artifact citations (no hallucinated references).

---

## Non-Goals (v0)

- Autonomous enforcement (human approval required for actions)
- Legal interpretation beyond encoded rules
- Real-time field app (batch workflows first)
- Multi-jurisdiction support (WA only for v0)

---

## Update Cadence

| Pack Type | Target Cadence | Notes |
|-----------|----------------|-------|
| Context pack (rules) | Quarterly | Align to regulatory review cycle |
| Context pack (boundaries) | Annual | Cadastre/LGA updates |
| Private network pack | As changed | Customer maintains |
| Evidence pack | Per operation | Immutable after publish |

---

## Risks

- **Regulatory interpretation drift**: Rules may be interpreted differently over time.
  - Mitigation: Explicit rule documentation, versioning, interpretation notes.
- **Jurisdictional edge cases**: Some scenarios may not fit encoded rules.
  - Mitigation: Human review workflow for edge cases; rules mark confidence level.
- **LLM hallucination**: AI-generated content may include invalid references.
  - Mitigation: Strict citation requirements; validation that all refs resolve.

---

## Design Principles

1. **Rules before language**: Deterministic logic produces the decision; LLM assists with communication.
2. **Deterministic first, LLM second**: Every compliance output has a traceable rule-based foundation.
3. **No unbounded inference**: LLMs operate within defined boundaries with mandatory citations.
4. **Every output traceable**: Full audit trail from rule → assessment → action → evidence.
5. **Separation of concerns**: Context (reusable) vs assets (private) vs evidence (immutable).

---

## Open Questions

- What is the exact JSON schema for clearance rules (voltage class × span length × fire-risk)?
- How should rule versioning handle mid-year regulatory changes?
- What evidence retention period is required for regulatory compliance?
- Should evidence packs support digital signatures from field personnel?

---

## References

- `Docs/Updates/wa-bushfire-vegetation-clearance-context-pack.md` (source)
- `Docs/Updates/wa-power-network-private-pack.md` (source)
- `Docs/Updates/bushfire-vegetation-clearance-toolset.md` (source)
- `Docs/Updates/vegetation-clearance-evidence-pack.md` (source)
- `Docs/architecture/02-Services-and-APIs.md` (MCP tools reference)
- `spec/features/0003-trust-and-policy-artifacts.md` (trust artifacts)
