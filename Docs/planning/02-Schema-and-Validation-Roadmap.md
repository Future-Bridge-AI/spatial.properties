# 02 — Schema Registry & Validation Roadmap

## Overview

This document outlines the phased implementation of schema registry, extensions framework, and validation capabilities for Spatial.Properties.

**Key Principle:** Ship thin-slice MVP first; scale only when publisher/ecosystem pull exists.

---

## Phase 1 — Thin-Slice MVP (Needle-Moving)

**Goal:** Increase adoption confidence and lower integration friction.

### Deliverables

| Deliverable | Description | Priority |
|-------------|-------------|----------|
| `schema_uri` field | Add to layer entries in `spatialpack.json` | P1 |
| `extensions[]` field | Add to layer entries | P1 |
| `validation` block | Add conformance reference to layer entries | P1 |
| Base schemas (2) | `transport/roads`, `land/parcels` as static artifacts | P1 |
| Extensions (2) | `spatial-properties:lineage@1.0.0`, `wa:planning-constraints@0.1.0` | P2 |
| Validator CLI | Required properties, types, geometry constraints | P1 |
| Conformance reports | JSON output with validator version, rule-set hash, pass/fail | P1 |

### Acceptance Criteria

- [ ] Every published vector layer includes resolvable `schema_uri`
- [ ] Validator returns non-zero exit code on errors
- [ ] Conformance report includes: validator version, rule-set hash, pass/fail, error/warn counts
- [ ] Published packs MUST include passing conformance report (or documented waiver)

### CLI Commands (Phase 1)

```bash
spatialpack validate --pack spatialpack.json
spatialpack conformance --report out.json
```

---

## Phase 2 — Product-Grade Discovery (If Pull Exists)

**Trigger:** Recurring customer/publisher demand for schema discovery.

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| Schema catalog | Search + tags, still static-first hosting |
| Report browsing | Endpoint or static index for audits |
| Compatibility/diff automation | Generate changelogs from schema changes |

### Success Metrics

- Schema discovery queries per week
- Time-to-find-schema reduced by 50%

---

## Phase 3 — Ecosystem Scaling (With Multiple Publishers)

**Trigger:** ≥3 external publishers with recurring schema governance needs.

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| Schema Registry Service | Multi-tenant, governance, approval flows |
| Extension marketplace | Listing + RFC process |
| Managed build runners | Validation-as-a-service |
| Schema migration helpers | Automated mapping pipelines |

### Governance Model

- Extension maturity levels: `experimental` → `candidate` → `stable` → `deprecated`
- Lightweight RFC process for new schemas/extensions

---

## Implementation Dependencies

```
E1 (Foundations) → E2 (Pack Spec) → E2c (Schema Registry Phase 1)
                                  ↓
                        E2d (Trust Artifacts) → Pack Explorer UI
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Over-engineering schema governance before traction | Keep v0 thin-slice: static hosting, basic validation |
| Blocking publishers with strict validation | Allow warnings (non-blocking) vs errors (blocking) |
| Schema proliferation without coordination | Maintain core schemas centrally; extensions for customization |

---

## Success Measures

- **Integration speed:** Schema clarity reduces time-to-first-map by 30%
- **Support load:** Schema-related support tickets reduced by 50%
- **Publisher adoption:** 80%+ of published packs include valid `schema_uri`

---

## References

- Feature Spec: `spec/features/0002-schema-registry-validation.md`
- Architecture: `Docs/architecture/03-Schema-Registry-and-Validation.md`
- Source: `Docs/Updates/Vecorel - 09-Schema-Registry-and-Validation.md`
