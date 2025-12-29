#!/usr/bin/env python3
"""
Export asset data from DuckDB to GeoJSON format for frontend consumption.

Usage:
    python scripts/export-geojson.py

This script:
1. Connects to demo.duckdb database
2. Queries all assets
3. Converts to GeoJSON FeatureCollection
4. Writes to data/assets.geojson
"""

import json
import sys
import duckdb
from pathlib import Path
from datetime import date

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DB_FILE = DATA_DIR / "demo.duckdb"
GEOJSON_FILE = DATA_DIR / "assets.geojson"

def main():
    print("=" * 60)
    print("DuckDB to GeoJSON Exporter")
    print("=" * 60)

    # Check database exists
    if not DB_FILE.exists():
        print(f"ERROR: Database not found: {DB_FILE}")
        print("Please run 'python scripts/load-assets.py' first")
        sys.exit(1)

    # Connect to DuckDB
    print(f"\n1. Connecting to database: {DB_FILE}")
    try:
        con = duckdb.connect(str(DB_FILE), read_only=True)
        con.execute("LOAD spatial")
        print("   [OK] Connected")
    except Exception as e:
        print(f"   [ERROR] Failed to connect: {e}")
        sys.exit(1)

    # Query assets
    print("\n2. Querying assets...")
    try:
        assets_df = con.execute("""
            SELECT
                id, name, type, status, lat, lon,
                description, last_inspection, capacity, region
            FROM assets
            ORDER BY id
        """).fetchdf()
        print(f"   [OK] Retrieved {len(assets_df)} assets")
    except Exception as e:
        print(f"   [ERROR] Query failed: {e}")
        sys.exit(1)

    # Convert to GeoJSON
    print("\n3. Converting to GeoJSON...")
    try:
        features = []
        for _, row in assets_df.iterrows():
            # Convert date to string if not None
            last_inspection = None
            if pd.notna(row['last_inspection']):
                last_inspection = str(row['last_inspection'])

            feature = {
                "type": "Feature",
                "id": int(row['id']),
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row['lon']), float(row['lat'])]
                },
                "properties": {
                    "id": int(row['id']),
                    "name": str(row['name']),
                    "type": str(row['type']),
                    "status": str(row['status']),
                    "description": str(row['description']) if pd.notna(row['description']) else None,
                    "last_inspection": last_inspection,
                    "capacity": str(row['capacity']) if pd.notna(row['capacity']) else None,
                    "region": str(row['region']) if pd.notna(row['region']) else None
                }
            }
            features.append(feature)

        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        print(f"   [OK] Created FeatureCollection with {len(features)} features")
    except Exception as e:
        print(f"   [ERROR] Conversion failed: {e}")
        sys.exit(1)

    # Write GeoJSON
    print(f"\n4. Writing GeoJSON: {GEOJSON_FILE}")
    try:
        with open(GEOJSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)

        # Get file size
        file_size = GEOJSON_FILE.stat().st_size
        size_kb = file_size / 1024
        print(f"   [OK] Written {size_kb:.1f} KB")
    except Exception as e:
        print(f"   [ERROR] Failed to write file: {e}")
        sys.exit(1)

    # Verify GeoJSON
    print("\n5. Verifying GeoJSON...")
    try:
        with open(GEOJSON_FILE, 'r') as f:
            verify = json.load(f)

        assert verify['type'] == 'FeatureCollection', "Not a FeatureCollection"
        assert len(verify['features']) == len(features), "Feature count mismatch"

        # Check first feature structure
        if verify['features']:
            first = verify['features'][0]
            assert first['type'] == 'Feature', "Invalid feature type"
            assert 'geometry' in first, "Missing geometry"
            assert first['geometry']['type'] == 'Point', "Invalid geometry type"
            assert 'properties' in first, "Missing properties"
            print(f"   [OK] Valid GeoJSON structure")
            print(f"   Sample feature: {first['properties']['name']} ({first['properties']['type']})")
    except Exception as e:
        print(f"   [WARNING] Warning: Verification failed: {e}")

    # Close connection
    con.close()

    print("\n" + "=" * 60)
    print("[OK] GeoJSON export complete!")
    print(f"Location: {GEOJSON_FILE}")
    print(f"Features: {len(features)}")
    print("\nThe assets.geojson file can now be loaded by the frontend")
    print("=" * 60)

# Import pandas
import pandas as pd

if __name__ == "__main__":
    main()
