# Quickstart Guide: Offline GIS Demo System

**Feature**: 001-offline-gis-demo
**Date**: 2025-10-27
**Purpose**: Integration scenarios and usage guide for demo system

## Prerequisites

### Required
- Node.js 18+ (for http-server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Optional (for FastAPI backend)
- Python 3.11+
- Conda or venv

## Quick Start (Simplest Path)

This approach uses pre-exported GeoJSON and requires minimal setup.

### Step 1: Install http-server

```bash
# One-time setup
npm install -g http-server
```

### Step 2: Start the demo

```bash
# Navigate to demo folder
cd demo-offline-gis

# Start server
http-server -p 3000

# Open browser to http://localhost:3000
```

### Step 3: Test offline capability

1. Open browser DevTools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Refresh page - map should still work
5. Click assets - details should appear

**Expected Result**: Map loads, assets display, interactions work without network.

## Integration Scenarios

### Scenario 1: Sales Presentation (Read-Only Demo)

**Use Case**: Sales team demonstrates GIS capabilities to client in boardroom with unreliable WiFi.

**Setup**:
```bash
# 1. Copy demo folder to USB stick
cp -r demo-offline-gis /media/usb/

# 2. On client laptop, copy from USB to desktop
cp -r /media/usb/demo-offline-gis ~/Desktop/

# 3. Navigate and launch
cd ~/Desktop/demo-offline-gis
./run.sh  # or run.ps1 on Windows
```

**Workflow**:
1. Browser opens automatically to http://localhost:3000
2. Map displays Western Australia region
3. Sales person pans/zooms to show different areas
4. Clicks asset markers to show details
5. Discusses status colors (green=OK, yellow=Watch, red=Alert)
6. Demonstrates no network dependency by showing airplane mode

**Success Metrics**:
- Startup: <5 seconds from script execution to visible map
- Interaction: <100ms response to pan/zoom/click
- Reliability: Works identically with WiFi on/off

### Scenario 2: Technical Deep-Dive (With FastAPI Backend)

**Use Case**: Technical buyer wants to see database integration and query capabilities.

**Setup**:
```bash
# 1. Create conda environment
conda env create -f environment.yml
conda activate gis-demo

# 2. Start FastAPI backend
cd api
uvicorn main:app --reload --port 8000

# 3. In new terminal, start frontend
http-server -p 3000

# 4. Open http://localhost:3000
```

**Workflow**:
1. Open browser console to show API calls
2. Demonstrate /assets endpoint: `curl http://localhost:8000/assets`
3. Filter by status: `curl http://localhost:8000/assets?status=Alert`
4. Show GeoJSON endpoint: `curl http://localhost:8000/assets/geojson`
5. Explain DuckDB query patterns
6. Demonstrate database file portability (copy .duckdb, restart API)

**Success Metrics**:
- API response time: <1 second for all queries
- Database connection: Instant (file-based)
- Query accuracy: Correct filtering results

### Scenario 3: Data Update Demonstration

**Use Case**: Show how easy it is to update demo data for different regions/clients.

**Setup**:
```bash
# 1. Edit assets CSV with new data
vi data/assets.csv

# 2. Reload database
python scripts/load-assets.py

# 3. Export to GeoJSON
python scripts/export-geojson.py

# 4. Restart demo
http-server -p 3000
```

**Workflow**:
1. Show original asset distribution on map
2. Update CSV with new assets (copy from spreadsheet)
3. Run load script: `python scripts/load-assets.py`
4. Refresh browser
5. New assets appear immediately

**Success Metrics**:
- Update time: <1 minute from CSV edit to visible changes
- Data accuracy: 100% of CSV records appear correctly positioned
- No data loss: Original assets plus new assets both present

### Scenario 4: Cross-Platform Deployment

**Use Case**: Verify demo works on Windows, macOS, and Linux without modification.

**Windows Setup**:
```powershell
# PowerShell
cd demo-offline-gis
.\run.ps1
```

**macOS/Linux Setup**:
```bash
cd demo-offline-gis
chmod +x run.sh
./run.sh
```

**Workflow**:
1. Run identical demo folder on different OS
2. Verify map rendering
3. Verify asset interactions
4. Verify performance targets met
5. Check browser compatibility (Chrome, Firefox, Safari, Edge)

**Success Metrics**:
- Zero code changes between platforms
- Identical visual output
- Same performance characteristics

## Troubleshooting Guide

### Problem: Map doesn't load

**Symptoms**: Blank screen or "Failed to load tiles" error

**Solutions**:
1. Check PMTiles file exists: `ls assets/region.pmtiles`
2. Verify file size >0: `du -h assets/region.pmtiles`
3. Check browser console for errors
4. Try different browser
5. Verify http-server is running on correct port: `lsof -i :3000`

### Problem: Assets don't appear

**Symptoms**: Map loads but no markers visible

**Solutions**:
1. Check GeoJSON file exists: `ls data/assets.geojson`
2. Verify GeoJSON is valid JSON: `python -m json.tool < data/assets.geojson`
3. Check asset coordinates are in visible map bounds
4. Verify GeoJSON path in index.html is correct (relative path)
5. Check browser console for 404 errors

### Problem: Asset details don't show on click

**Symptoms**: Map and assets load, but clicking does nothing

**Solutions**:
1. Verify click event handler is registered (check browser console)
2. Ensure detail panel HTML element exists in DOM
3. Check asset properties are populated in GeoJSON
4. Try clicking directly on marker (not near it)

### Problem: FastAPI backend errors

**Symptoms**: API returns 500 error or connection refused

**Solutions**:
1. Check DuckDB file path in api/main.py
2. Verify DuckDB file exists and is readable
3. Check conda environment is activated: `conda info --envs`
4. Verify spatial extension loads: `python -c "import duckdb; duckdb.connect(':memory:').execute('LOAD spatial')"`
5. Check port 8000 isn't already in use: `lsof -i :8000`

### Problem: Performance is slow

**Symptoms**: Startup >5s, interactions lag

**Solutions**:
1. Reduce PMTiles file size (lower max zoom level)
2. Limit asset count to <500 records
3. Enable MapLibre GL clustering for dense regions
4. Check browser memory usage (DevTools Performance tab)
5. Close other browser tabs/applications

## Performance Validation

### Startup Time Test

```bash
# Measure from script execution to visible map
time ./run.sh
# Then manually time when map appears in browser
# Target: <5 seconds total
```

### Interaction Response Test

```bash
# 1. Open browser DevTools > Performance
# 2. Start recording
# 3. Pan/zoom map
# 4. Click asset
# 5. Stop recording
# 6. Verify events complete within 100ms
```

### Offline Functionality Test

```bash
# 1. Load demo with network enabled
# 2. Open DevTools > Network tab
# 3. Enable "Offline" mode
# 4. Refresh page
# 5. Verify map loads
# 6. Verify assets appear
# 7. Verify clicks work
# 8. Check Network tab shows zero requests (all from cache/files)
```

### Memory Footprint Test

```bash
# 1. Open demo
# 2. Open browser Task Manager (Shift+Esc in Chrome)
# 3. Find demo tab process
# 4. Verify memory <500MB
# 5. Pan/zoom extensively
# 6. Verify memory doesn't grow unbounded
```

## Data Refresh Workflow

### Adding New Assets

1. **Edit CSV**:
```csv
# Add row to data/assets.csv
101,New Substation,Substation,OK,-31.5,116.2,Newly constructed,2024-12-01,750kV,Wheatbelt
```

2. **Reload Database**:
```bash
python scripts/load-assets.py
# Output: "Loaded 101 assets into demo.duckdb"
```

3. **Export GeoJSON**:
```bash
python scripts/export-geojson.py
# Output: "Exported 101 features to assets.geojson"
```

4. **Verify**:
```bash
# Count features in GeoJSON
grep -c '"type": "Feature"' data/assets.geojson
# Should match asset count
```

### Updating PMTiles Basemap

1. **Obtain new PMTiles file**:
   - Download from Protomaps
   - Generate with tippecanoe
   - Convert from MBTiles

2. **Replace file**:
```bash
mv new-region.pmtiles assets/region.pmtiles
```

3. **Update map bounds** (if different region):
```javascript
// In index.html, update map initialization
center: [115.86, -31.95],  // [lon, lat] for new region
zoom: 6
```

4. **Test**:
   - Launch demo
   - Verify tiles load at all zoom levels
   - Verify file size <100MB (or adjust target)

## Packaging for Distribution

### Create Distribution Package

```bash
# 1. Ensure all files present
ls index.html assets/region.pmtiles data/demo.duckdb lib/

# 2. Test demo works
./run.sh

# 3. Create archive
tar -czf gis-demo-v1.tar.gz demo-offline-gis/
# or
zip -r gis-demo-v1.zip demo-offline-gis/

# 4. Verify archive size <150MB
du -h gis-demo-v1.tar.gz
```

### Distribution Checklist

- [ ] All JavaScript libraries vendored in /lib
- [ ] PMTiles file <100MB
- [ ] DuckDB file present with test data
- [ ] Run scripts (run.sh, run.ps1) included
- [ ] README.md with quick start instructions
- [ ] No absolute paths in any code
- [ ] Tested on clean machine (no prior setup)
- [ ] Tested in offline mode (airplane mode enabled)
- [ ] Package size <150MB total

## Extension Points

### Adding New Asset Attributes

1. Add column to CSV
2. Update DuckDB schema in load script
3. Update GeoJSON export to include new field
4. Update detail panel HTML to display new field

### Adding Map Layers

1. Add new GeoJSON source in MapLibre style
2. Define layer styling
3. Add to layer control (if building UI)

### Adding Filtering UI

1. Create HTML form for filter controls
2. Update GeoJSON source URL with query parameters
3. Or use MapLibre GL filter expressions client-side

### Adding Search Functionality

1. Load assets into JavaScript array
2. Implement search input with filter logic
3. Highlight matching assets on map
4. Zoom to selected asset
