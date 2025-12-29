# Spatial.Properties: Schema Registry, Extensions, and Validation

This document defines **additional platform capabilities** to make Spatial.Properties *standards-ready* in the “small core + extensions + validators + ecosystem” sense.

It introduces three related feature areas:

1. **Schema Registry** — a canonical, versioned home for layer/feature schemas (and their evolution rules).
2. **Extensions Framework** — composable, versioned add-ons (STAC/fiboa-style) that can be applied per-layer.
3. **Validation & Conformance** — repeatable validation, machine-readable conformance reports, and CI-friendly tooling.

---

## 0. Context
## 0.1 Scope and why this matters

These capabilities **only “move the needle”** for Spatial.Properties when scoped as a **trust + integration accelerant**:

- **Trust:** buyers and integrators need confidence that a pack won’t silently break downstream systems.
- **Speed:** developers need an unambiguous, machine-readable contract for fields/types/constraints so integration is fast and support load is low.

**This document therefore defines a *thin-slice MVP* first**, and explicitly defers “standards platform” ambitions (hosted registries, marketplaces, heavy governance) until there is clear publisher/ecosystem pull.

### What is in-scope for the MVP
Ship these three things and stop:

1. **`schema_uri` per vector layer** (resolvable, versioned, immutable)
2. **`extensions[]` as simple URIs** (composable, versioned, optional)
3. **Validation in CI + a conformance report artifact** referenced from the pack

### Vecorel alignment notes (optional)

Vecorel emphasizes a **small core + extensions + tooling** approach across **multiple encodings** (e.g., GeoJSON and GeoParquet) and introduces a **Schema Definition Language (SDL)** as an authoring layer that can be translated into JSON Schema.

Spatial.Properties can stay *thin-slice* while still being “Vecorel-friendly” by adding:

- **Encoding profiles** for schemas (e.g., GeoParquet profile now; GeoJSON later)
- Optional **SDL-as-authoring** support (generate JSON Schema artifacts at build time)
- A light distinction between **collection-level** vs **feature-level** fields where needed
- Explicit opt-in for **closed-world** validation (`additionalProperties=false`) on published packs
- A couple of extra **extension metadata** fields (prefix, maturity, owners)

This is strictly optional and should not expand Phase 1 scope beyond validation + contract clarity.

### What is explicitly deferred
- A multi-tenant hosted schema registry service (beyond static hosting)
- Extension marketplaces and RFC governance processes
- Managed validation “jobs as a service”
- Automated schema migration tooling (beyond basic deprecation notes)

These can be revisited once Spatial.Properties has **multiple publishers** and recurring demand for shared conventions.


Spatial.Properties already optimizes for **pack-first, cloud-native distribution** (GeoParquet/COG/COPC/PMTiles) and durable metadata (STAC-like cataloging) with modern access patterns (HTTP, signed URLs, tiles, query engines).

What’s missing (and what this document adds) is a **first-class, executable contract** for *vector schemas*:

- how a layer is structured (properties/geometry/CRS)
- what extensions apply
- how conformance is evaluated
- how schema versions evolve without breaking downstream consumers

---

## 1. Goals

### 1.1 Product goals
- Reduce “schema uncertainty” for customers integrating packs into apps, analytics, and agents.
- Enable **industry packs** to converge on shared conventions without forcing a single monolithic spec.
- Make “standards adoption” a *flywheel*: **data + tools + validators + templates + community**.

### 1.2 Technical goals
- Provide a **canonical schema URI** per layer that is stable, cacheable, and versioned.
- Support **composable extensions** that add fields/constraints without breaking unknown fields.
- Produce **conformance reports** that are machine-readable and can gate publishing.

---

## 2. Design Principles

### Open-world vs closed-world validation (published packs)

- **Draft packs:** default to **open-world** (unknown fields allowed).
- **Published packs:** MAY declare **closed-world** for specific objects (unknown fields disallowed) by setting schema policy such as `additionalProperties=false`.

This aligns with stricter downstream integration needs without blocking early iteration.


- **Small Core, Infinite Edge:** a minimal common layer contract; everything else is extension-driven.
- **Loose by Default, Strict When Declared:** packs MAY include arbitrary fields; strictness is opt-in via declared schemas/extensions.
- **Executable Standards:** schemas are not “docs” — they are artifacts that can be validated in CI/CD.
- **Versioned & Signed:** schema artifacts and conformance reports are immutable, versioned, and integrity-checked.
- **Tooling First:** conversion and validation tooling is part of the product, not an afterthought.

---

## 3. Capability Overview

### 3.1 Schema Registry
A **Schema Registry** provides:
- canonical URIs for schemas (`schema_uri`)
- schema versions and compatibility rules (e.g., semver + break indicators)
- mappings for common formats (JSON Schema for properties, Parquet schema, Arrow schema, optional GeoPackage/GeoJSON profiles)

### 3.2 Extensions Framework
An **Extension** is a versioned artifact that:
- defines additional fields and constraints
- declares dependency on a base schema (or other extensions)
- includes validator rules and examples

Extensions are **composable** and can be applied to:
- a layer (`layers[].extensions`)
- a subset of features (future: rule-based application)

### 3.3 Validation & Conformance
Validation is executed at pack build/publish time (and optionally at ingest). It outputs:
- pass/fail result
- error/warn summary
- conformance report artifact URI
- validator version + rule-set hash (reproducibility)

---

## 4. Data Model Additions

### 4.1 New artifacts

#### Schema Artifact
A schema artifact is stored as an immutable blob and referenced by URI.

**Recommended additions (Vecorel-aligned, still optional)**
- `encoding_profiles`: a map of encoding/profile identifiers to concrete schema materializations (e.g., JSON Schema for properties, Arrow/Parquet schema for storage)

Example:

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


**Minimum fields**
- `id`
- `version`
- `type` (`jsonschema`, `arrow`, `parquet`, `profile`)
- `hash` (content digest)
- `compatibility` (declared breaking rules)
- `examples` (optional)

#### Extension Artifact
Extensions are published and versioned similar to schemas.

**Recommended additions (Vecorel-aligned, still optional)**
- `property_prefix`: naming prefix for properties introduced by the extension (helps avoid collisions)
- `maturity`: `experimental | candidate | stable | deprecated`
- `owners`: maintainers or steward organizations


**Minimum fields**
- `id`
- `version`
- `depends_on` (schemas/extensions)
- `constraints` (field + validation rules)
- `examples`

#### Conformance Report Artifact
Generated output of a validation run.

**Minimum fields**
- `run_id`
- `validator` (name/version)
- `inputs` (pack id/version, layer ids, schema/extension URIs)
- `results` (pass/fail, errors, warnings)
- `hashes` (inputs + rule-set hash)

---

### 4.2 Updates to `spatialpack.json`

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

**Notes**
- `schema_uri` MUST be resolvable via HTTPS and return a machine-readable schema document.
- `extensions[]` MUST be resolvable and versioned.
- `validation` MAY be omitted for draft packs; MUST be present for “published” packs (see policy below).

---

## 5. Services & APIs

### 5.1 Schema Artifact Hosting (MVP) and optional Schema Registry Service
Responsibilities (MVP):
- host and serve schema/extension artifacts via stable, immutable URIs (static hosting is sufficient)
- publish version metadata and compatibility policy alongside artifacts

Responsibilities (optional, later):
- provide discovery/search for schemas and extensions when multiple publishers exist

Suggested endpoints:
- `GET /schemas/{schema_id}@{version}`
- `GET /extensions/{ext_id}@{version}`
- `GET /catalog/schemas?tag=transport&status=stable`
- `GET /catalog/extensions?depends_on=...`
- `GET /resolve?uri=...` (optional canonicalization)

### 5.2 Validation Service
Responsibilities:
- validate datasets (GeoParquet/PMTiles feature metadata) against schema + extensions
- generate conformance reports
- provide CI-friendly outputs

Suggested endpoints:
- `POST /validate` (payload: pack/layer URIs + schema/ext URIs)
- `GET /reports/{run_id}`
- `GET /reports/{run_id}/summary`

### 5.3 Conversion Toolkit (Productized)
Two delivery modes:
- **CLI / SDK** (primary): `spatialpack build`, `spatialpack validate`, `spatialpack publish`
- **Managed build runners** (optional): “Pack Builder” as a service that executes conversions/validation on behalf of customers

Capabilities:
- common source readers (GeoJSON, Shapefile, FGDB, GPKG, PostGIS, OGR, APIs)
- schema-guided mapping/transforms
- deterministic, repeatable outputs

---

## 6. Pack Lifecycle Policy Changes

### 6.1 Draft → Published
- **MVP gating note:** keep this policy lightweight. The purpose is to prevent accidental breaking changes and speed up integration—not to block iteration.
- **Draft packs** MAY omit `validation` and MAY reference experimental schemas/extensions.
- **Published packs** MUST include:
  - `schema_uri` for every vector layer
  - a `validation.conformance_uri` with `status=pass` OR documented waivers
  - immutable hashes for schema and report artifacts

### 6.2 Breaking changes
- A breaking change MUST:
  - bump schema major version (or declared breaking policy)
  - ship a migration guide (at minimum: mapping table + examples)
  - include deprecation window for previous fields where feasible

---

## 7. Governance & Extension Lifecycle

### 7.1 Extension maturity levels
- **experimental** — may change without notice
- **candidate** — stable enough for pilots; breaking changes documented
- **stable** — semver governed; migration required for breaking changes
- **deprecated** — removal date/version declared

### 7.2 RFC process (lightweight)
- Proposal: schema/extension intent, examples, and target industry use-cases
- Reference data: sample dataset(s) demonstrating the schema
- Validation: validator rules and expected outcomes
- Publish: registry entry + documentation + conformance tests

---

## 8. Developer Experience
### 8.4 Optional SDL authoring (Vecorel-style)

If you choose to support an SDL authoring layer, keep it lightweight:

- Allow `schema_uri` to resolve to either:
  - a **JSON Schema** directly, or
  - an **SDL document** that is compiled into JSON Schema artifacts during `spatialpack build`
- Store the generated JSON Schema as immutable artifacts and reference them in `encoding_profiles`

This preserves the “executable contract” goal without forcing a single validator technology.


### 8.1 CLI surface (illustrative)
- `spatialpack convert --from <format> --to geoparquet` (format conversion)
- `spatialpack schema add <uri>`
- `spatialpack validate --pack spatialpack.json`
- `spatialpack conformance --report out.json`
- `spatialpack migrate --from <schema@v> --to <schema@v>`

### 8.2 CI/CD integration
- GitHub Action template:
  - build → validate → publish
  - fail build on errors; allow warnings by policy
  - attach conformance report as artifact

### 8.3 SDK integration
- lightweight resolver for `schema_uri` + extension URIs
- helper utilities to:
  - read conformance report
  - check compatibility
  - generate field mappings

---

## 9. Operations & Observability

- Registry and reports MUST be CDN-cacheable (immutable versioned URIs).
- Validation runs MUST emit metrics:
  - validation duration
  - error/warn counts
  - dataset size/feature count
  - top failing rules
- Reports MUST be retained per retention policy (e.g., 13 months) for auditability.

---

## 10. Implementation Plan (Phased)

### Phase 1 — Thin-slice MVP (needle-moving)
Deliver the minimum that increases adoption confidence and lowers integration friction:

- Add `schema_uri`, `extensions[]`, and `validation` (with `conformance_uri`) to `spatialpack.json`
- Publish 1–2 **base schemas** as static, versioned artifacts (e.g., `transport/roads`, `land/parcels`)
- Publish 1–2 **extensions** (e.g., `spatial-properties:lineage@1.0.0`, `wa:planning-constraints@0.1.0`)
- Implement **validator CLI** that can run in CI:
  - required properties
  - type checks
  - geometry type constraints
  - basic enumerations / value ranges
- Emit **machine-readable conformance reports** (JSON) and reference them from the pack

**Acceptance criteria (Phase 1)**
- Every published vector layer includes a resolvable `schema_uri`
- Validator returns non-zero exit code on errors; warnings are policy-configurable
- Conformance report includes: validator version, rule-set hash, pass/fail, error/warn counts
- Published packs MUST include a passing conformance report (or a documented waiver)

### Phase 2 — Product-grade discovery (only if pull exists)
Add “nice to have” improvements once you have recurring customer/publisher demand:

- Lightweight **schema catalog** (search + tags) — still static-first
- Report browsing endpoint (or static index) for audits
- Compatibility/diff notes automation (generate changelogs from schema changes)

### Phase 3 — Ecosystem scaling (only with multiple publishers)
Only build these when there is clear evidence you need them:

- Schema Registry Service (multi-tenant, governance, approval flows)
- Extension marketplace listing + RFC process
- Managed build/validation runners
- Schema migration helpers and automated mapping pipelines

---

## 11. Non-goals (for now)

- Not a single universal vector schema for all industries.
- Not enforcing strict validation for all packs (draft/experimental remains flexible).
- Not replacing domain initiatives (e.g., fiboa) — Spatial.Properties hosts and scales them.
- Not building a “standards platform” ahead of traction:
  - no multi-tenant registry service beyond static, versioned artifact hosting
  - no marketplace/RFC governance workflow as a hard dependency for v1
  - no managed validation jobs as a product surface in the MVP

---

## Appendix A — URI Conventions

**Schemas**
- `https://schemas.spatial.properties/v1/{namespace}/{name}@{version}`

**Extensions**
- `https://schemas.spatial.properties/ext/{publisher}:{ext_name}@{version}`

**Reports**
- `https://schemas.spatial.properties/reports/{run_id}/{layer_id}.json`

---

## Appendix B — Compatibility Rules (Suggested Defaults)

### Closed-world policy (optional)
- For published packs, consider setting `additionalProperties=false` for key objects to prevent uncontrolled field drift.

- **Patch**: non-functional changes (docs/examples), validator bugfixes
- **Minor**: additive fields, additive enumerations, relaxed constraints
- **Major**: removed/renamed fields, tightened constraints, changed meaning

Downstream consumers MUST be able to:
- ignore unknown fields
- resolve schema+extensions by URI
- check conformance report status before trusting strict semantics
