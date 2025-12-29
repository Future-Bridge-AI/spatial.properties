# WA Bushfire Vegetation Clearance – Context Pack

## Overview

This Spatial Pack provides jurisdiction-specific **regulatory and spatial context** required to assess and manage bushfire vegetation clearance obligations for overhead power infrastructure in Western Australia.

The pack is designed to be **decision-ready**, not just descriptive: it encodes clearance rules, responsibility logic, and environmental gates required to support operational tooling and auditability.

This pack does **not** contain customer asset data. It is intended to be combined with private network packs.

---

## Jurisdiction

- Country: Australia

- State: Western Australia

- Regulatory Scope: Bushfire risk, vegetation clearance near overhead conductors

---

## Intended Use

- Regional utilities and network operators

- Local governments

- Infrastructure operators

- Compliance and risk assessment tooling

- Spatial.Properties Pack Explorer demonstrations

---

## Artifacts

### Rules (Deterministic)

- `rules/clearance_rules.json`

  - Minimum horizontal and vertical vegetation clearances

  - Parameterised by:

    - Conductor class (LV/HV, bare/insulated)

    - Span length category

    - Fire-risk modifier

- `rules/responsibility_rules.json`

  - Responsibility assignment logic based on:

    - Land tenure (verge vs private)

    - Vegetation classification (planted/cultivated vs natural)

- `rules/safety_gates.json`

  - Danger-zone definitions for work near live conductors

- `rules/environmental_gates.json`

  - Native vegetation and permit-check triggers

### Boundaries

- `boundaries/road_reserves.parquet`

- `boundaries/cadastre_parcels.parquet`

- `boundaries/local_government_areas.parquet`

### Environmental Context

- `environment/fire_risk_areas.parquet`

- `environment/native_vegetation_sensitivity.parquet`

### Documentation

- `docs/regulatory_sources.md`

- `docs/rule_interpretation_notes.md`

---

## Pack Manifest (Conceptual)

```json
{
  "pack_id": "au-wa-bushfire-veg-clearance-context",
  "version": "2025.01",
  "jurisdiction": "AU-WA",
  "topics": ["bushfire", "vegetation", "compliance", "infrastructure"],
  "artifacts": [
    "rules/*",
    "boundaries/*",
    "environment/*",
    "docs/*"
  ]
}
```

## Non-Goals

- Asset ownership or geometry

- Operational task execution

- Human judgement replacement

## Update Cadence

- Regulatory review: quarterly

- Ad-hoc updates on legislative or guideline changes

## Risks

- Regulatory interpretation drift

- Jurisdictional edge cases

- Mitigation: explicit rule documentation and versioning.

## Why This Pack Exists

This pack allows compliance logic to be separated from operational tooling, enabling:

- Reuse across customers

- Transparent audits

- Repeatable AI-assisted workflows

