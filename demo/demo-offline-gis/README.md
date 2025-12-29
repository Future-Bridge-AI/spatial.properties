# Offline GIS Demo System

An offline-first GIS demonstration system for FBAI/VibeGIS sales presentations. Displays interactive maps with utility asset data, running entirely from a local folder without internet connectivity.

## Features

- **Offline-First**: Works in airplane mode - zero cloud dependencies
- **Interactive Mapping**: Pan, zoom, and explore Western Australia with vector tiles
- **Asset Visualization**: View utility infrastructure (substations, depots, yards) with status indicators
- **Asset Details**: Click markers to see detailed information about each asset
- **Portable**: Single folder distribution - copy to USB stick or new machine and run

## System Requirements

- **Node.js**: Version 18+ (for http-server)
- **Python**: Version 3.11+ (optional, for data scripts and API)
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Disk Space**: ~150MB for complete demo with data
- **Memory**: ~500MB RAM during operation

## Quick Start

### Option 1: Simple Launch (Unix/macOS/Linux)

```bash
chmod +x run.sh
./run.sh
```

### Option 2: Simple Launch (Windows)

```powershell
.\run.ps1
```

### Option 3: Manual Launch

```bash
# Install Node.js dependencies
npm install

# Start local web server
npm run serve

# Open browser to http://localhost:3000
```

The demo will automatically open in your default browser.

## Project Structure

```
demo-offline-gis/
├── index.html           # Main application entry point
├── assets/
│   └── region.pmtiles   # Vector tile basemap (Western Australia)
├── data/
│   ├── demo.duckdb      # Asset database (generated)
│   ├── assets.geojson   # Exported asset data
│   ├── assets.csv       # Sample asset data (source)
│   └── seed.sql         # Database schema
├── lib/
│   ├── maplibre-gl.js   # Vendored MapLibre GL JS
│   ├── maplibre-gl.css  # MapLibre styles
│   └── pmtiles.js       # Vendored PMTiles library
├── scripts/
│   ├── load-assets.py   # Load CSV into DuckDB
│   └── export-geojson.py # Export DuckDB to GeoJSON
├── api/                 # Optional FastAPI backend
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
├── package.json         # Node.js dependencies
├── environment.yml      # Python environment (conda)
├── run.sh               # Unix launch script
└── run.ps1              # Windows launch script
```

## Testing Offline Operation

1. **Enable Airplane Mode** on your device
2. Run the demo: `./run.sh` or `.\run.ps1`
3. Open browser DevTools → Network tab
4. Verify **zero external requests** are made
5. Confirm map loads, assets display, and interactions work

## Data Management

### Regenerating Asset Data

```bash
# Activate Python environment (if using conda)
conda env create -f environment.yml
conda activate gis-demo

# Load sample data into DuckDB
python scripts/load-assets.py

# Export to GeoJSON for frontend
python scripts/export-geojson.py
```

### Customizing Assets

Edit `data/assets.csv` with your custom asset data:
- **Required fields**: id, name, type, status, lat, lon
- **Optional fields**: description, last_inspection, capacity, region
- **Status values**: OK, Watch, Alert, Critical
- **Type values**: Substation, Depot, Yard, Tower, Switchyard

Then regenerate: `python scripts/load-assets.py && python scripts/export-geojson.py`

## Performance Targets

- **Startup Time**: <5 seconds from launch to visible map
- **Interaction Response**: <100ms for pan/zoom/click
- **Asset Load Time**: <2 seconds for all markers
- **Memory Footprint**: <500MB total
- **Data Bundle Size**: <100MB (excluding optional large datasets)

## Troubleshooting

### Map doesn't load
- **Check**: Does `assets/region.pmtiles` exist?
- **Solution**: Download or generate PMTiles file for Western Australia

### No asset markers appear
- **Check**: Does `data/assets.geojson` exist?
- **Solution**: Run `python scripts/export-geojson.py`

### "Address already in use" error
- **Check**: Is another service using port 3000?
- **Solution**: Stop other services or change port in `package.json` scripts

### Browser shows CORS errors
- **Check**: Are you opening index.html directly (file://)?
- **Solution**: Must use http-server: `npm run serve`

### Python scripts fail
- **Check**: Is conda environment activated?
- **Solution**: Run `conda activate gis-demo` first

## Sales Demo Talking Points

1. **"This runs fully offline"** - Demonstrate by enabling airplane mode
2. **"Production formats"** - Same DuckDB/Parquet and PMTiles used in production systems
3. **"Zero throwaway work"** - Demo infrastructure becomes production foundation
4. **"Portable deployment"** - Copy folder to USB, runs anywhere without setup
5. **"Consistent performance"** - No network latency, no authentication delays

## Constitution Compliance

This demo system adheres to the project constitution:

- ✅ **Offline-First**: No network calls during execution
- ✅ **Production Format Parity**: DuckDB/GeoParquet + PMTiles
- ✅ **Single-Folder Portability**: Self-contained directory
- ✅ **Absolute Repeatability**: Fixed seed data, deterministic queries
- ✅ **Minimal Dependencies**: Only MapLibre GL, PMTiles, DuckDB

## License

MIT License - Free for demonstration and commercial use

## Support

For issues or questions, contact FBAI/VibeGIS team.
