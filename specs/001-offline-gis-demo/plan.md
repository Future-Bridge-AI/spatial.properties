# Implementation Plan: Offline GIS Demo System

**Branch**: `001-offline-gis-demo` | **Date**: 2025-10-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-offline-gis-demo/spec.md`

## Summary

Build a completely offline GIS demonstration system for sales presentations. The system renders interactive maps using PMTiles vector tiles and displays asset markers from a local DuckDB database. The entire application runs from a single portable folder without any internet connectivity requirement. Architecture uses static HTML with MapLibre GL JS for frontend, optional FastAPI backend for database queries, and Node.js http-server for local serving.

## Technical Context

**Language/Version**: JavaScript (ES6+), Python 3.11, Node.js 18+
**Primary Dependencies**: MapLibre GL JS 4.x, pmtiles.js 3.x, DuckDB 0.9+, FastAPI 0.104+ (optional), http-server 14+
**Storage**: DuckDB file (demo.duckdb) with spatial extension, PMTiles file (region.pmtiles)
**Testing**: Manual browser testing, optional pytest for backend API
**Target Platform**: Desktop browsers (Chrome, Firefox, Safari, Edge) on Windows/macOS/Linux
**Project Type**: Web application (static frontend + optional lightweight backend)
**Performance Goals**: <5s startup, <100ms interaction response, <1s query response, 500+ asset markers
**Constraints**: Zero network calls during demo, <100MB data bundle size, <500MB memory footprint, portable relative paths only
**Scale/Scope**: Single demo application, 500-1000 asset records, regional map coverage (~100MB tiles)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Planning Phase Gate

✅ **I. Offline-First Operation**
- **Compliance**: PASS
- MapLibre GL JS and pmtiles.js will be vendored (downloaded and included in project)
- PMTiles protocol loads tiles from local filesystem
- DuckDB runs locally without network access
- http-server serves files from local directory
- FastAPI (if used) only queries local DuckDB file
- No CDN dependencies in production build

✅ **II. Production Format Parity**
- **Compliance**: PASS
- Using DuckDB (production-grade analytics database)
- Using PMTiles (standard for vector tile distribution)
- Schemas match real utility asset data model
- GeoParquet can be loaded into DuckDB for production parity

✅ **III. Single-Folder Portability**
- **Compliance**: PASS
- All files in one directory: index.html, assets/*.pmtiles, data/*.duckdb, lib/*.js
- Relative paths only (./assets/region.pmtiles, ./data/demo.duckdb)
- Run scripts (run.sh, run.ps1) launch from current directory
- No environment variables or configuration files required
- Works when copied to USB stick or different folder path

✅ **IV. Absolute Repeatability**
- **Compliance**: PASS
- Fixed seed data in DuckDB (version controlled SQL scripts)
- PMTiles file is static (no dynamic tile generation)
- Deterministic asset positions and attributes
- No random number generation or time-dependent queries
- Same visual output every demo execution

✅ **V. Minimal Dependency Surface**
- **Compliance**: PASS
- Core: Only MapLibre GL JS, pmtiles.js, DuckDB (3 dependencies)
- Optional: FastAPI + uvicorn (only if API approach chosen)
- http-server for development/demo serving (standard Node.js tool)
- Conda manages Python environment (isolated, reproducible)
- All JavaScript libraries vendored locally

**Gate Status**: ✅ ALL GATES PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-offline-gis-demo/
├── plan.md              # This file
├── research.md          # Technology decisions and rationale
├── data-model.md        # Asset entity schema
├── quickstart.md        # Demo usage scenarios
├── contracts/           # API schemas (if FastAPI used)
│   └── api-spec.yaml    # OpenAPI specification
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
demo-offline-gis/
├── index.html           # Main application entry point
├── assets/
│   └── region.pmtiles   # Vector tile basemap
├── data/
│   ├── demo.duckdb      # Asset database
│   └── seed.sql         # Database initialization script
├── lib/
│   ├── maplibre-gl.js   # Vendored MapLibre GL JS
│   ├── maplibre-gl.css  # MapLibre styles
│   └── pmtiles.js       # Vendored PMTiles library
├── api/                 # Optional FastAPI backend
│   ├── main.py          # FastAPI application
│   ├── models.py        # Database models
│   └── requirements.txt # Python dependencies
├── scripts/
│   ├── create-pmtiles.py   # Tool to generate PMTiles from sources
│   └── load-assets.py      # Tool to populate DuckDB from CSV/GeoJSON
├── run.sh               # Unix launch script
├── run.ps1              # Windows launch script
├── environment.yml      # Conda environment specification
├── package.json         # Node.js dependencies (http-server)
└── README.md            # Quick start guide
```

**Structure Decision**: Web application structure with static frontend and optional lightweight backend. Frontend is fully self-contained HTML/JS that can run entirely via file:// protocol or simple HTTP server. Optional FastAPI backend provides API layer for more complex queries if needed, but basic demo works with direct DuckDB access via client-side queries (using sql.js-httpvfs pattern or pre-loaded GeoJSON).

## Complexity Tracking

> No constitution violations - this section intentionally left empty.
