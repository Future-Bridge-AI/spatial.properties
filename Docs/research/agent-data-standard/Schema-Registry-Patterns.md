# Schema Registry Patterns — Research Notes

## Overview

This document captures research on schema registry patterns relevant to Spatial.Properties, including Vecorel alignment, fiboa/STAC approaches, and encoding profiles.

---

## 1. Vecorel Alignment

### What is Vecorel?

Vecorel is an emerging specification for vector-based geospatial data that emphasizes:

- **Versioned schemas** with semantic versioning
- **Encoding profiles** that adapt schemas to target formats (GeoParquet, GeoJSON, PMTiles)
- **Extensions framework** for composable add-ons
- **SDL (Schema Definition Language)** for human-readable schema authoring

### Key Concepts from Vecorel

| Concept | Description | Relevance to Spatial.Properties |
|---------|-------------|--------------------------------|
| **schema_uri** | Canonical, versioned reference to schema | Direct adoption: `https://schemas.spatial.properties/v1/...` |
| **Encoding Profile** | Format-specific adaptation of a schema | Support `geoparquet@1`, `mvt@1`, `geojson@1` profiles |
| **Extensions** | Composable, versioned add-ons | `extensions[]` array in layer entries |
| **Conformance** | Machine-readable validation reports | `validation{}` block with status, errors, warnings |

### Vecorel vs Spatial.Properties Mapping

| Vecorel Term | Spatial.Properties Term | Notes |
|--------------|------------------------|-------|
| Schema | Schema Artifact | JSON Schema + metadata |
| Profile | schema_profile | Format-specific encoding |
| Extension | Extension Artifact | Composable add-ons |
| Conformance Report | Conformance Report | Identical purpose |

---

## 2. fiboa (Field Boundaries for Agriculture)

### Overview

fiboa provides schemas for agricultural field boundaries with:

- GeoParquet as primary format
- JSON Schema for validation
- STAC-like extension mechanism
- Community-driven schema governance

### Lessons for Spatial.Properties

| fiboa Pattern | Applicability | Notes |
|---------------|---------------|-------|
| **Single primary format** | Partial | fiboa uses GeoParquet only; we support multiple |
| **Extension registry** | Yes | fiboa uses GitHub repo; we use static hosting |
| **Required properties** | Yes | Core properties enforced via JSON Schema |
| **Community governance** | Future | Consider RFC process for stable extensions |

### Schema Structure Example (fiboa)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["geometry", "id", "determination_datetime"],
  "properties": {
    "geometry": {"$ref": "#/$defs/polygon"},
    "id": {"type": "string"},
    "determination_datetime": {"type": "string", "format": "date-time"},
    "area": {"type": "number", "minimum": 0}
  }
}
```

---

## 3. STAC Extensions

### Overview

SpatioTemporal Asset Catalog (STAC) uses a flexible extension system:

- Extensions published as JSON Schema fragments
- Prefix-based namespacing (`sar:`, `eo:`, `proj:`)
- Maturity levels: `proposal` → `pilot` → `candidate` → `stable` → `deprecated`

### STAC Extension Patterns

| Pattern | Description | Adoption |
|---------|-------------|----------|
| **Prefix namespacing** | `vendor:property_name` | Yes, for third-party extensions |
| **Maturity tracking** | Lifecycle stages | Yes, in extension metadata |
| **Conformance classes** | URI-based capability flags | Consider for future |
| **Fragment composition** | Extensions as JSON Schema $refs | Yes |

### Extension Maturity Model

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ experimental │ ──▶ │  candidate  │ ──▶ │   stable    │ ──▶ │ deprecated  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
   RFC proposed        Implementations     Breaking changes     Sunset period
   May change          2+ adopters         require major bump   12 months
```

---

## 4. Encoding Profiles

### Concept

An encoding profile adapts a logical schema to a specific serialization format:

- **Logical Schema**: Abstract field definitions
- **Encoding Profile**: Format-specific rules (column names, types, geometry encoding)

### Profile Examples

| Logical Type | GeoParquet Profile | PMTiles (MVT) Profile | GeoJSON Profile |
|--------------|-------------------|----------------------|-----------------|
| `geometry` | WKB/WKT column | Tile coordinates | GeoJSON geometry |
| `datetime` | Timestamp column | String property | ISO 8601 string |
| `integer` | Int64 column | Number property | JSON number |
| `string[]` | List column | Comma-separated | JSON array |

### Profile Selection

```json
{
  "schema_uri": "https://schemas.spatial.properties/v1/base/transport/roads@12.1.0",
  "schema_profile": "geoparquet@1"
}
```

The `schema_profile` tells the validator which encoding rules to apply when checking the data.

---

## 5. SDL Authoring (Future Consideration)

### What is SDL?

Schema Definition Language allows human-readable schema authoring:

```sdl
type Road {
  id: String! @primary
  name: String
  surface: SurfaceType
  lanes: Int @min(1)
  geometry: LineString!
}

enum SurfaceType {
  ASPHALT
  CONCRETE
  GRAVEL
  UNPAVED
}
```

### Benefits

- More readable than raw JSON Schema
- IDE support (autocomplete, syntax highlighting)
- Generates JSON Schema + documentation

### Decision

**Parked for now.** JSON Schema is sufficient for MVP. Consider SDL when:
- Schema count exceeds 50
- External contributors need to author schemas
- Tooling ecosystem matures

---

## 6. Comparison Matrix

| Capability | Vecorel | fiboa | STAC | Spatial.Properties |
|------------|---------|-------|------|-------------------|
| **Primary format** | Multiple | GeoParquet | Multiple | Multiple |
| **Schema hosting** | TBD | GitHub | GitHub | Static CDN |
| **Extension mechanism** | Yes | Yes | Yes | Yes |
| **Maturity levels** | Yes | No | Yes | Yes |
| **Conformance reports** | Yes | No | No | Yes |
| **Encoding profiles** | Yes | Implicit | No | Yes |
| **Signing/trust** | No | No | No | Yes |
| **Version strategy** | SemVer | SemVer | SemVer | SemVer |

---

## 7. URI Conventions

### Namespace Structure

```
https://schemas.spatial.properties/v1/{namespace}/{name}@{version}
```

Examples:
- `https://schemas.spatial.properties/v1/base/transport/roads@12.1.0`
- `https://schemas.spatial.properties/v1/base/land/parcels@3.2.0`
- `https://schemas.spatial.properties/ext/spatial-properties:lineage@1.0.0`
- `https://schemas.spatial.properties/ext/wa:planning-constraints@0.1.0`

### Version Resolution

| URI Pattern | Resolution |
|-------------|------------|
| `...@12.1.0` | Exact version |
| `...@12.1` | Latest patch (12.1.x) |
| `...@12` | Latest minor (12.x.y) |
| `...@latest` | Latest stable release |

---

## 8. Governance Model (Future)

### Extension Lifecycle

1. **Proposal**: Author submits RFC with schema + rationale
2. **Review**: Technical review (7-14 days)
3. **Experimental**: Published with `experimental` maturity
4. **Candidate**: 2+ implementations, promoted after 90 days
5. **Stable**: Breaking changes require major version bump
6. **Deprecated**: 12-month sunset with migration guide

### Responsibilities

| Role | Responsibility |
|------|---------------|
| **Schema Author** | Draft schema, respond to review |
| **Reviewers** | Technical accuracy, consistency |
| **Registry Maintainer** | Publish, version management |
| **Pack Publishers** | Adopt schemas, report issues |

---

## 9. Implementation Recommendations

### Phase 1 (MVP)

- [ ] Define 2 base schemas: `transport/roads`, `land/parcels`
- [ ] Define 2 extensions: `lineage@1.0.0`, `wa:planning-constraints@0.1.0`
- [ ] Implement validator CLI with JSON Schema validation
- [ ] Host schemas as static files on CDN
- [ ] Generate conformance reports in JSON format

### Phase 2 (If Pull Exists)

- [ ] Add schema catalog with search/tags
- [ ] Implement compatibility/diff automation
- [ ] Add profile detection (auto-select based on format)

### Phase 3 (Ecosystem Scale)

- [ ] Schema Registry Service with governance UI
- [ ] Extension marketplace with RFC workflow
- [ ] SDL authoring toolchain

---

## References

- Feature Spec: `spec/features/0002-schema-registry-validation.md`
- Architecture: `Docs/architecture/03-Schema-Registry-and-Validation.md`
- Vecorel: https://github.com/vecorel/vecorel-spec (emerging)
- fiboa: https://github.com/fiboa/specification
- STAC Extensions: https://stac-extensions.github.io/
