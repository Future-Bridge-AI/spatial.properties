# WA Solar Feasibility Spatial Pack — Licensing & Access Matrix (v0 / v1)

This document provides a pragmatic **licensing/access matrix** for shipping a first Solar Screening pack safely.

**Goal:** Ship a **public/open v0** quickly, while designing clear pathways for **restricted/commercial/BYO-license** add-ons in v1+.

> **Important:** Treat all licensing and redistribution as **“verify-before-publish.”**
> This matrix is an operational tool for planning. Final status requires a license check and (where needed) written permission.

---

## 1) Categories used in this matrix

**Open (Redistributable):** Can be packaged and served publicly with attribution.  
**Restricted:** Data may be public to view, but redistribution is limited or sensitive.  
**Commercial:** Proprietary datasets and products; redistribution requires contract.  
**BYO-license:** Customer supplies access rights; you provide packaging + delivery rails.  
**Link-out only:** You do not redistribute; you reference an authoritative portal/tool.

---

## 2) v0 vs v1 strategy

### v0 (Public pack)
- Only **Open** layers + minimal **Link-out** references.
- No sensitive heritage/ecology point locations.
- No commercial irradiance products unless you have a redistribution agreement.

### v1+ (Add-ons)
- Restricted layers behind tenant controls
- BYO-license connectors
- Commercial irradiance and high-value infrastructure layers

---

## 3) Licensing & access matrix

| Theme | Dataset candidate | Likely category | Redistribute in v0? | Risk | Recommended handling |
|---|---|---:|---:|---:|---|
| Solar | BoM solar exposure / irradiance grids | Open / verify | Yes (if license confirms) | Med | Include with attribution + cadence notes |
| Solar | NASA POWER solar resource | Open | Yes | Low | Include; cite source + date range |
| Solar | Solcast irradiance/time-series | Commercial | No | High | v1 add-on only; contract required |
| Terrain | National DEM / SRTM / ELVIS-sourced rasters | Open / verify | Yes | Low | Include DEM + derived slope/aspect |
| Terrain | Derived slope/aspect/hillshade | Derived | Yes | Low | Always safe (derived from open DEM) |
| Soils | ASRIS soils layers / API outputs | Open / verify | Yes | Med | Include with attribution; document resolution limits |
| Flood | Flood extents / drainage proxies | Open / verify | Maybe | Med | v0 optional; depends on authoritative source |
| Bushfire | Bushfire prone areas (WA) | Open / verify | Yes | Med | Include; treat as screening constraint only |
| Grid | Lines/substations (public reference) | Restricted / Open (varies) | Maybe | High | Prefer link-out in v0; add-on in v1 if rights secured |
| Grid | Capacity / constraint mapping tools | Link-out | No | Low | Link-out only; disclaimers on “signal vs guarantee” |
| Land | Cadastre / tenure | Restricted / paid | No | High | BYO-license or licensed add-on; do not ship publicly by default |
| Planning | Zoning / planning scheme overlays | Mixed | Maybe | Med/High | Start as link-out; add-on per LGA/state rights |
| Environment | Protected areas (generalised) | Open / verify | Yes | Med | Include broad reserves boundaries where allowed |
| Environment | Threatened species occurrences | Restricted / sensitive | No | High | Exclude from public; consider generalised buffers only |
| Heritage | Heritage places (non-sensitive) | Mixed | Maybe | High | Prefer link-out; include only where explicitly permitted |
| Indigenous heritage | Inquiry systems | Link-out | No | Low | Link-out only; do not embed sensitive site locations |
| Access | Roads (OpenStreetMap etc.) | Open | Yes | Med | Include only if OSM attribution is handled correctly |
| Logistics | Telecom coverage, services | Mixed | Maybe | Med | v1 add-on likely; start with link-out references |

---

## 4) Practical “go/no-go” checks before you publish any layer

For each dataset candidate, capture:

1) **License name + URL** (or contract reference)
2) **Redistribution allowed?** (explicitly)
3) **Attribution requirements** (exact text if required)
4) **Update cadence** (how often new versions appear)
5) **Sensitivity classification**
   - cultural/Indigenous heritage
   - threatened species / ecological occurrences
   - critical infrastructure / security-relevant detail
6) **Spatial resolution + intended use**
   - “screening only” vs “engineering design”
7) **Authority of record** (who owns/maintains it)

---

## 5) Policy defaults for Solar Pack v0

- **Default to exclusion** unless license explicitly allows redistribution.
- **Heritage & sensitive ecology:**
  - prefer link-out systems,
  - if needed, include **generalised** proxies (e.g., “environmental sensitivity zone”) rather than precise locations.
- **Grid:**
  - include **proximity references** only if rights are clear,
  - treat **capacity** as link-out “signal,” not an embedded dataset.
- Add a clear **disclaimer**: this pack supports *screening and feasibility*, not final connection approvals.

---

## 6) Packaging patterns by category

### Open (Redistributable)
- Ship as artifacts in the pack:
  - Raster → **COG**
  - Vector → **GeoParquet + PMTiles**
- Manifest includes:
  - source attribution,
  - license reference,
  - update cadence,
  - integrity hashes

### Restricted
- Ship only through:
  - tenant-scoped access controls, or
  - derived/generalised products, or
  - explicit redistribution permission

### BYO-license
- Provide a connector workflow:
  - customer supplies credentials / access token,
  - pack builder ingests to tenant bucket,
  - artifacts served with tenant keys and signed URLs

### Commercial
- Same as BYO or contracted redistribution:
  - never public by default

### Link-out only
- Include `links[]` records in the manifest:
  - `rel`, `title`, `href`, `notes`
- Add disclaimers to avoid “false certainty.”

---

## 7) Suggested release plan

**Release 0.1 (Open v0):**
- Solar exposure (open)
- DEM + slope + aspect
- Soils (open)
- Bushfire prone areas (open)
- Access roads (open)
- Grid capacity tool link-out

**Release 0.2:**
- Add flood/drainage proxy (open/verified)
- Add protected areas boundaries (open/verified)
- Add “screening score” workflow artifacts

**Release 1.0 (v1 add-ons):**
- BYO/tenant cadastre + tenure
- Zoning overlays where permitted
- Restricted ecology/heritage as generalised constraints or controlled access
- Commercial irradiance products via contract

---

## 8) Appendix — “AI assistant” guardrails for pack authoring

When an agent proposes a dataset:
- It must assign a category: Open / Restricted / Commercial / BYO / Link-out.
- If it cannot name the license, it must mark **TO VERIFY** and place it outside v0.
- It must propose how the dataset is packaged (COG / GeoParquet / PMTiles).
- It must specify what is *explicitly excluded* due to sensitivity.

