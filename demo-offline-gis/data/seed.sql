-- DuckDB Schema Initialization for Offline GIS Demo
-- Purpose: Create assets table with spatial support

-- Install and load spatial extension
INSTALL spatial;
LOAD spatial;

-- Create assets table
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
);

-- Add constraints via CHECK (DuckDB style)
-- Note: In production, these would be enforced; for demo, validation in load script

-- Validation rules (documented, enforced in load script):
-- - lat must be between -90 and 90
-- - lon must be between -180 and 180
-- - status must be one of: OK, Watch, Alert, Critical
-- - type must be one of: Substation, Depot, Yard, Tower, Switchyard
-- - geom is computed from lon/lat using ST_Point(lon, lat)
