# Tasks: Offline GIS Demo System

**Input**: Design documents from `/specs/001-offline-gis-demo/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-spec.yaml

**Tests**: Manual browser testing only - no automated tests requested in specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md Project Structure section:
- **Root**: `demo-offline-gis/` at repository root
- **Assets**: `assets/` for PMTiles
- **Data**: `data/` for DuckDB and GeoJSON
- **Libraries**: `lib/` for vendored JavaScript
- **Scripts**: `scripts/` for data loading utilities
- **API**: `api/` for optional FastAPI backend

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure: demo-offline-gis/ with subdirectories assets/, data/, lib/, scripts/, api/
- [X] T002 [P] Create package.json with http-server dependency for local serving
- [X] T003 [P] Create environment.yml with Python 3.11, DuckDB 0.9+, FastAPI 0.104+, uvicorn dependencies
- [X] T004 [P] Download and vendor MapLibre GL JS 4.x to lib/maplibre-gl.js and lib/maplibre-gl.css
- [X] T005 [P] Download and vendor pmtiles.js 3.x to lib/pmtiles.js
- [X] T006 [P] Create .gitignore for node_modules/, *.duckdb, *.pyc, __pycache__/, .DS_Store
- [X] T007 [P] Create README.md with quick start instructions and system requirements

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create DuckDB schema initialization script in data/seed.sql with assets table definition
- [X] T009 Create Python utility script scripts/load-assets.py to load CSV data into DuckDB with spatial extension
- [X] T010 [P] Create sample assets CSV file data/assets.csv with 50-100 representative WA utility assets (with id, name, type, status, lat, lon, description, last_inspection, capacity, region columns)
- [X] T011 Run load-assets.py to create data/demo.duckdb and populate with sample asset data
- [X] T012 [P] Create Python export script scripts/export-geojson.py to convert DuckDB assets to GeoJSON format
- [X] T013 Run export-geojson.py to create data/assets.geojson from DuckDB
- [X] T014 [P] Obtain or create Western Australia PMTiles file and save to assets/region.pmtiles (<100MB) - README created with instructions
- [X] T015 [P] Create run.sh Unix launch script with http-server startup and browser open commands
- [X] T016 [P] Create run.ps1 Windows launch script with http-server startup and browser open commands

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Interactive Map Display (Priority: P1) 🎯 MVP

**Goal**: Display an offline interactive map using locally-stored PMTiles vector tiles with pan/zoom controls

**Independent Test**: Launch application in airplane mode and verify map appears within 5 seconds with functional pan/zoom controls and no missing tiles

### Implementation for User Story 1

- [X] T017 [US1] Create index.html with basic HTML structure, head meta tags, and map container div
- [X] T018 [US1] Link vendored libraries in index.html: lib/maplibre-gl.css, lib/maplibre-gl.js, lib/pmtiles.js
- [X] T019 [US1] Initialize PMTiles protocol in JavaScript: create pmtiles.Protocol() and register with maplibregl.addProtocol("pmtiles", protocol.tile)
- [X] T020 [US1] Configure MapLibre GL map instance in index.html with basemap source pointing to pmtiles://./assets/region.pmtiles
- [X] T021 [US1] Define MapLibre style in index.html with vector tile layers (background, roads, water, boundaries) for PMTiles source
- [X] T022 [US1] Set initial map view to Western Australia region: center [115.86, -31.95], zoom level 6
- [X] T023 [US1] Add CSS styling in index.html for full-screen map display (html, body, #map height: 100%; margin: 0)
- [X] T024 [US1] Test map initialization: verify tiles load offline, pan/zoom work, no console errors, startup time <5 seconds

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - map displays offline with full interactivity

---

## Phase 4: User Story 2 - Asset Data Visualization (Priority: P2)

**Goal**: Display asset locations from local DuckDB as interactive markers overlaid on the map

**Independent Test**: Verify asset markers appear on map at correct coordinates, markers are visually distinct by status color, and all assets load within 2 seconds

### Implementation for User Story 2

- [X] T025 [US2] Add GeoJSON source to MapLibre map in index.html: type 'geojson', data './data/assets.geojson'
- [X] T026 [US2] Create assets circle layer in MapLibre style with source 'assets'
- [X] T027 [US2] Configure status-based color styling for assets layer using MapLibre expressions: OK=green (#10b981), Watch=yellow (#f59e0b), Alert=red (#ef4444), Critical=dark-red (#7f1d1d)
- [X] T028 [US2] Set circle radius to 8px and add white stroke (2px width) for visual clarity
- [X] T029 [US2] Add cursor pointer on hover for asset markers using map.on('mouseenter', 'assets', ...) and map.on('mouseleave', 'assets', ...)
- [X] T030 [US2] Test asset visualization: verify all assets appear at correct coordinates, colors match status, markers are clickable, load time <2 seconds
- [X] T031 [US2] Verify assets remain visible and correctly positioned at different zoom levels (zoom 5 to 14)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - map displays with asset markers color-coded by status

---

## Phase 5: User Story 3 - Asset Details Access (Priority: P3)

**Goal**: Enable clicking asset markers to view detailed information in a popup or side panel

**Independent Test**: Click an asset marker and verify detail panel appears showing name, status, location, and all available attributes within 1 second

### Implementation for User Story 3

- [X] T032 [US3] Create HTML structure in index.html for asset detail panel (fixed position div with id 'detail-panel')
- [X] T033 [US3] Add CSS styling in index.html for detail panel: positioned overlay, white background, shadow, padding, scrollable content, close button
- [X] T034 [US3] Implement JavaScript click event handler for assets layer using map.on('click', 'assets', ...) in index.html
- [X] T035 [US3] Extract asset properties from clicked feature (e.feature[0].properties) in click handler
- [X] T036 [US3] Create JavaScript function showDetailPanel(asset) to populate panel HTML with asset attributes (name, type, status, lat, lon, description, last_inspection, capacity, region)
- [X] T037 [US3] Format detail panel display with status-specific styling (color indicator matching marker color)
- [X] T038 [US3] Implement close button functionality to hide detail panel
- [X] T039 [US3] Add keyboard accessibility: ESC key to close panel, prevent map interactions when panel is open
- [X] T040 [US3] Handle multiple assets in close proximity: implement MapLibre queryRenderedFeatures with 5px tolerance to list multiple assets if clustered
- [X] T041 [US3] Test asset details: click various assets, verify all attributes display correctly, test close functionality, verify panel updates when clicking different asset
- [X] T042 [US3] Test edge cases: click asset with missing optional fields (description, capacity), verify graceful handling of null values

**Checkpoint**: All user stories should now be independently functional - complete offline GIS demo with map, markers, and interactive details

---

## Phase 6: Optional FastAPI Backend (Enhancement)

**Purpose**: Optional backend API for more complex querying (can be skipped if GeoJSON approach is sufficient)

**Note**: These tasks are optional enhancements. The demo is fully functional without them using pre-exported GeoJSON.

- [ ] T043 [P] Create api/main.py with FastAPI application initialization
- [ ] T044 [P] Create api/models.py with Asset Pydantic model matching data-model.md schema
- [ ] T045 [P] Create api/requirements.txt with fastapi, uvicorn, duckdb, pydantic dependencies
- [ ] T046 Implement DuckDB connection in api/main.py: connect to ../data/demo.duckdb in read-only mode
- [ ] T047 [P] Implement GET /assets endpoint in api/main.py with optional status, type, region query filters
- [ ] T048 [P] Implement GET /assets/{id} endpoint in api/main.py to return single asset by ID
- [ ] T049 [P] Implement GET /assets/geojson endpoint in api/main.py to return FeatureCollection format
- [ ] T050 [P] Implement GET /health endpoint in api/main.py with database connectivity check
- [ ] T051 Add CORS middleware to api/main.py to allow requests from localhost:3000
- [ ] T052 Add error handling in api/main.py for database errors, not found, invalid query parameters
- [ ] T053 [P] Update index.html to fetch from http://localhost:8000/assets/geojson instead of ./data/assets.geojson (conditional based on API availability)
- [ ] T054 Update run.sh to start FastAPI with uvicorn before http-server (if using API approach)
- [ ] T055 Update run.ps1 to start FastAPI with uvicorn before http-server (if using API approach)
- [ ] T056 Test API endpoints: verify all endpoints return correct data, test filtering, verify CORS works, confirm offline operation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T057 [P] Add loading indicator in index.html to show while map and assets are initializing
- [X] T058 [P] Implement error handling in index.html for missing PMTiles file (show user-friendly error message)
- [X] T059 [P] Implement error handling in index.html for missing or invalid assets.geojson (graceful degradation)
- [ ] T060 [P] Add asset type icons/symbols to distinguish Substation, Depot, Yard, Tower, Switchyard visually
- [ ] T061 [P] Implement MapLibre clustering for dense asset regions (optional performance optimization)
- [ ] T062 Test offline capability: enable airplane mode, verify all features work, check browser DevTools Network tab shows zero external requests
- [ ] T063 Test performance: measure startup time (<5s target), interaction response (<100ms), asset load time (<2s)
- [ ] T064 Test cross-platform: verify demo works on Windows (run.ps1), macOS/Linux (run.sh) without modification
- [ ] T065 Test portability: copy demo folder to different location/USB stick, verify runs without configuration changes
- [ ] T066 Test browser compatibility: verify works in Chrome, Firefox, Safari, Edge
- [ ] T067 [P] Update README.md with detailed usage instructions, troubleshooting guide, and performance validation steps
- [ ] T068 [P] Create demo walkthrough document for sales team with key talking points
- [ ] T069 Verify constitution compliance: offline-first (no network calls), production formats (DuckDB/PMTiles), single-folder portability, repeatability, minimal dependencies
- [ ] T070 Run quickstart.md validation: execute all scenarios from quickstart guide, verify expected results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T007) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion (T008-T016)
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion (T008-T016) - Can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion (needs assets layer to be clickable)
- **FastAPI Backend (Phase 6)**: Optional - depends on Foundational phase, can be added anytime
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (could theoretically show markers without basemap, but better after US1 for demo flow)
- **User Story 3 (P3)**: Depends on User Story 2 (needs asset markers to click) - Cannot start until US2 complete

### Within Each User Story

**User Story 1 Flow**:
1. T017-T018: HTML structure and library links (parallel)
2. T019: PMTiles protocol setup (after T018)
3. T020-T022: Map configuration (sequential)
4. T023: Styling (parallel with T020-T022)
5. T024: Testing (after all above)

**User Story 2 Flow**:
1. T025-T028: Layer setup and styling (sequential)
2. T029: Hover effects (parallel with T028)
3. T030-T031: Testing (after all above)

**User Story 3 Flow**:
1. T032-T033: UI structure and styling (parallel)
2. T034-T037: Event handling and display logic (sequential)
3. T038-T040: Enhanced functionality (parallel)
4. T041-T042: Testing (after all above)

### Parallel Opportunities

**Phase 1 Setup** - All tasks [P] can run in parallel:
- T002, T003, T004, T005, T006, T007 (different files, no dependencies)

**Phase 2 Foundational** - Some tasks can run in parallel:
- T008-T009: Database setup (sequential)
- T010: Sample data (parallel with T008-T009)
- T011: Load data (after T008-T010)
- T012: Export script (parallel with T008-T011)
- T013: Generate GeoJSON (after T011-T012)
- T014-T016: PMTiles and launch scripts (parallel with T008-T013)

**Phase 3-5 User Stories**:
- US1 and US2 can start in parallel after Foundational phase (different files)
- US3 must wait for US2 completion

**Phase 6 API** - All endpoints can be built in parallel:
- T043-T045: Setup (parallel)
- T046: Connection (after T043)
- T047-T050: Endpoints (parallel after T046)
- T051-T052: Middleware and errors (parallel with endpoints)

**Phase 7 Polish** - Most tasks can run in parallel:
- T057-T061: UI enhancements (parallel, different features)
- T062-T066: Testing tasks (parallel)
- T067-T068: Documentation (parallel)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together:
Task: "Create package.json with http-server dependency"
Task: "Create environment.yml with Python dependencies"
Task: "Download MapLibre GL JS to lib/"
Task: "Download pmtiles.js to lib/"
Task: "Create .gitignore"
Task: "Create README.md"
```

## Parallel Example: User Story 2

```bash
# After asset layer is created, these can run in parallel:
Task: "Configure status-based color styling for assets layer (T027)"
Task: "Add cursor pointer on hover for asset markers (T029)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T016) - CRITICAL
3. Complete Phase 3: User Story 1 (T017-T024)
4. **STOP and VALIDATE**: Test offline map display independently
5. Demo MVP: Interactive offline map viewer

### Incremental Delivery

1. **Foundation**: Setup + Foundational → Foundation ready (T001-T016)
2. **MVP Release**: Add User Story 1 → Test independently → Demo offline map (T017-T024)
3. **V1.1 Release**: Add User Story 2 → Test independently → Demo map with assets (T025-T031)
4. **V1.2 Release**: Add User Story 3 → Test independently → Demo full interactive system (T032-T042)
5. **V2.0 (Optional)**: Add FastAPI backend for advanced queries (T043-T056)
6. **Production Ready**: Complete Polish phase (T057-T070)

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T016)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T017-T024) - Map display
   - **Developer B**: User Story 2 (T025-T031) - Asset markers (can start immediately)
   - **Developer C**: Prepare API backend (T043-T052)
3. After US2 completes:
   - **Developer A or B**: User Story 3 (T032-T042) - Asset details
4. **All**: Polish phase in parallel (T057-T070)

---

## Notes

- [P] tasks = different files, no dependencies, safe to run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests requested - all testing is manual browser-based
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance checked throughout: offline-first, production formats, single-folder portability
- Target performance: <5s startup, <100ms interactions, <2s asset load, <500MB memory
- Optional FastAPI backend (Phase 6) can be skipped - GeoJSON approach is simpler and sufficient for demo
