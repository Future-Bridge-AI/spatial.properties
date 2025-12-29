An **an offline demo mode**—no cloud, no creds—using **DuckDB** (local analytics DB) and **PMTiles** (single‑file map tiles). Perfect for your FBAI/VibeGIS pitches and a safe sandbox on planes or in boardrooms.


---

# What this gives you

* **Instant, reliable demos**: everything runs from your laptop/USB stick.
* **Zero ops risk**: no VPNs, no flaky Wi‑Fi, no cloud spend.
* **Repeatable sandbox**: the exact same demo every time, easy to version.

---

# Minimal architecture

* **Data/analytics**: `duckdb` file(s) + `parquet/geoparquet` (optionally CSV/GeoJSON).
* **Maps**: `.pmtiles` bundles (vector tiles) served locally.
* **App shell**: a tiny web app (Node/Next.js, Python FastAPI, or a static page) that:

  * queries DuckDB via HTTP/CLI,
  * reads tiles via `pmtiles` + `maplibre-gl`,
  * renders clean demo dashboards/maps.

---

# Quickstart (10–15 min)

## 1) Prep a tiny dataset in DuckDB

```bash
pip install duckdb duckdb-engine pandas pyarrow
python - << 'PY'
import duckdb, pandas as pd
df = pd.DataFrame({
  "site_id":[1,2,3],
  "name":["Kwinana Depot","Esperance Substation","Broome Yard"],
  "lat":[-32.239, -33.859, -17.961],
  "lon":[115.773, 121.891, 122.237],
  "status":["OK","Watch","Alert"]
})
con = duckdb.connect("demo.duckdb")
con.execute("INSTALL spatial; LOAD spatial;")
con.execute("CREATE OR REPLACE TABLE assets AS SELECT * FROM df")
con.execute("""
CREATE OR REPLACE TABLE assets_geo AS
SELECT *, ST_Point(lon,lat) AS geom FROM assets
""")
print(con.execute("SELECT count(*) FROM assets").fetchall())
PY
```

## 2) Grab a sample PMTiles (or make one)

* Create from MBTiles/tiles: `tippecanoe` → `.mbtiles` → `pmtiles convert input.mbtiles output.pmtiles`
* Or download a small regional `.pmtiles` you can legally demo.

## 3) Tiny local server (Node + static)

```bash
npm init -y
npm install http-server
npx http-server .
```

Put in the project folder:

* `index.html` (MapLibre + pmtiles viewer)
* `assets/` (your `.pmtiles`)
* `demo.duckdb`

**index.html (minimal viewer):**

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Offline Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet"/>
  <script src="https://unpkg.com/pmtiles/dist/pmtiles.js"></script>
  <style>html,body,#map{height:100%;margin:0}</style>
</head>
<body>
<div id="map"></div>
<script>
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  const map = new maplibregl.Map({
    container: 'map',
    style: {
      version:8,
      sources:{
        vect:{ type:'vector', url:'pmtiles://assets/region.pmtiles'}
      },
      layers:[{ id:'fill', type:'fill', source:'vect', 'source-layer':'layer0', paint:{'fill-opacity':0.3}}]
    },
    center:[115.86,-31.95], zoom:5
  });
</script>
</body>
</html>
```

## 4) Query DuckDB on demand (two lightweight options)

* **CLI overlay** (fastest): run queries live in a terminal for “data proofs.”

  ```bash
  duckdb demo.duckdb "SELECT status, count(*) FROM assets GROUP BY 1"
  ```
* **Tiny API** (adds buttons to your demo):

  ```bash
  pip install fastapi uvicorn
  python - << 'PY'
  ```

from fastapi import FastAPI
from fastapi.responses import JSONResponse
import duckdb
con = duckdb.connect("demo.duckdb", read_only=True)
app = FastAPI()
@app.get("/kpis")
def kpis():
rows = con.execute("SELECT status, count(*) AS n FROM assets GROUP BY 1").fetchall()
return JSONResponse([{"status":s,"count":int(n)} for s,n in rows])
PY
uvicorn main:app --reload

```
Then fetch from `index.html` to draw KPIs.

---

# Packaging it for meetings
- **One folder**: `demo/` with `index.html`, `demo.duckdb`, `assets/region.pmtiles`, and `run.sh`/`run.ps1`.
- **No installs required** (optional): bundle a portable browser + `http-server` binary, or export a static “demo player” via Electron/Tauri.

---

# Sales storyline (you can re‑use)
1) “This runs **fully offline**—we control speed, cost, and privacy.”  
2) “Prod version swaps local files for cloud sources (S3/PMTiles CDN + DuckDB/Parquet on object store).”  
3) “Same formats we’d use in production (Parquet/GeoParquet, PMTiles), so there’s **zero throwaway work**.”

---

# Next steps I can do now
- Generate a **ready‑to‑demo folder** (HTML viewer + sample PMTiles + DuckDB file + run scripts).  
- Add a couple of **WA‑flavoured layers** (depots, feeders, risk bands) and 3–4 **one‑click KPIs** for your pitch.  
- Wrap with a **1‑pager** that explains “why offline first” for utility buyers.

Want me to spit out a zipped starter with the files and boilerplate?
```
