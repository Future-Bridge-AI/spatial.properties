#!/usr/bin/env python3
"""
Load asset data from CSV into DuckDB database with spatial extension.

Usage:
    python scripts/load-assets.py

This script:
1. Reads assets.csv from data/ directory
2. Validates data (coordinates, status, type)
3. Creates/recreates demo.duckdb database
4. Loads data with spatial geometry
"""

import os
import sys
import duckdb
import pandas as pd
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
CSV_FILE = DATA_DIR / "assets.csv"
DB_FILE = DATA_DIR / "demo.duckdb"
SEED_SQL = DATA_DIR / "seed.sql"

# Validation constants
VALID_STATUSES = {'OK', 'Watch', 'Alert', 'Critical'}
VALID_TYPES = {'Substation', 'Depot', 'Yard', 'Tower', 'Switchyard'}

def validate_assets(df):
    """Validate asset data before loading."""
    errors = []

    # Check required columns
    required_cols = ['id', 'name', 'type', 'status', 'lat', 'lon']
    missing_cols = set(required_cols) - set(df.columns)
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")
        return errors

    # Check for duplicate IDs
    duplicates = df[df.duplicated('id', keep=False)]
    if not duplicates.empty:
        errors.append(f"Duplicate IDs found: {duplicates['id'].tolist()}")

    # Validate coordinates
    invalid_lat = df[(df['lat'] < -90) | (df['lat'] > 90)]
    if not invalid_lat.empty:
        errors.append(f"Invalid latitudes (must be -90 to 90): {invalid_lat[['id', 'lat']].to_dict('records')}")

    invalid_lon = df[(df['lon'] < -180) | (df['lon'] > 180)]
    if not invalid_lon.empty:
        errors.append(f"Invalid longitudes (must be -180 to 180): {invalid_lon[['id', 'lon']].to_dict('records')}")

    # Validate status values
    invalid_status = df[~df['status'].isin(VALID_STATUSES)]
    if not invalid_status.empty:
        errors.append(f"Invalid status values: {invalid_status[['id', 'status']].to_dict('records')}")
        errors.append(f"Valid statuses are: {VALID_STATUSES}")

    # Validate type values
    invalid_type = df[~df['type'].isin(VALID_TYPES)]
    if not invalid_type.empty:
        errors.append(f"Invalid type values: {invalid_type[['id', 'type']].to_dict('records')}")
        errors.append(f"Valid types are: {VALID_TYPES}")

    return errors

def main():
    print("=" * 60)
    print("DuckDB Asset Data Loader")
    print("=" * 60)

    # Check CSV exists
    if not CSV_FILE.exists():
        print(f"ERROR: CSV file not found: {CSV_FILE}")
        print(f"Please create {CSV_FILE} with asset data")
        sys.exit(1)

    # Load CSV
    print(f"\n1. Loading CSV: {CSV_FILE}")
    try:
        df = pd.read_csv(CSV_FILE)
        print(f"   [OK] Loaded {len(df)} records")
    except Exception as e:
        print(f"   [ERROR] Failed to load CSV: {e}")
        sys.exit(1)

    # Validate data
    print("\n2. Validating data...")
    errors = validate_assets(df)
    if errors:
        print("   [ERROR] Validation failed:")
        for error in errors:
            print(f"     - {error}")
        sys.exit(1)
    print(f"   [OK] Validation passed")

    # Remove existing database
    if DB_FILE.exists():
        print(f"\n3. Removing existing database: {DB_FILE}")
        os.remove(DB_FILE)
    else:
        print(f"\n3. Creating new database: {DB_FILE}")

    # Connect to DuckDB
    print("\n4. Initializing DuckDB...")
    try:
        con = duckdb.connect(str(DB_FILE))

        # Run seed SQL
        if SEED_SQL.exists():
            print(f"   - Executing schema from: {SEED_SQL}")
            with open(SEED_SQL, 'r') as f:
                sql = f.read()
                con.execute(sql)
        else:
            # Fallback: inline schema
            print("   - Creating schema inline")
            con.execute("INSTALL spatial")
            con.execute("LOAD spatial")
            con.execute("""
                CREATE TABLE IF NOT EXISTS assets (
                    id INTEGER PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    lat DOUBLE NOT NULL,
                    lon DOUBLE NOT NULL,
                    description TEXT,
                    last_inspection DATE,
                    capacity VARCHAR(50),
                    region VARCHAR(100),
                    geom GEOMETRY
                )
            """)
        print("   [OK] Schema created")
    except Exception as e:
        print(f"   [ERROR] Failed to initialize database: {e}")
        sys.exit(1)

    # Insert data
    print("\n5. Inserting asset data...")
    try:
        # Insert records (explicitly list columns to exclude geom)
        con.execute("""
            INSERT INTO assets (id, name, type, status, lat, lon, description, last_inspection, capacity, region)
            SELECT id, name, type, status, lat, lon, description, last_inspection, capacity, region FROM df
        """)

        # Update geometry column
        con.execute("UPDATE assets SET geom = ST_Point(lon, lat)")

        row_count = con.execute("SELECT COUNT(*) FROM assets").fetchone()[0]
        print(f"   [OK] Inserted {row_count} records")
    except Exception as e:
        print(f"   [ERROR] Failed to insert data: {e}")
        sys.exit(1)

    # Verify data
    print("\n6. Verifying data...")
    try:
        # Count by status
        status_counts = con.execute("""
            SELECT status, COUNT(*) as count
            FROM assets
            GROUP BY status
            ORDER BY status
        """).fetchdf()
        print("   Status distribution:")
        for _, row in status_counts.iterrows():
            print(f"     - {row['status']}: {row['count']}")

        # Count by type
        type_counts = con.execute("""
            SELECT type, COUNT(*) as count
            FROM assets
            GROUP BY type
            ORDER BY count DESC
        """).fetchdf()
        print("   Type distribution:")
        for _, row in type_counts.iterrows():
            print(f"     - {row['type']}: {row['count']}")

        # Check geometry
        geom_count = con.execute("SELECT COUNT(*) FROM assets WHERE geom IS NOT NULL").fetchone()[0]
        print(f"   Geometry: {geom_count}/{row_count} records have valid geometry")

        if geom_count == row_count:
            print("   [OK] All records have geometry")
        else:
            print(f"   [WARNING] Warning: {row_count - geom_count} records missing geometry")
    except Exception as e:
        print(f"   [ERROR] Verification failed: {e}")

    # Close connection
    con.close()

    print("\n" + "=" * 60)
    print("[OK] Database created successfully!")
    print(f"Location: {DB_FILE}")
    print(f"Records: {row_count}")
    print("\nNext step: Run 'python scripts/export-geojson.py' to generate GeoJSON")
    print("=" * 60)

if __name__ == "__main__":
    main()
