# 07 — WA Solar Feasibility Pack: Example & Licensing Guide

## Overview

This document provides a practical guide for building the **WA Solar Feasibility Pack** — a hero example demonstrating the pack-first approach end-to-end.

**Pack ID:** `wa-solar-feasibility-pack`
**Primary Audience:** Solar developers, planners, feasibility teams
**Geography:** Western Australia

---

## 1. Pack Promise

When a customer loads this pack, they can:

1. **Rank candidate land** by solar resource + slope/aspect suitability
2. **Filter out constraints** (bushfire, environmental proxies)
3. **Estimate connection friction** via proximity layers
4. **Generate repeatable screening reports** with evidence trail
5. **Reproduce decisions** later (same pack version + integrity hashes)

---

## 2. Release Strategy

### Release 0.1 (Open v0)

| Layer | Category | Include? |
|-------|----------|----------|
| Solar exposure (BOM/NASA POWER) | Open | Yes |
| DEM + slope + aspect | Open/Derived | Yes |
| Soils (ASRIS) | Open | Yes |
| Bushfire prone areas (WA) | Open | Yes |
| Access roads (OSM) | Open | Yes |
| Grid capacity tool | Link-out | Link only |

### Release 0.2

- Add flood/drainage proxy (open/verified)
- Add protected areas boundaries (open/verified)
- Add "screening score" workflow artifacts

### Release 1.0 (v1 Add-ons)

| Layer | Category | Handling |
|-------|----------|----------|
| Cadastre/tenure | BYO-license | Tenant-scoped |
| Zoning overlays | Licensed | Per LGA/state rights |
| Restricted ecology | Add-on | Controlled access |
| Commercial irradiance (Solcast) | Commercial | Contract required |

---

## 3. Licensing Matrix

### Category Definitions

| Category | Description | v0 Include? |
|----------|-------------|-------------|
| **Open** | Redistributable with attribution | Yes |
| **Derived** | Derived from open data (always safe) | Yes |
| **Restricted** | Public to view, limited redistribution | No (v1 add-on) |
| **Commercial** | Proprietary, requires contract | No (v1 add-on) |
| **BYO-license** | Customer supplies access rights | No (v1 add-on) |
| **Link-out** | Reference only, no redistribution | Link only |

### Layer-by-Layer Matrix

| Theme | Dataset | Category | v0? | Notes |
|-------|---------|----------|-----|-------|
| Solar | BoM/NASA POWER | Open | Yes | Include with attribution |
| Terrain | National DEM/SRTM | Open | Yes | Include |
| Terrain | Slope/Aspect | Derived | Yes | Derived from DEM |
| Soils | ASRIS soils | Open | Yes | Include with attribution |
| Bushfire | Bushfire prone areas (WA) | Open | Yes | Screening constraint |
| Grid | Lines/substations | Mixed | Link-out | v1 add-on if rights secured |
| Grid | Capacity tools | Link-out | Link-out | Disclaimer: "signal not guarantee" |
| Land | Cadastre/tenure | Restricted | No | BYO-license in v1 |
| Planning | Zoning overlays | Mixed | Link-out | Add-on per LGA rights |
| Environment | Protected areas (broad) | Open | Yes | Broad boundaries only |
| Environment | Threatened species | Restricted | No | Exclude; v1 add-on |
| Heritage | Heritage places | Mixed | Link-out | Link-out only |

---

## 4. Go/No-Go Checklist

Before publishing any layer, verify:

| Check | Required |
|-------|----------|
| License name + URL documented | Yes |
| Redistribution explicitly allowed | Yes |
| Attribution requirements captured | Yes |
| Update cadence known | Yes |
| Sensitivity classification assigned | Yes |
| Spatial resolution + intended use documented | Yes |
| Authority of record identified | Yes |

---

## 5. Update Cadence Targets

| Layer Type | Target Cadence | Notes |
|------------|----------------|-------|
| Solar resource grids | Monthly/Quarterly | Depends on source |
| DEM / slope / aspect | Annual | Stable unless new LiDAR |
| Soils | Annual | Depends on source refresh |
| Bushfire prone areas | Annual | Align to authoritative updates |
| Grid reference layers | Quarterly | "Reference" ≠ "capacity guarantee" |

---

## 6. Packaging Patterns

### Open (Redistributable)

```
Artifacts:
  - Raster → COG
  - Vector → GeoParquet + PMTiles

Manifest includes:
  - Source attribution
  - License reference
  - Update cadence
  - Integrity hashes
```

### Restricted / BYO-license

```
Handled via:
  - Tenant-scoped access controls
  - Derived/generalised products
  - Explicit redistribution permission
```

### Link-out Only

```
Manifest includes:
  links: [
    { rel: "grid-capacity-signal", title: "...", href: "..." }
  ]

Add disclaimers to avoid "false certainty"
```

---

## 7. Workflow: Solar Screening Score

### Inputs

- Candidate polygon(s)
- `solar.exposure`, `terrain.slope`, `hazard.bushfire_prone_area`, `soils.classification`

### Outputs

- Score table (CSV/Parquet)
- Clipped rasters and constraint overlays
- Lightweight "screening report" artifact
- `manifestPatch` referencing derived artifacts

### Determinism

- Same inputs + pack version = identical outputs
- Provenance captured in output manifest

---

## 8. Disclaimers

### Screening Only

```
This pack is designed for site screening and early feasibility
assessment only. It is NOT suitable for:
- Engineering design
- Final connection approvals
- Detailed environmental assessment

Always verify with authoritative sources before investment decisions.
```

### Grid Capacity

```
Grid proximity and capacity "signal" layers are references only.
They do NOT guarantee connection availability or costs.
Contact the relevant network operator for actual capacity assessments.
```

---

## 9. Acceptance Criteria (MVP)

- [ ] Manifest validates against JSON Schema with zero errors
- [ ] At least 6 layers ship in v0 (mix of raster + vector + references)
- [ ] All artifacts are immutable and hash-verified
- [ ] Pack loads in demo app (MapLibre) within 10s
- [ ] "Solar screening score" workflow runs end-to-end using pack URIs
- [ ] At least 2 pilot customers complete screening workflow

---

## 10. Cost Estimates

### v0 Pack Size (Estimated)

| Layer | Format | Estimated Size |
|-------|--------|----------------|
| Solar exposure | COG | 50-100 MB |
| DEM | COG | 100-200 MB |
| Slope | COG | 50-100 MB |
| Aspect | COG | 50-100 MB |
| Bushfire | GeoParquet + PMTiles | 20-50 MB |
| Soils | GeoParquet/COG | 30-80 MB |
| Roads | GeoParquet + PMTiles | 50-100 MB |
| **Total** | | **350-730 MB** |

### Infrastructure Costs

See `06-Cost-Modeling-and-Budget.md` for detailed cost breakdown.

---

## References

- Feature Spec: `spec/features/0004-wa-solar-feasibility-pack.md`
- Source: `Docs/Updates/wa-solar-feasibility-pack-manifest-outline.md`
- Source: `Docs/Updates/wa-solar-pack-licensing-matrix.md`
