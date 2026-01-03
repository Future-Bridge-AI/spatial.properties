# Spatialpack CLI

CLI tool for validating and managing Spatial Packs.

## Installation

```bash
pip install -e .
```

## Usage

### Validate a pack

```bash
spatialpack validate ./my-pack/
```

### Validate with strict mode (treat warnings as errors)

```bash
spatialpack validate ./my-pack/ --strict
```

### Output conformance report

```bash
spatialpack validate ./my-pack/ --output report.json
```

## Validation Rules

| Rule | Description |
|------|-------------|
| MANIFEST-001 | spatialpack.json exists and is valid JSON |
| MANIFEST-002 | Manifest validates against JSON Schema |
| MANIFEST-003 | pack_id follows naming convention |
| MANIFEST-004 | bbox is valid (minX < maxX, minY < maxY) |
| MANIFEST-005 | created_at is valid ISO 8601 |
| LAYER-001 | Each layer has corresponding file reference |
| LAYER-002 | Layer files are accessible |
| INTEGRITY-001 | Integrity hashes are present |
| STRUCTURE-001 | Pack structure is valid |

## Exit Codes

- `0` - Validation passed
- `1` - Validation failed (errors found, or warnings with --strict)

## License

MIT
