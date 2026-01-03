# WA Solar Feasibility Pack

**Pack ID:** `spatial.properties:wa:solar-feasibility:v1`
**Version:** 2025.01.03
**Status:** Manifest-ready (data pending)

Curated spatial layers for solar site screening and early feasibility assessment in Western Australia.

## Pack Promise

When loaded, this pack enables you to:
- **Rank candidate land** by solar resource + slope/aspect suitability
- **Filter fatal constraints** (bushfire prone areas, environmental proxies)
- **Estimate connection friction** (proximity to grid infrastructure)
- **Generate repeatable screening reports** with evidence trail

## Layers

### Raster Layers (COG format)

| Layer ID | Description | Status | Source |
|----------|-------------|--------|--------|
| `solar.exposure` | Solar irradiance proxy (GHI) | Pending | [NASA POWER](https://power.larc.nasa.gov/) |
| `terrain.dem` | Digital Elevation Model | Pending | [Geoscience Australia](https://ecat.ga.gov.au/geonetwork/srv/eng/catalog.search#/metadata/89644) |
| `terrain.slope` | Derived slope (%) | Pending | Derived from DEM |
| `terrain.aspect` | Derived aspect (degrees) | Pending | Derived from DEM |

### Vector Layers (GeoParquet + PMTiles)

| Layer ID | Description | Status | Source |
|----------|-------------|--------|--------|
| `hazard.bushfire_prone_area` | Bushfire prone areas | Pending | [WA DFES](https://catalogue.data.wa.gov.au/dataset/bushfire-prone-areas) |
| `soils.classification` | Soil types for grading | Pending | [CSIRO ASRIS](https://www.asris.csiro.au/) |
| `access.roads_reference` | Road network | Pending | [MRWA](https://catalogue.data.wa.gov.au/dataset/mrwa-road-network) |
| `grid.infrastructure_reference` | Substations/lines | Pending | [Western Power](https://westernpower.com.au/) |

### Link-out References (Not Redistributed)

| Reference | URL | Notes |
|-----------|-----|-------|
| Grid Capacity Signal | [Western Power Network Capacity Map](https://westernpower.com.au/our-energy-evolution/grid-transformation/network-capacity-mapping-tool/) | Signal only, not guarantee |
| Heritage Inquiry | [WA AHIS](https://www.dplh.wa.gov.au/ahis) | Required before development |

## Data Acquisition

### Priority 1 (User has access)
1. **DEM** → Download from Geoscience Australia, convert to COG
2. **Slope/Aspect** → Derive from DEM using GDAL
3. **Solar** → Download from NASA POWER, convert to COG
4. **Bushfire** → Download from WA data catalogue, convert to GeoParquet

### Priority 2 (Pending)
5. **Soils** → Download from ASRIS
6. **Roads** → Download from WA data catalogue
7. **Grid** → Link-out only in v0

## Usage

```bash
# Validate the pack
spatialpack validate packs/wa-solar-feasibility-pack/

# Once data is added, generate integrity hashes
spatialpack hash packs/wa-solar-feasibility-pack/ --output packs/wa-solar-feasibility-pack/integrity.json
```

## Disclaimer

This pack is for **SCREENING ONLY**. Not suitable for:
- Engineering design
- Final investment decisions
- Regulatory submissions

Grid capacity signals are **indicative only**, not connection guarantees.

## License

CC-BY-4.0 — See `contract.json` for full terms.

## Contact

- **Publisher:** Spatial.Properties (Future Bridge AI)
- **Email:** craig@futurebridgeai.com.au
