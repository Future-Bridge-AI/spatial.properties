1) Open data you can lean on (WA + national)

Core, open & stable

Bush Fire Prone Areas (OBRM-001 / 021) — official WA bushfire-prone polygons, multiple formats incl. GeoJSON/WFS. 
catalogue.data.wa.gov.au
+1

ABS ASGS digital boundaries (Ed.3 2021–26) — LGAs/SA2/SA1 etc., in GeoPackage (CC BY 4.0). 
Australian Bureau of Statistics
+1

DBCA Fire History (DBCA-060) — prescribed burns & bushfires on DBCA-managed lands; GeoJSON + FGDB downloads. 
catalogue.data.wa.gov.au

Overture Maps (buildings, roads, land use, etc.; Parquet) — global open map data; documented S3 access and parquet structure. 
Overture Maps Foundation
+1

Useful but with caveats (reference/external)

Fire Danger Ratings (FDR) / Fire Behaviour Index (FBI) 4-day via Esri Living Atlas/BOM feeds—great for reference/live overlays, but check licensing for redistribution. 
esriaustraliahub.com.au
+1

DFES Total Fire Ban Areas — marked restricted (approval required). Treat as an external link, not redistributed. 
catalogue.data.wa.gov.au

BOM historical FFDI maps — climatology (1950–2016), good for background context, not daily ops. 
Bureau of Meteorology

This mix lets you publish a fully open base pack now (prone areas + admin + fire history + Overture features), while linking to dynamic FDR/TFB feeds in metadata.

2) Pack scope (v0.1): “WA Bushfire Ops Context Pack”

Layers (assets)

bushfire_prone_areas (polygons) — OBRM; open.

admin_boundaries (polygons) — ABS LGA/SA2/SA1.

fire_history (polygons/lines/points) — DBCA; open.

buildings (polygons) — Overture Buildings subset clipped to WA.

roads (lines) — Overture Transportation subset clipped to WA.

live_refs (no redistribution) — STAC links to FDR/FBI & (optionally) DFES TFB.

Geometry CRS policy

Store analytics in EPSG:4326 GeoParquet (GeoParquet spec).

Tile derivatives (PMTiles/MVT) in EPSG:3857.

Partitioning

Overture layers: region=WA/year=2025/feature=buildings|roads.

Fire history: year=YYYY and optional source=DBCA.

3) STAC Collection (minimal, shippable)
{
  "stac_version": "1.0.0",
  "type": "Collection",
  "id": "wa-bushfire-ops-context-v0.1",
  "title": "WA Bushfire Operational Context Pack (v0.1)",
  "description": "Open, AI-ready spatial context for bushfire ops in WA: bushfire-prone areas, admin boundaries, fire history, Overture buildings/roads, with prediction-ready schemas.",
  "license": "CC-BY-4.0",
  "extent": {
    "spatial": { "bbox": [[112.9211, -35.1340, 129.001, -13.6895]] },
    "temporal": { "interval": [["2010-01-01T00:00:00Z", null]] }
  },
  "links": [
    {
      "rel": "source",
      "href": "https://catalogue.data.wa.gov.au/dataset",
      "title": "Data WA catalogue"
    },
    {
      "rel": "source",
      "href": "https://overturemaps.org/",
      "title": "Overture Maps"
    },
    {
      "rel": "via",
      "href": "https://www.esriaustraliahub.com.au/datasets/fire-danger-ratings-4-day-forecast",
      "title": "FDR/FBI 4-day (reference feed)"
    }
  ],
  "keywords": ["bushfire", "WA", "FDR", "DBCA", "Overture", "GeoParquet"],
  "summaries": {
    "gsd": [0.0],
    "providers": ["OBRM/Landgate", "ABS", "DBCA", "Overture Maps"]
  },
  "assets": {
    "bushfire_prone_areas": {
      "href": "s3://spatial.properties/packs/wa-bushfire-ops-context-v0.1/data/bushfire_prone_areas/part-*.parquet",
      "type": "application/x-parquet",
      "roles": ["data"],
      "title": "Bushfire-prone areas (OBRM)",
      "table:storage_options": {"layout": "partitioned"}
    },
    "admin_boundaries": {
      "href": "s3://spatial.properties/packs/wa-bushfire-ops-context-v0.1/data/admin_boundaries/part-*.parquet",
      "type": "application/x-parquet",
      "roles": ["data"],
      "title": "ABS ASGS boundaries (LGA, SA2, SA1)"
    },
    "fire_history": {
      "href": "s3://spatial.properties/packs/wa-bushfire-ops-context-v0.1/data/fire_history/year=*/part-*.parquet",
      "type": "application/x-parquet",
      "roles": ["data"],
      "title": "DBCA Fire History"
    },
    "buildings": {
      "href": "s3://spatial.properties/packs/wa-bushfire-ops-context-v0.1/data/overture/buildings/region=WA/year=2025/*.parquet",
      "type": "application/x-parquet",
      "roles": ["data"],
      "title": "Overture Buildings (WA subset)"
    },
    "roads": {
      "href": "s3://spatial.properties/packs/wa-bushfire-ops-context-v0.1/data/overture/roads/region=WA/year=2025/*.parquet",
      "type": "application/x-parquet",
      "roles": ["data"],
      "title": "Overture Roads (WA subset)"
    },
    "tiles_preview": {
      "href": "https://cdn.spatial.properties/pmtiles/wa-bushfire-ops-v0.1.pmtiles",
      "type": "application/vnd.pmtiles",
      "roles": ["overview"]
    }
  }
}


Notes
• Keep licensing per-layer in Item‐level assets (Overture: ODbL/varies by theme; ABS: CC BY; OBRM/DBCA: see Data.WA record).
• If you can’t redistribute FDR/TFB, keep them as links with rel=via only.

4) GeoParquet schemas (pragmatic v0.1)
4.1 bushfire_prone_areas.parquet (polygons)
field	type	notes
geom	GEOMETRY(POLYGON, 4326)	GeoParquet WKB
obrm_id	string	source unique id
version_date	date	official version date
source	string	“OBRM/Landgate”
qa_valid	boolean	geometry valid
etl_ts	timestamp	load time
4.2 admin_boundaries.parquet (polygons)
field	type	notes
geom	GEOMETRY(POLYGON, 4326)	
lga_code	string	ABS code
lga_name	string	
sa2_code21	string	
sa2_name21	string	
source	string	“ABS ASGS Ed.3”
etl_ts	timestamp	
4.3 fire_history.parquet (polygons/lines/points)
field	type	notes
geom	GEOMETRY(*, 4326)	keep mixed via unioned table or split by layer
event_id	string	DBCA id
event_type	string	enum: prescribed_burn,bushfire
start_dt	timestamp	
end_dt	timestamp	nullable
area_ha	double	nullable
source	string	“DBCA Fire History”
etl_ts	timestamp	
4.4 buildings.parquet (polygons) — Overture subset
field	type	notes
geom	GEOMETRY(POLYGON, 4326)	
overture_id	string	primary id
class	string	building class/use (from Overture)
height	double	meters; may be missing
levels	int	nullable
name	string	nullable
source	string	“Overture Buildings 2025-xx”
etl_ts	timestamp	
height_pred	double	predicted if missing
height_pred_conf	double	0..1
levels_pred	int	predicted
levels_pred_conf	double	0..1
pred_method	string	“rule
pred_model_ver	string	e.g., “ppg-bldg-0.1”
pred_ts	timestamp	
4.5 roads.parquet (lines) — Overture subset
field	type	notes
geom	GEOMETRY(LINESTRING, 4326)	
overture_id	string	
road_class	string	functional class
name	string	nullable
source	string	“Overture Transportation 2025-xx”
etl_ts	timestamp	
5) Encoding “unknown → predicted value + confidence”

Principles

Never overwrite source columns; add side-by-side *_pred + *_pred_conf fields.

Track method, model version, and timestamp for governance.

Keep provenance at pack + layer via STAC extensions.

STAC extension (lightweight, custom for now)
Add a small, namespaced object at Item or Collection level:

"extensions": [
  "https://spatial.properties/stac/ml-prediction/1.0"
],
"ml:prediction": {
  "predicted_fields": [
    {"name": "height", "method": "gradient-boosting", "version": "ppg-bldg-0.1"},
    {"name": "levels", "method": "rule+ml", "version": "ppg-bldg-0.1"}
  ],
  "confidence_range": [0.0, 1.0],
  "policy": {
    "publish_threshold": 0.6,
    "mark_low_confidence_null": true
  }
}


Operational pipeline (v0.1)

Rules & spatial joins: infer levels from height bins; enrich with bushfire_prone_areas (inside/outside), nearest road class, admin LGA.

Model pass (optional): train a simple regressor/classifier using Overture samples that do have height/levels; features include footprint area, perimeter, compactness, nearby road class, settlement density.

Write-back: only fill *_pred fields; leave original nulls untouched; set *_pred_conf.

QA: if *_pred_conf < 0.6 tag record with qa_flag='low_conf'.

This mirrors the data repairing pattern you’ve used elsewhere (rules → weak supervision → ML → HIL optional).

6) One STAC Item example (layer = buildings)
{
  "stac_version": "1.0.0",
  "type": "Feature",
  "id": "wa-overture-buildings-2025",
  "collection": "wa-bushfire-ops-context-v0.1",
  "bbox": [112.9211, -35.1340, 129.0010, -13.6895],
  "properties": {
    "datetime": "2025-07-01T00:00:00Z",
    "providers": ["Overture Maps"],
    "processing:level": "analytics-ready",
    "ml:prediction": {
      "predicted_fields": [
        {"name": "height", "method": "gbm", "version": "ppg-bldg-0.1"},
        {"name": "levels", "method": "rules+gbm", "version": "ppg-bldg-0.1"}
      ],
      "confidence_range": [0,1],
      "policy": {"publish_threshold": 0.6}
    }
  },
  "assets": {
    "data": {
      "href": "s3://spatial.properties/packs/wa-bushfire-ops-context-v0.1/data/overture/buildings/region=WA/year=2025/*.parquet",
      "type": "application/x-parquet",
      "roles": ["data"]
    },
    "preview": {
      "href": "https://cdn.spatial.properties/pmtiles/wa-bushfire-ops-buildings.pmtiles",
      "type": "application/vnd.pmtiles",
      "roles": ["overview"]
    }
  }
}

7) Minimal ingestion + serving playbook

Ingest

OBRM/DBCA/ABS: pull GeoPackage/GeoJSON → reproject to 4326 → write GeoParquet with WKB geometries and indexes on lga_code/year. 
catalogue.data.wa.gov.au
+2
catalogue.data.wa.gov.au
+2

Overture: follow docs to subset WA bbox → keep only needed columns → write partitioned GeoParquet. 
docs.overturemaps.org

Predict

Run feature engineering (area, perimeter, compactness, nearest road class; inside bushfire-prone).

Train quick GBM; write *_pred, *_pred_conf, pred_method, pred_model_ver.

Serve

/packs/wa-bushfire-ops-context-v0.1/stac → Collection JSON.

/packs/.../query?bbox=&where= → Arrow/GeoArrow (primary) and fallback GeoJSON.

/tiles/.../{z}/{x}/{y} via PMTiles for demo.

8) What’s deliberately not in v0.1 (to stay achievable)

No raster (satellite) layers; add later if you need fuels or canopy.

No redistribution of DFES TFB / live BOM feeds—reference only. 
catalogue.data.wa.gov.au
+1

Predictions limited to building height/levels first (tightest signals). Broaden later (e.g., roof material, vegetation class).