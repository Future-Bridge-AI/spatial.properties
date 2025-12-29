# Feature 0002 — Schema Registry & Validation (MVP)

**Feature Branch**: `0002-schema-registry-validation`
**Created**: 2025-12-30
**Status**: Draft
**Input**: Vecorel alignment for schema registry, extensions, and validation

## Goal

Enable trust and integration speed by providing:
- **Schema Registry**: canonical, versioned URIs for layer/feature schemas
- **Extensions Framework**: composable, versioned add-ons per layer
- **Validation & Conformance**: repeatable validation with machine-readable reports

## Users

- **Publisher** adding `schema_uri` to vector layers and validating before publish
- **Consumer/Agent** resolving schemas to understand field contracts
- **CI Pipeline** running validation and gating on conformance reports
- **Platform Operator** managing schema versions and breaking changes

---

## User Scenarios & Testing

### User Story 1 - Publisher Validates Before Publish (Priority: P1)

A pack publisher adds a `schema_uri` to a vector layer and runs validation before publishing. The validator checks required properties, types, and constraints, then outputs a conformance report.

**Why this priority**: Core value prop — prevents broken packs from shipping; builds buyer trust.

**Independent Test**: Publisher can run `spatialpack validate` against a layer with a schema_uri and receive pass/fail + report.

**Acceptance Scenarios**:

1. **Given** a vector layer with `schema_uri` pointing to a valid schema, **When** publisher runs validation, **Then** validator returns pass with conformance report artifact.
2. **Given** a vector layer missing required properties defined in schema, **When** publisher runs validation, **Then** validator returns fail with error list.
3. **Given** a vector layer with `schema_uri` that cannot be resolved, **When** publisher runs validation, **Then** validator returns error indicating unresolvable schema.

---

### User Story 2 - Consumer Resolves Schema (Priority: P2)

A pack consumer (human or agent) retrieves the `schema_uri` from a layer entry and resolves it to a machine-readable schema document describing fields, types, and constraints.

**Why this priority**: Enables downstream integration without guesswork; reduces support load.

**Independent Test**: Consumer can HTTP GET the schema_uri and receive a JSON Schema document.

**Acceptance Scenarios**:

1. **Given** a layer with `schema_uri: https://schemas.spatial.properties/v1/base/transport/roads@12.1.0`, **When** consumer fetches the URI, **Then** response is a valid JSON Schema with properties, types, and required fields.
2. **Given** a schema_uri with version tag, **When** consumer requests it, **Then** the response is immutable and cacheable.

---

### User Story 3 - CI Pipeline Gates on Conformance (Priority: P3)

A CI/CD pipeline runs `spatialpack validate` as part of the build process. If validation fails, the build fails. On success, the conformance report is attached as an artifact and referenced in the pack manifest.

**Why this priority**: Automation prevents human error; enables compliance workflows.

**Independent Test**: CI job can execute validator CLI and parse exit code + JSON report.

**Acceptance Scenarios**:

1. **Given** a pack with all layers passing validation, **When** CI runs validator, **Then** exit code is 0 and conformance report shows `status: pass`.
2. **Given** a pack with one layer failing validation, **When** CI runs validator, **Then** exit code is non-zero and report shows `status: fail` with errors.
3. **Given** a passing validation run, **When** CI publishes, **Then** pack manifest includes `validation.conformance_uri` referencing the report.

---

### User Story 4 - Schema Breaking Change (Priority: P4)

A schema maintainer needs to remove or rename a field. The platform enforces major version bump and migration guidance documentation.

**Why this priority**: Protects downstream consumers from silent breakage.

**Independent Test**: Attempt to publish a breaking change without major version bump fails with clear error.

**Acceptance Scenarios**:

1. **Given** a schema at version `12.1.0` with field `road_name`, **When** maintainer removes field and publishes as `12.2.0`, **Then** registry rejects with "breaking change requires major version bump".
2. **Given** a schema at version `12.1.0`, **When** maintainer removes field and publishes as `13.0.0` with migration notes, **Then** registry accepts and publishes deprecation notice.

---

### Edge Cases

- What happens when schema_uri returns 404 during validation? → Validation fails with clear error.
- What happens when schema references an extension that cannot be resolved? → Validation fails listing unresolvable extensions.
- What happens when a layer has no `schema_uri`? → Allowed for draft packs; blocked for published packs.

---

## Requirements

### Functional Requirements

- **FR-001**: Every published vector layer MUST include a resolvable `schema_uri`.
- **FR-002**: Schema URIs MUST be immutable, versioned, and HTTPS-resolvable.
- **FR-003**: Validator MUST return non-zero exit code on errors.
- **FR-004**: Conformance reports MUST include: `validator` (name/version), `rule_set_hash`, `status` (pass/fail), `errors`, `warnings`.
- **FR-005**: Extensions MUST be composable and versioned; applied via `extensions[]` array on layer.
- **FR-006**: Published packs MUST include `validation.conformance_uri` with `status=pass` (or documented waiver).
- **FR-007**: Breaking schema changes MUST bump major version.

### Key Entities

- **Schema Artifact**: immutable JSON Schema document with `id`, `version`, `type`, `hash`, `compatibility`, `examples`.
- **Extension Artifact**: composable add-on with `id`, `version`, `depends_on`, `constraints`, `property_prefix`, `maturity`.
- **Conformance Report**: validation output with `run_id`, `validator`, `inputs`, `results`, `hashes`.

### Data Contracts

**Layer entry additions to `spatialpack.json`:**
```json
{
  "id": "roads",
  "schema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0",
  "schema_profile": "geoparquet@1",
  "extensions": [
    "https://schemas.spatial.properties/ext/spatial-properties:lineage@1.0.0"
  ],
  "validation": {
    "conformance_uri": "https://schemas.spatial.properties/reports/run_01J.../roads.json",
    "status": "pass",
    "validator": "spatial.properties.validator@1.3.2",
    "rule_set_hash": "sha256:...",
    "checked_at": "2025-12-28T10:00:00Z",
    "summary": { "errors": 0, "warnings": 12 }
  }
}
```

---

## API (v0)

### Schema Artifact Hosting (Static)
- `GET /schemas/{namespace}/{name}@{version}` → JSON Schema document
- `GET /extensions/{publisher}:{ext_name}@{version}` → Extension artifact

### Validation Service (Optional)
- `POST /validate` → payload: pack/layer URIs + schema/ext URIs → conformance report
- `GET /reports/{run_id}` → conformance report

### URI Conventions
- **Schemas**: `https://schemas.spatial.properties/v1/{namespace}/{name}@{version}`
- **Extensions**: `https://schemas.spatial.properties/ext/{publisher}:{ext_name}@{version}`
- **Reports**: `https://schemas.spatial.properties/reports/{run_id}/{layer_id}.json`

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every published vector layer includes a resolvable `schema_uri`.
- **SC-002**: Validator CLI completes in <10s for packs with <10 layers.
- **SC-003**: Conformance reports are referenced from 100% of published packs.
- **SC-004**: Zero downstream integration issues due to undocumented schema changes.

---

## Non-Goals (v0)

- Multi-tenant hosted schema registry service (beyond static hosting).
- Extension marketplace and RFC governance process.
- Managed validation "jobs as a service".
- Automated schema migration tooling.

---

## Metrics (v0)

- Validation runs per day
- Pass/fail ratio
- Top failing rules
- Schema resolution latency (p95 < 200ms)

---

## Rollout

1. Add `schema_uri`, `extensions[]`, `validation` to `spatialpack.json` spec.
2. Publish 2 base schemas as static artifacts (`transport/roads`, `land/parcels`).
3. Publish 1 extension (`spatial-properties:lineage@1.0.0`).
4. Implement validator CLI with required properties, types, geometry type checks.
5. Emit conformance reports (JSON) and reference from pack.
6. Document CLI usage and CI integration.

---

## Risks

- Over-engineering schema governance before traction.
- Blocking publishers with strict validation before they see value.

**Mitigations:**
- Keep v0 thin-slice: static hosting, basic validation.
- Allow warnings (non-blocking) vs errors (blocking).

---

## Open Questions

- Should schemas support multiple encoding profiles (GeoParquet vs GeoJSON)?
- Should we support an optional SDL authoring layer that compiles to JSON Schema?

---

## References

- `Docs/Updates/Vecorel - 09-Schema-Registry-and-Validation.md` (source)
- `Docs/architecture/03-Schema-Registry-and-Validation.md` (technical detail)
