# Feature 0004 — WA Solar Feasibility Spatial Pack (Hero Example)

**Feature Branch**: `0004-wa-solar-feasibility-pack`
**Created**: 2025-12-30
**Status**: Draft
**Input**: wa-solar-feasibility-pack-manifest-outline.md, wa-solar-pack-licensing-matrix.md

## Goal

Deliver a first "hero" Spatial Pack for **solar site screening & feasibility** in Western Australia that:
- Demonstrates the pack-first approach end-to-end
- Leads with **buyer outcomes**: screen → shortlist → de-risk → approvals
- Ships an **open/public v0** quickly with a clear path to **licensed add-ons** (v1+)
- Provides a **repeatable evidence trail** for defensible decisions

**Pack ID**: `wa-solar-feasibility-pack`
**Display Name**: WA Solar Feasibility Pack
**Primary Audience**: Solar developers, planners, feasibility / grid connection teams
**Geography**: Western Australia (initially); designed to scale to AU states via same schema

---

## Pack Promise

When a customer loads this pack, they can:
- **Rank candidate land** by solar resource + slope/aspect suitability
- **Filter out constraints** (bushfire prone areas, environmental proxies)
- **Estimate connection friction** (proximity layers + capacity signal references)
- **Generate a repeatable screening report** using deterministic tools/workflows
- **Reproduce decisions** later (same pack version + integrity hashes)

---

## User Scenarios & Testing

### User Story 1 - Solar Developer Ranks Candidate Land (Priority: P1)

A solar developer loads the WA Solar Feasibility Pack and uses solar exposure + slope + aspect layers to rank candidate parcels by suitability score.

**Why this priority**: Core value prop — faster site identification.

**Independent Test**: Developer can load pack in MapLibre, overlay solar exposure on candidate parcels, and calculate relative suitability.

**Acceptance Scenarios**:

1. **Given** the pack loaded in a map viewer, **When** user selects a candidate polygon, **Then** solar exposure and slope values are queryable for that area.
2. **Given** a list of 10 candidate sites, **When** user runs ranking analysis, **Then** sites are scored and ordered by solar suitability.
3. **Given** a candidate site with slope > 15%, **When** user views suitability score, **Then** score reflects reduced suitability due to grading costs.

---

### User Story 2 - Planner Filters Fatal Constraints (Priority: P2)

A planner overlays constraint layers (bushfire prone areas, environmental sensitivity) to filter out sites with fatal flaws before detailed assessment.

**Why this priority**: Prevents wasted effort on sites that cannot be developed.

**Independent Test**: Planner can overlay bushfire layer and see which candidate parcels intersect.

**Acceptance Scenarios**:

1. **Given** the bushfire prone areas layer loaded, **When** user intersects with candidate parcels, **Then** parcels within bushfire zones are flagged.
2. **Given** an environmental sensitivity proxy layer, **When** user overlays on candidates, **Then** high-risk areas are visible with clear symbology.
3. **Given** a candidate site fully within a constraint zone, **When** viewing shortlist, **Then** site is marked "fatal constraint" with reason.

---

### User Story 3 - Feasibility Team Estimates Grid Connection (Priority: P3)

A feasibility team uses proximity layers (substations, transmission lines) and grid capacity signal references to estimate connection friction for shortlisted sites.

**Why this priority**: Grid connection is often the deciding factor for solar project viability.

**Independent Test**: Team can measure distance from candidate site to nearest substation and access capacity signal tool link.

**Acceptance Scenarios**:

1. **Given** the grid infrastructure reference layer, **When** user measures distance from site to nearest substation, **Then** distance is returned in km.
2. **Given** a candidate site, **When** user clicks grid capacity signal link, **Then** external tool opens for that region.
3. **Given** proximity analysis complete, **When** viewing site profile, **Then** estimated connection friction (low/medium/high) is displayed.

---

### User Story 4 - Decision Maker Generates Screening Report (Priority: P4)

A decision maker runs the screening workflow to generate a repeatable report with evidence trail: clipped rasters, constraint overlays, scores, and provenance.

**Why this priority**: Defensible decisions require reproducibility and audit trail.

**Independent Test**: Decision maker can run workflow, receive PDF/JSON report, and re-run with same inputs to get identical outputs.

**Acceptance Scenarios**:

1. **Given** a shortlist of 3 sites, **When** user runs screening report workflow, **Then** output includes clipped COGs, score table, and constraint summary.
2. **Given** a screening report artifact, **When** user checks provenance, **Then** report references exact pack version and layer hashes.
3. **Given** the same inputs and pack version, **When** workflow is re-run, **Then** outputs are byte-identical (deterministic).

---

### Edge Cases

- What if solar exposure data is not available for a region? → Layer marked "no data" with notice; scoring skips that input.
- What if grid infrastructure layer cannot be redistributed? → Use link-out reference only; pack includes disclaimer.
- What if user attempts to use pack for engineering design? → Pack includes prominent "screening only" disclaimer.

---

## Requirements

### Functional Requirements

- **FR-001**: Pack MUST include minimum 6 layers: solar exposure, terrain DEM, slope, aspect, bushfire prone areas, access roads.
- **FR-002**: Manifest MUST validate against spatialpack.json JSON Schema.
- **FR-003**: All artifacts MUST be immutable and hash-verified (SHA256 or BLAKE3).
- **FR-004**: Pack MUST load in demo app (MapLibre GL + raster/vector support).
- **FR-005**: "Solar screening score" workflow MUST be deterministic and reproducible.
- **FR-006**: Pack MUST include `contract.json` and `policy.json` with clear redistribution terms.
- **FR-007**: Grid capacity tools MUST be link-out references only (v0); no redistribution unless rights secured.
- **FR-008**: Sensitive environmental/heritage data MUST be excluded from public v0 (generalised proxies allowed).

### Layer Catalog (v0 Minimum Viable)

#### Raster Layers (analysis-ready)
| layerId | Type | Description | Format |
|---------|------|-------------|--------|
| `solar.exposure` | raster | Solar exposure / irradiance proxy grid | COG |
| `terrain.dem` | raster | Elevation model | COG |
| `terrain.slope` | raster | Derived slope (%) | COG |
| `terrain.aspect` | raster | Derived aspect (degrees) | COG |

#### Vector Layers (screening constraints)
| layerId | Type | Description | Format |
|---------|------|-------------|--------|
| `hazard.bushfire_prone_area` | vector | Bushfire prone areas | GeoParquet + PMTiles |
| `soils.classification` | vector/raster | Soils classification | GeoParquet and/or COG |
| `access.roads_reference` | vector | Roads reference for access | GeoParquet + PMTiles |
| `grid.infrastructure_reference` | vector | Substations/lines reference | GeoParquet + PMTiles OR link-out |

#### Reference Links (non-redistributed)
| refId | Description | Handling |
|-------|-------------|----------|
| `grid.capacity_signal` | Network capacity mapping tools | Link-out only |
| `heritage.inquiry` | Heritage/ACH inquiry systems | Link-out only |
| `environment.sensitive_occurrences` | Threatened species/communities | Excluded (v1+ add-on) |

### Key Entities

- **Solar Pack Manifest**: `spatialpack.json` following standard structure
- **Layer Catalog**: registry of layers with artifacts, schemas, sources
- **Licensing Matrix**: category assignments (Open, Restricted, Commercial, BYO, Link-out)
- **Screening Workflow**: deterministic process producing evidence artifacts

---

## Data Contracts

**Pack manifest structure:**
```json
{
  "packId": "wa-solar-feasibility-pack",
  "packVersion": "2025.12.30",
  "title": "WA Solar Feasibility Pack",
  "description": "Curated spatial layers for solar site screening and early feasibility in Western Australia.",
  "region": {
    "country": "AU",
    "state": "WA",
    "bbox": [112.92, -35.19, 129.00, -13.69]
  },
  "topics": ["solar", "site-screening", "constraints", "feasibility"],
  "createdAt": "2025-12-30T00:00:00Z",
  "updatedAt": "2025-12-30T00:00:00Z",
  "licensing": {
    "redistribution": "allowed",
    "attribution": "See sources[].attribution",
    "constraints": [
      "Capacity layers are link-out only in v0.",
      "Sensitive environmental/heritage datasets excluded from public v0."
    ]
  },
  "sources": [
    { "sourceId": "SOURCE_SOLAR_01", "name": "BOM / NASA POWER", "license": "Open" },
    { "sourceId": "SOURCE_DEM_01", "name": "National DEM / SRTM", "license": "Open" }
  ],
  "integrity": {
    "manifestSha256": "sha256:...",
    "artifactSha256Policy": "required"
  },
  "layers": [ /* see layer catalog */ ],
  "links": [
    { "rel": "grid-capacity-signal", "title": "Network capacity mapping tool", "href": "..." }
  ]
}
```

---

## Licensing Matrix (v0 vs v1)

| Theme | Dataset | Category | v0 Include? | Notes |
|-------|---------|----------|-------------|-------|
| Solar | BoM/NASA POWER | Open | Yes | Include with attribution |
| Terrain | National DEM / SRTM | Open | Yes | Include DEM + derived |
| Terrain | Slope/Aspect | Derived | Yes | Always safe (derived) |
| Soils | ASRIS soils | Open | Yes | Include with attribution |
| Bushfire | Bushfire prone areas (WA) | Open | Yes | Screening constraint |
| Grid | Lines/substations | Mixed | Link-out | v1 add-on if rights secured |
| Grid | Capacity tools | Link-out | Link-out | Disclaimer: "signal not guarantee" |
| Land | Cadastre/tenure | Restricted | No | BYO-license in v1 |
| Environment | Protected areas | Open | Yes | Broad boundaries only |
| Environment | Threatened species | Restricted | No | Exclude; v1 add-on |
| Heritage | Heritage places | Mixed | Link-out | Link-out only |

**Go/No-Go Checklist per Layer:**
1. License name + URL documented?
2. Redistribution explicitly allowed?
3. Attribution requirements captured?
4. Update cadence known?
5. Sensitivity classification assigned?
6. Spatial resolution + intended use documented?
7. Authority of record identified?

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Pack validates against JSON Schema with zero errors.
- **SC-002**: At least 6 layers ship in v0 (mix of raster + vector + references).
- **SC-003**: All artifacts are immutable and hash-verified.
- **SC-004**: Pack loads in demo app (MapLibre) within 10s.
- **SC-005**: "Solar screening score" workflow runs end-to-end using pack URIs.
- **SC-006**: At least 2 pilot customers complete screening workflow and confirm reproducibility.

---

## Non-Goals (v0)

- Licensed add-on layers (cadastre, tenure, grid capacity data).
- BYO-license connectors for customer-supplied data.
- Commercial irradiance products (Solcast).
- Multi-state coverage (starts WA only).

---

## Update Cadence Targets (v0)

| Layer Type | Target Cadence | Notes |
|------------|----------------|-------|
| Solar resource grids | Monthly/Quarterly | Depends on source |
| DEM / slope / aspect | Annual | Stable unless new LiDAR |
| Soils | Annual | Depends on source refresh |
| Bushfire prone areas | Annual | Align to authoritative updates |
| Grid reference layers | Quarterly | "Reference" ≠ "capacity guarantee" |

---

## Metrics (v0)

- Pack downloads per week
- Screening workflow executions per week
- Layer query volume by layer type
- User-reported issues (missing data, incorrect constraints)

---

## Rollout

1. **Release 0.1 (Open v0)**
   - Solar exposure (open)
   - DEM + slope + aspect
   - Soils (open)
   - Bushfire prone areas (open)
   - Access roads (open)
   - Grid capacity tool link-out

2. **Release 0.2**
   - Add flood/drainage proxy (open/verified)
   - Add protected areas boundaries (open/verified)
   - Add "screening score" workflow artifacts

3. **Release 1.0 (v1 add-ons)**
   - BYO/tenant cadastre + tenure
   - Zoning overlays where permitted
   - Restricted ecology/heritage as controlled access
   - Commercial irradiance products via contract

---

## Risks

- Open datasets may have licensing nuances that block redistribution.
- Grid capacity "signal" may be misinterpreted as "guarantee."
- Screening-only pack may be used for engineering design.

**Mitigations:**
- Verify-before-publish licensing checklist.
- Prominent disclaimers on capacity and intended use.
- Clear "screening only" messaging in manifest and UI.

---

## Open Questions

- Which specific BoM/NASA POWER product to use for solar exposure?
- Can we include any grid infrastructure (lines/substations) in v0, or strictly link-out?
- What soils attributes are most relevant for solar site grading?

---

## References

- `Docs/Updates/wa-solar-feasibility-pack-manifest-outline.md` (source)
- `Docs/Updates/wa-solar-pack-licensing-matrix.md` (source)
- `Docs/planning/07-Solar-Pack-Example-and-Licensing.md` (planning detail)
