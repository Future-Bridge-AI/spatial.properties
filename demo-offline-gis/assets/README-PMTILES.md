# PMTiles File Required

This directory needs a PMTiles file named `region.pmtiles` containing vector tiles for Western Australia.

## Options to Obtain PMTiles

### Option 1: Download Pre-made PMTiles (Recommended)

Download a Western Australia region PMTiles file from:
- **Protomaps**: https://maps.protomaps.com/builds/
- **OpenMapTiles**: https://openmaptiles.org/downloads/planet/
- Search for "Western Australia PMTiles" or regional extracts

Place the downloaded file in this directory and rename to `region.pmtiles`.

### Option 2: Generate from OpenStreetMap Data

```bash
# Install tippecanoe (macOS)
brew install tippecanoe

# Install tippecanoe (Linux)
git clone https://github.com/felt/tippecanoe.git
cd tippecanoe
make -j
sudo make install

# Download OSM data for Western Australia
wget https://download.geofabrik.de/australia-oceania/australia-latest.osm.pbf

# Convert to PMTiles (this may take several minutes)
tippecanoe -o region.pmtiles \
  --force \
  --maximum-zoom=14 \
  --minimum-zoom=5 \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  australia-latest.osm.pbf
```

### Option 3: Use a Placeholder (For Testing Only)

For initial testing without a real basemap, you can use the demo with assets only.
The map will still work but won't show background geographic features.

## File Requirements

- **Format**: PMTiles (.pmtiles)
- **Projection**: Web Mercator (EPSG:3857)
- **Recommended Size**: <100MB for demo distribution
- **Coverage**: Western Australia region
- **Zoom Levels**: 5-14 recommended

## Verification

Once you have `region.pmtiles` in this directory:

1. Check file size: should be reasonable (<200MB)
2. Verify format: file extension should be `.pmtiles`
3. Test in demo: run `./run.sh` or `.\run.ps1`

The demo map should display Western Australia with roads, boundaries, and geographic features.
