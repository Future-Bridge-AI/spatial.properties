# Data Model: Offline GIS Demo System

**Feature**: 001-offline-gis-demo
**Date**: 2025-10-27
**Purpose**: Define entity schemas and relationships for demo asset data

## Overview

The data model supports a GIS demonstration system showcasing utility infrastructure assets. The model is intentionally simple to maintain demo clarity while being representative of production schemas.

## Entities

### Asset

Represents a physical infrastructure element (substation, depot, yard, etc.) with geographic location and operational metadata.

**Table**: `assets`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, NOT NULL | Unique asset identifier |
| name | VARCHAR(255) | NOT NULL | Human-readable asset name (e.g., "Kwinana Depot") |
| type | VARCHAR(50) | NOT NULL | Asset classification (Substation, Depot, Yard, Tower) |
| status | VARCHAR(20) | NOT NULL | Operational status (OK, Watch, Alert, Critical) |
| lat | DOUBLE | NOT NULL | Latitude in WGS84 (EPSG:4326) |
| lon | DOUBLE | NOT NULL | Longitude in WGS84 (EPSG:4326) |
| geom | GEOMETRY | COMPUTED | Spatial point geometry: `ST_Point(lon, lat)` |
| description | TEXT | NULLABLE | Additional asset details for demo narrative |
| last_inspection | DATE | NULLABLE | Date of last inspection (fixed demo data) |
| capacity | VARCHAR(50) | NULLABLE | Asset capacity/rating (e.g., "500kV", "50 vehicles") |
| region | VARCHAR(100) | NULLABLE | Geographic region/district name |

**Indexes**:
- Primary key on `id`
- Spatial index on `geom` (if DuckDB supports, else query performance acceptable for demo scale)

**Validation Rules**:
- `lat` must be between -90 and 90
- `lon` must be between -180 and 180
- `status` must be one of: OK, Watch, Alert, Critical
- `type` must be one of: Substation, Depot, Yard, Tower, Switchyard
- `geom` is automatically computed from lon/lat

**Sample Record**:
```json
{
  "id": 1,
  "name": "Kwinana Depot",
  "type": "Depot",
  "status": "OK",
  "lat": -32.239,
  "lon": 115.773,
  "geom": "POINT(115.773 -32.239)",
  "description": "Main distribution depot for southern metro area",
  "last_inspection": "2024-11-15",
  "capacity": "50 vehicles",
  "region": "South Metropolitan"
}
```

## Relationships

**No relationships** - This is a single-entity model for demo simplicity. In production, assets might relate to:
- Maintenance schedules
- Work orders
- Equipment hierarchy
- Service areas

These are intentionally excluded from demo to maintain focus on GIS visualization.

## Data Characteristics

### Scale
- Demo dataset: 50-500 asset records
- Covers Western Australia utility infrastructure
- Representative distribution across asset types and statuses

### Geographic Coverage
- Bounding box: Western Australia (approx. -35.0 to -13.7 lat, 113.0 to 129.0 lon)
- Clusters in Perth metropolitan, Esperance, Broome regions
- Rural coverage for demonstration of sparse vs dense areas

### Status Distribution
Realistic distribution for demo narrative:
- OK: 70% (majority in good condition)
- Watch: 20% (requires monitoring)
- Alert: 8% (needs attention)
- Critical: 2% (immediate action required)

### Type Distribution
- Substation: 40%
- Depot: 25%
- Yard: 20%
- Switchyard: 10%
- Tower: 5%

## DuckDB Schema Definition

```sql
-- Create assets table
CREATE TABLE assets (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    lat DOUBLE NOT NULL,
    lon DOUBLE NOT NULL,
    description TEXT,
    last_inspection DATE,
    capacity VARCHAR(50),
    region VARCHAR(100)
);

-- Add spatial extension and geometry column
INSTALL spatial;
LOAD spatial;

ALTER TABLE assets ADD COLUMN geom GEOMETRY;

-- Populate geometry from coordinates
UPDATE assets
SET geom = ST_Point(lon, lat);

-- Validation constraints (via application logic, not DuckDB constraints)
-- - Check lat between -90 and 90
-- - Check lon between -180 and 180
-- - Check status IN ('OK', 'Watch', 'Alert', 'Critical')
-- - Check type IN ('Substation', 'Depot', 'Yard', 'Tower', 'Switchyard')
```

## GeoJSON Export Format

For frontend consumption (if not using FastAPI):

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "geometry": {
        "type": "Point",
        "coordinates": [115.773, -32.239]
      },
      "properties": {
        "id": 1,
        "name": "Kwinana Depot",
        "type": "Depot",
        "status": "OK",
        "description": "Main distribution depot for southern metro area",
        "last_inspection": "2024-11-15",
        "capacity": "50 vehicles",
        "region": "South Metropolitan"
      }
    }
  ]
}
```

**Export Query**:
```sql
-- DuckDB spatial extension supports ST_AsGeoJSON
SELECT ST_AsGeoJSON(
  json_object(
    'type', 'FeatureCollection',
    'features', list(
      json_object(
        'type', 'Feature',
        'id', id,
        'geometry', ST_AsGeoJSON(geom),
        'properties', json_object(
          'id', id,
          'name', name,
          'type', type,
          'status', status,
          'description', description,
          'last_inspection', last_inspection,
          'capacity', capacity,
          'region', region
        )
      )
    )
  )
) FROM assets;
```

Simplified Python export:
```python
import duckdb
import json

con = duckdb.connect('data/demo.duckdb', read_only=True)
con.execute("LOAD spatial")

# Query assets
assets = con.execute("""
    SELECT
        id, name, type, status, lat, lon,
        description, last_inspection, capacity, region
    FROM assets
""").fetchdf()

# Convert to GeoJSON
geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "id": row['id'],
            "geometry": {
                "type": "Point",
                "coordinates": [row['lon'], row['lat']]
            },
            "properties": {
                "id": row['id'],
                "name": row['name'],
                "type": row['type'],
                "status": row['status'],
                "description": row['description'],
                "last_inspection": str(row['last_inspection']) if row['last_inspection'] else None,
                "capacity": row['capacity'],
                "region": row['region']
            }
        }
        for _, row in assets.iterrows()
    ]
}

with open('data/assets.geojson', 'w') as f:
    json.dump(geojson, f)
```

## State Transitions

While assets have a `status` field, state transitions are NOT implemented in the demo (read-only demonstration). In production, status might transition as:

```
OK → Watch → Alert → Critical
        ↓       ↓       ↓
       OK      OK      OK (after remediation)
```

Demo uses fixed statuses from seed data.

## Seed Data Strategy

**Source**: CSV file with representative Western Australia utility assets

**Sample CSV**:
```csv
id,name,type,status,lat,lon,description,last_inspection,capacity,region
1,Kwinana Depot,Depot,OK,-32.239,115.773,Main distribution depot,2024-11-15,50 vehicles,South Metropolitan
2,Esperance Substation,Substation,Watch,-33.859,121.891,Coastal transmission,2024-10-20,500kV,Goldfields-Esperance
3,Broome Yard,Yard,Alert,-17.961,122.237,Remote storage facility,2024-09-05,100 poles,Kimberley
```

**Loading Process**:
1. Create CSV with 50-500 records
2. Run `scripts/load-assets.py`
3. Verify data: `SELECT count(*), status FROM assets GROUP BY status`
4. Export to GeoJSON: `python scripts/export-geojson.py`

## Query Patterns

### Get All Assets
```sql
SELECT id, name, type, status, lat, lon FROM assets;
```

### Filter by Status
```sql
SELECT id, name, lat, lon FROM assets WHERE status = 'Alert';
```

### Spatial Bounding Box Query
```sql
SELECT id, name, lat, lon
FROM assets
WHERE lat BETWEEN -35 AND -30
  AND lon BETWEEN 115 AND 120;
```

### Assets by Type
```sql
SELECT type, count(*) as count
FROM assets
GROUP BY type
ORDER BY count DESC;
```

## MapLibre GL Integration

**GeoJSON Source**:
```javascript
map.addSource('assets', {
  type: 'geojson',
  data: './data/assets.geojson'
});
```

**Layer Styling** (color by status):
```javascript
map.addLayer({
  id: 'assets',
  type: 'circle',
  source: 'assets',
  paint: {
    'circle-radius': 8,
    'circle-color': [
      'match',
      ['get', 'status'],
      'OK', '#10b981',      // Green
      'Watch', '#f59e0b',   // Yellow
      'Alert', '#ef4444',   // Red
      'Critical', '#7f1d1d', // Dark red
      '#6b7280'             // Gray default
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
});
```

## Validation and Data Quality

**Required Checks** (in load script):
- No duplicate IDs
- All coordinates within valid ranges
- No NULL values in required fields
- Status values match allowed list
- Type values match allowed list
- Dates in past (last_inspection <= today)

**Quality Metrics**:
- 100% of records have valid coordinates
- Geographic distribution across WA
- Realistic status distribution
- Representative type mix
