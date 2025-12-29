# Research: Offline GIS Demo System

**Feature**: 001-offline-gis-demo
**Date**: 2025-10-27
**Purpose**: Technology selection and architectural decisions for offline GIS demonstration system

## Research Questions

1. How to serve vector tiles completely offline?
2. What's the best approach for offline database access in browser?
3. How to vendor JavaScript libraries for offline use?
4. What PMTiles implementation supports local file access?
5. How to structure data for optimal demo performance?

## Technology Decisions

### 1. Vector Tile Format and Serving

**Decision**: PMTiles (.pmtiles file format)

**Rationale**:
- Single-file archive eliminates need for tile server
- Supports HTTP Range requests for efficient partial reads
- Works with local http-server (no special tile server required)
- Industry standard for offline vector tile distribution
- MapLibre GL JS has native PMTiles protocol support via pmtiles.js
- Can be served via simple static file server

**Alternatives Considered**:
- MBTiles: Requires SQLite server or extraction step, less efficient for HTTP serving
- Directory of tiles: Thousands of small files, poor portability, slower to copy
- GeoJSON: Too large for regional coverage, not optimized for rendering at multiple zoom levels

**Implementation Approach**:
- Use `pmtiles.Protocol()` to register custom protocol handler
- Reference tiles as `pmtiles://./assets/region.pmtiles` in MapLibre style
- Generate PMTiles from source data using `pmtiles` CLI or `tippecanoe` → `pmtiles convert`

### 2. Database Technology and Access Pattern

**Decision**: DuckDB with optional FastAPI backend OR pre-exported GeoJSON

**Rationale**:
- DuckDB is production-grade analytics database (constitution compliance)
- Spatial extension supports geo queries
- Single .duckdb file, easy to bundle and version control
- Python ecosystem has mature DuckDB support
- Two valid access patterns depending on complexity needs:

**Option A: FastAPI Backend** (recommended for complex queries)
- FastAPI server queries DuckDB and returns JSON
- Cleaner separation of concerns
- Easier to implement filtering, aggregation, spatial queries
- Still runs locally (http://localhost:8000)

**Option B: Pre-exported GeoJSON** (simpler for basic demo)
- Python script exports assets from DuckDB to GeoJSON file
- index.html loads GeoJSON directly via fetch()
- No backend server required
- Suitable for <1000 assets

**Alternatives Considered**:
- SQL.js (SQLite in browser): Not production-parity, no spatial support
- IndexedDB: Browser-specific, not portable, not production format
- PostgreSQL: Requires database server installation, too heavyweight

**Implementation Approach** (FastAPI):
```python
# api/main.py
import duckdb
from fastapi import FastAPI

con = duckdb.connect("../data/demo.duckdb", read_only=True)
con.execute("LOAD spatial")

@app.get("/assets")
def get_assets():
    return con.execute("SELECT id, name, status, lat, lon FROM assets").fetchdf().to_dict('records')
```

### 3. JavaScript Library Vendoring Strategy

**Decision**: Download and commit libraries to `/lib` directory

**Rationale**:
- Ensures offline operation (no CDN dependencies)
- Version pinning for repeatability
- No build step or bundler required
- Transparent - can inspect exact library code being used
- Complies with minimal dependency principle

**Alternatives Considered**:
- CDN links: Violates offline-first principle
- npm + webpack bundling: Adds build complexity, requires Node.js for build
- Git submodules: Overly complex for 2-3 libraries

**Implementation Approach**:
```bash
# Download libraries
curl -o lib/maplibre-gl.js https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.js
curl -o lib/maplibre-gl.css https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.css
curl -o lib/pmtiles.js https://unpkg.com/pmtiles@3.0.0/dist/pmtiles.js

# Reference in HTML
<script src="./lib/maplibre-gl.js"></script>
<link href="./lib/maplibre-gl.css" rel="stylesheet" />
<script src="./lib/pmtiles.js"></script>
```

### 4. Map Initialization and Asset Display

**Decision**: MapLibre GL JS with GeoJSON source for assets

**Rationale**:
- MapLibre GL JS is production-ready, actively maintained
- Supports PMTiles protocol via plugin
- High-performance WebGL rendering
- GeoJSON source for assets integrates cleanly
- Supports clustering, styling, interaction events

**Implementation Pattern**:
```javascript
// Initialize map with PMTiles basemap
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      basemap: {
        type: 'vector',
        url: 'pmtiles://./assets/region.pmtiles'
      },
      assets: {
        type: 'geojson',
        data: './data/assets.geojson'  // or from API
      }
    },
    layers: [
      { id: 'background', type: 'fill', source: 'basemap', ... },
      { id: 'assets', type: 'circle', source: 'assets', ... }
    ]
  }
});

// Click handler for asset details
map.on('click', 'assets', (e) => {
  const asset = e.features[0].properties;
  showDetailPanel(asset);
});
```

### 5. Python Environment Management

**Decision**: Conda with environment.yml

**Rationale**:
- Cross-platform (Windows, macOS, Linux)
- Manages both Python and system dependencies
- DuckDB Python package available via conda-forge
- Isolated environment prevents conflicts
- Single command setup: `conda env create -f environment.yml`

**Alternatives Considered**:
- venv + pip: No system dependency management, harder on Windows
- Poetry: Adds dependency, less familiar to data engineers
- Docker: Too heavyweight for demo, complicates file access

**Implementation**:
```yaml
# environment.yml
name: gis-demo
channels:
  - conda-forge
dependencies:
  - python=3.11
  - duckdb=0.9
  - fastapi=0.104
  - uvicorn=0.24
```

### 6. Launch Scripts and Deployment

**Decision**: Shell scripts for each platform + README

**Rationale**:
- run.sh and run.ps1 provide one-command launch
- Scripts handle multi-process coordination (http-server + FastAPI if used)
- Platform-specific but simple (no build tool required)
- README.md documents manual steps if scripts fail

**Launch Flow**:
1. Activate conda environment (or check Python available)
2. Start FastAPI backend (if API approach): `uvicorn api.main:app --reload`
3. Start http-server: `npx http-server -p 3000`
4. Open browser to http://localhost:3000

**Simplified Approach** (GeoJSON export):
1. Export assets: `python scripts/export-geojson.py`
2. Start server: `npx http-server -p 3000`
3. Open browser

## Data Generation Strategy

### PMTiles Creation

**Source Options**:
1. OpenStreetMap extract for region (via Protomaps)
2. Custom vector tiles from GeoJSON using `tippecanoe`
3. Download pre-made regional PMTiles

**Recommended**: Download Western Australia PMTiles from Protomaps or OSM

```bash
# Example: Generate custom PMTiles
tippecanoe -o region.pmtiles --force \
  --maximum-zoom=14 --minimum-zoom=5 \
  --drop-densest-as-needed \
  region.geojson
```

### DuckDB Asset Data

**Schema Design**:
```sql
CREATE TABLE assets (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  type VARCHAR,  -- e.g., 'Substation', 'Depot', 'Yard'
  status VARCHAR,  -- e.g., 'OK', 'Watch', 'Alert'
  lat DOUBLE,
  lon DOUBLE,
  geom GEOMETRY,  -- ST_Point(lon, lat)
  description TEXT,
  last_inspection DATE
);
```

**Seed Data Approach**:
1. CSV with representative WA utility assets
2. Python script loads CSV into DuckDB
3. Spatial extension creates geometry from lat/lon
4. Export to GeoJSON for frontend (if not using API)

```python
# scripts/load-assets.py
import duckdb
import pandas as pd

df = pd.read_csv('assets.csv')
con = duckdb.connect('../data/demo.duckdb')
con.execute("INSTALL spatial; LOAD spatial")
con.execute("CREATE TABLE assets AS SELECT * FROM df")
con.execute("""
  ALTER TABLE assets ADD COLUMN geom GEOMETRY;
  UPDATE assets SET geom = ST_Point(lon, lat);
""")
```

## Performance Optimization Considerations

1. **Tile Optimization**: Use appropriate zoom levels (5-14 for regional demo)
2. **Asset Clustering**: MapLibre GL cluster option for dense areas
3. **Data Size**: Keep assets <1000 records for instant load
4. **PMTiles Size**: Target <100MB for quick distribution
5. **Memory**: MapLibre GL efficient, should stay under 200MB with reasonable data

## Testing Strategy

**Manual Testing Checklist**:
- [ ] Launch in airplane mode - verify map loads
- [ ] Verify tiles render at all zoom levels
- [ ] Verify assets appear as markers
- [ ] Click asset - verify detail panel shows
- [ ] Copy folder to different location - verify still works
- [ ] Test on Windows, macOS, Linux
- [ ] Measure startup time (<5s)
- [ ] Measure interaction response (<100ms)

**Validation Scripts**:
```bash
# Verify no network calls
# 1. Enable airplane mode
# 2. Run demo
# 3. Open browser DevTools Network tab
# 4. Confirm zero external requests
```

## Open Questions Resolved

**Q: Should we use FastAPI backend or direct GeoJSON?**
A: Start with GeoJSON export (simpler). Add FastAPI only if complex filtering needed.

**Q: What coordinate system for asset data?**
A: WGS84 (EPSG:4326) - standard for web maps, matches PMTiles and GeoJSON expectations.

**Q: How to handle asset detail panel UI?**
A: Simple HTML div with dynamic content update. No framework needed for demo simplicity.

**Q: What browser storage for caching?**
A: None needed - all data in files, no dynamic caching required.

## Implementation Priority

**Phase 1 (MVP - User Story 1)**:
1. Setup project structure
2. Download and vendor MapLibre GL JS, pmtiles.js
3. Create basic index.html with map initialization
4. Obtain sample PMTiles file
5. Verify offline map rendering works

**Phase 2 (User Story 2)**:
1. Create DuckDB with asset schema
2. Load sample asset data (10-50 assets)
3. Export to GeoJSON
4. Add GeoJSON source to map
5. Style asset markers

**Phase 3 (User Story 3)**:
1. Add click event handler
2. Create detail panel HTML/CSS
3. Populate panel with asset attributes

**Optional Enhancement**:
- Add FastAPI backend if filtering needed
- Add asset clustering for dense regions
- Add search/filter UI
