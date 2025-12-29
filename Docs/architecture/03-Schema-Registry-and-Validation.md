# 03 — Schema Registry, Extensions, and Validation

This document defines the platform capabilities for schema management, extensions, and validation that make Spatial.Properties *standards-ready* while staying thin-slice for MVP.

## 0. Context & Scope

### 0.1 Why This Matters

These capabilities only "move the needle" when scoped as a **trust + integration accelerant**:
- **Trust**: Buyers need confidence that a pack won't silently break downstream systems.
- **Speed**: Developers need unambiguous, machine-readable contracts for fields/types/constraints.

### 0.2 MVP Scope (Thin-Slice)

Ship these three things and stop:

1. **`schema_uri` per vector layer** — resolvable, versioned, immutable
2. **`extensions[]` as simple URIs** — composable, versioned, optional
3. **Validation in CI + conformance report artifact** — referenced from pack

### 0.3 Explicitly Deferred

- Multi-tenant hosted schema registry service (beyond static hosting)
- Extension marketplaces and RFC governance processes
- Managed validation "jobs as a service"
- Automated schema migration tooling

These can be revisited once there are **multiple publishers** and recurring demand for shared conventions.

---

## 1. Goals

### 1.1 Product Goals
- Reduce "schema uncertainty" for customers integrating packs.
- Enable **industry packs** to converge on shared conventions without monolithic specs.
- Make "standards adoption" a flywheel: **data + tools + validators + templates + community**.

### 1.2 Technical Goals
- Provide a **canonical schema URI** per layer that is stable, cacheable, and versioned.
- Support **composable extensions** that add fields/constraints without breaking unknown fields.
- Produce **conformance reports** that are machine-readable and can gate publishing.

---

## 2. Design Principles

### Open-World vs Closed-World Validation

- **Draft packs**: default to **open-world** (unknown fields allowed)
- **Published packs**: MAY declare **closed-world** (`additionalProperties=false`) for specific objects

### Core Principles

- **Small Core, Infinite Edge**: minimal common layer contract; everything else is extension-driven
- **Loose by Default, Strict When Declared**: packs MAY include arbitrary fields; strictness is opt-in
- **Executable Standards**: schemas are artifacts that can be validated in CI/CD, not just docs
- **Versioned & Signed**: schema artifacts and conformance reports are immutable, versioned, integrity-checked
- **Tooling First**: conversion and validation tooling is part of the product

---

## 3. Capability Overview

### 3.1 Schema Registry

A Schema Registry provides:
- Canonical URIs for schemas (`schema_uri`)
- Schema versions and compatibility rules (semver + break indicators)
- Mappings for common formats (JSON Schema for properties, Parquet schema, Arrow schema)

### 3.2 Extensions Framework

An Extension is a versioned artifact that:
- Defines additional fields and constraints
- Declares dependency on base schema (or other extensions)
- Includes validator rules and examples

Extensions are **composable** and applied to layers via `layers[].extensions`.

### 3.3 Validation & Conformance

Validation executes at pack build/publish time and outputs:
- Pass/fail result
- Error/warn summary
- Conformance report artifact URI
- Validator version + rule-set hash (reproducibility)

---

## 4. Data Model Additions

### 4.1 Schema Artifact

A schema artifact is stored as an immutable blob and referenced by URI.

**Minimum fields:**
- `id` — e.g., `transport/roads`
- `version` — e.g., `12.1.0`
- `type` — `jsonschema`, `arrow`, `parquet`, `profile`
- `hash` — content digest
- `compatibility` — declared breaking rules
- `examples` — optional

**Optional Vecorel-aligned additions:**
```json
{
  "id": "transport/roads",
  "version": "12.1.0",
  "type": "profile",
  "compatibility": "semver",
  "encoding_profiles": {
    "geoparquet@1": {
      "arrow_schema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0/arrow.json",
      "parquet_schema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0/parquet.json",
      "jsonschema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0/properties.schema.json"
    },
    "geojson@1": {
      "jsonschema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0/geojson.schema.json"
    }
  }
}
```

### 4.2 Extension Artifact

**Minimum fields:**
- `id` — e.g., `spatial-properties:lineage`
- `version` — e.g., `1.0.0`
- `depends_on` — schemas/extensions
- `constraints` — field + validation rules
- `examples`

**Optional Vecorel-aligned additions:**
- `property_prefix` — naming prefix for properties (avoids collisions)
- `maturity` — `experimental | candidate | stable | deprecated`
- `owners` — maintainers or steward organizations

### 4.3 Conformance Report Artifact

**Minimum fields:**
- `run_id` — unique identifier for validation run
- `validator` — name/version
- `inputs` — pack id/version, layer ids, schema/extension URIs
- `results` — pass/fail, errors, warnings
- `hashes` — inputs + rule-set hash

---

## 5. Updates to `spatialpack.json`

Add the following fields to layer entries:

```json
{
  "id": "roads",
  "title": "Road centrelines",
  "type": "vector",
  "assets": {
    "parquet": "s3://spatial-packs/v12/roads/*.parquet",
    "pmtiles": "https://cdn.spatial.properties/packs/v12/roads.pmtiles"
  },

  "schema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0",
  "schema_profile": "geoparquet@1",
  "extensions": [
    "https://schemas.spatial.properties/ext/fiboa@0.7.0",
    "https://schemas.spatial.properties/ext/spatial-properties:lineage@1.0.0"
  ],

  "validation": {
    "conformance_uri": "https://schemas.spatial.properties/reports/run_01J.../roads.json",
    "status": "pass",
    "validator": "spatial.properties.validator@1.3.2",
    "strictness": {
      "mode": "published",
      "additional_properties": "closed-world"
    },
    "rule_set_hash": "sha256:...",
    "checked_at": "2025-12-28T10:00:00Z",
    "summary": {
      "errors": 0,
      "warnings": 12
    }
  },

  "compatibility": {
    "policy": "semver",
    "breaking_changes": "major-only",
    "deprecations": [
      {"field": "ROAD_NAME", "replaced_by": "name", "removal_version": "13.0.0"}
    ]
  }
}
```

**Notes:**
- `schema_uri` MUST be resolvable via HTTPS and return machine-readable schema document
- `extensions[]` MUST be resolvable and versioned
- `validation` MAY be omitted for draft packs; MUST be present for published packs

---

## 6. Services & APIs

### 6.1 Schema Artifact Hosting (MVP)

**Responsibilities:**
- Host and serve schema/extension artifacts via stable, immutable URIs (static hosting sufficient)
- Publish version metadata and compatibility policy alongside artifacts

**Endpoints:**
- `GET /schemas/{schema_id}@{version}` → JSON Schema document
- `GET /extensions/{ext_id}@{version}` → Extension artifact

### 6.2 Schema Registry Service (Optional, Later)

**Additional responsibilities:**
- Discovery/search for schemas and extensions when multiple publishers exist

**Endpoints:**
- `GET /catalog/schemas?tag=transport&status=stable`
- `GET /catalog/extensions?depends_on=...`
- `GET /resolve?uri=...` (canonicalization)

### 6.3 Validation Service

**Responsibilities:**
- Validate datasets (GeoParquet/PMTiles) against schema + extensions
- Generate conformance reports
- Provide CI-friendly outputs

**Endpoints:**
- `POST /validate` — payload: pack/layer URIs + schema/ext URIs → conformance report
- `GET /reports/{run_id}` → full report
- `GET /reports/{run_id}/summary` → summary

---

## 7. Pack Lifecycle Policy Changes

### 7.1 Draft → Published

- **Draft packs** MAY omit `validation` and MAY reference experimental schemas/extensions
- **Published packs** MUST include:
  - `schema_uri` for every vector layer
  - `validation.conformance_uri` with `status=pass` OR documented waivers
  - Immutable hashes for schema and report artifacts

### 7.2 Breaking Changes

A breaking change MUST:
- Bump schema major version (or declared breaking policy)
- Ship migration guide (mapping table + examples minimum)
- Include deprecation window for previous fields where feasible

---

## 8. Governance & Extension Lifecycle

### 8.1 Extension Maturity Levels

- **experimental** — may change without notice
- **candidate** — stable enough for pilots; breaking changes documented
- **stable** — semver governed; migration required for breaking changes
- **deprecated** — removal date/version declared

### 8.2 RFC Process (Lightweight)

1. **Proposal**: schema/extension intent, examples, target industry use-cases
2. **Reference data**: sample dataset(s) demonstrating the schema
3. **Validation**: validator rules and expected outcomes
4. **Publish**: registry entry + documentation + conformance tests

---

## 9. Developer Experience

### 9.1 CLI Surface

```bash
spatialpack convert --from <format> --to geoparquet
spatialpack schema add <uri>
spatialpack validate --pack spatialpack.json
spatialpack conformance --report out.json
spatialpack migrate --from <schema@v> --to <schema@v>
```

### 9.2 CI/CD Integration

GitHub Action template:
- build → validate → publish
- Fail build on errors; allow warnings by policy
- Attach conformance report as artifact

### 9.3 SDK Integration

- Lightweight resolver for `schema_uri` + extension URIs
- Helper utilities to:
  - Read conformance report
  - Check compatibility
  - Generate field mappings

### 9.4 Optional SDL Authoring (Vecorel-style)

If supporting SDL authoring layer:
- Allow `schema_uri` to resolve to JSON Schema directly, or SDL document compiled to JSON Schema
- Store generated JSON Schema as immutable artifacts in `encoding_profiles`

---

## 10. Operations & Observability

- Registry and reports MUST be CDN-cacheable (immutable versioned URIs)
- Validation runs MUST emit metrics:
  - Validation duration
  - Error/warn counts
  - Dataset size/feature count
  - Top failing rules
- Reports MUST be retained per retention policy (e.g., 13 months) for auditability

---

## 11. Implementation Plan (Phased)

### Phase 1 — Thin-Slice MVP

- Add `schema_uri`, `extensions[]`, `validation` to `spatialpack.json`
- Publish 1–2 base schemas as static artifacts (e.g., `transport/roads`, `land/parcels`)
- Publish 1–2 extensions (e.g., `spatial-properties:lineage@1.0.0`)
- Implement validator CLI:
  - Required properties
  - Type checks
  - Geometry type constraints
  - Basic enumerations / value ranges
- Emit machine-readable conformance reports (JSON)

**Acceptance Criteria (Phase 1):**
- Every published vector layer includes resolvable `schema_uri`
- Validator returns non-zero exit code on errors
- Conformance report includes: validator version, rule-set hash, pass/fail, error/warn counts
- Published packs MUST include passing conformance report

### Phase 2 — Product-Grade Discovery (If Pull Exists)

- Lightweight schema catalog (search + tags) — still static-first
- Report browsing endpoint for audits
- Compatibility/diff notes automation

### Phase 3 — Ecosystem Scaling (With Multiple Publishers)

- Schema Registry Service (multi-tenant, governance, approval flows)
- Extension marketplace listing + RFC process
- Managed build/validation runners
- Schema migration helpers

---

## 12. URI Conventions

**Schemas:**
```
https://schemas.spatial.properties/v1/{namespace}/{name}@{version}
```

**Extensions:**
```
https://schemas.spatial.properties/ext/{publisher}:{ext_name}@{version}
```

**Reports:**
```
https://schemas.spatial.properties/reports/{run_id}/{layer_id}.json
```

---

## 13. Compatibility Rules (Defaults)

- **Patch**: non-functional changes (docs/examples), validator bugfixes
- **Minor**: additive fields, additive enumerations, relaxed constraints
- **Major**: removed/renamed fields, tightened constraints, changed meaning

**Downstream Consumer Guarantees:**
- Ignore unknown fields
- Resolve schema+extensions by URI
- Check conformance report status before trusting strict semantics

---

## Appendix A — Non-Goals

- Not a single universal vector schema for all industries
- Not enforcing strict validation for all packs (draft remains flexible)
- Not replacing domain initiatives (fiboa, etc.) — we host and scale them
- Not building a "standards platform" ahead of traction

---

## References

- Feature Spec: `spec/features/0002-schema-registry-validation.md`
- Source: `Docs/Updates/Vecorel - 09-Schema-Registry-and-Validation.md`
