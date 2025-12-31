# WA Power Network – Private Infrastructure Pack

## Overview

This Spatial Pack represents **customer-owned power network assets** used in conjunction with regulatory context packs to assess risk and generate operational actions.

This pack is **private**, customer-scoped, and not published publicly.

---

## Intended Use

- Vegetation clearance compliance

- Bushfire risk assessment

- Inspection scheduling

- Evidence generation

---

## Artifacts

### Network Geometry

- `network/poles.parquet`

- `network/spans.parquet`

- `network/conductors.parquet`

### Attributes

- `network/asset_attributes.json`

  - Voltage class

  - Conductor type

  - Span length

  - Asset identifiers

---

## Pack Manifest (Conceptual)

```json
{
  "pack_id": "customer-x-wa-power-network",
  "version": "2025.01",
  "visibility": "private",
  "topics": ["power", "infrastructure", "network"],
  "artifacts": [
    "network/*"
  ]
}
```

## Data Requirements

- Geometry must be spatially valid

- Asset IDs must be stable across versions

- Attributes must map cleanly to clearance rules

## Non-Goals

- Compliance interpretation

- Task logic

- Reporting

## Notes

This pack gains value only when combined with:

- Regulatory context packs

- Toolsets that compute risk and actions

