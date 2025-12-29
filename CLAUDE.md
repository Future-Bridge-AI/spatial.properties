# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **offline-first GIS demo system** for FBAI/VibeGIS pitches using DuckDB (local analytics) and PMTiles (single-file map tiles). The project is initialized with the **Specify workflow template** - a structured feature development system that separates specification, planning, and implementation phases.

**Core concept**: Everything runs locally (laptop/USB stick) with zero cloud dependencies - perfect for demos in boardrooms, planes, or areas with unreliable connectivity.

## Technology Stack

Based on the design document:

- **Data/Analytics**: DuckDB with Parquet/GeoParquet files
- **Mapping**: PMTiles (vector tiles) served locally with MapLibre GL
- **Application**: Web app (Node/Next.js, Python FastAPI, or static HTML)
- **Deployment**: Fully portable, single-folder distribution

## Specify Workflow Commands

This repository uses the Specify template system for structured feature development. The workflow separates "what" (specification) from "how" (planning/implementation).

### Feature Development Lifecycle

Execute these commands in order for each feature:

1. **`/speckit.specify [feature description]`** - Create feature specification
   - Generates user stories, requirements, success criteria
   - Creates feature branch: `###-feature-name`
   - Technology-agnostic (focuses on WHAT, not HOW)
   - Creates quality checklist and validates spec completeness
   - Asks clarifying questions if needed (max 3)

2. **`/speckit.clarify`** (optional) - Refine underspecified areas
   - Identifies gaps in the specification
   - Asks up to 5 targeted clarification questions
   - Updates spec with answers

3. **`/speckit.plan`** - Generate implementation plan
   - Converts spec into technical design
   - Creates research.md, data-model.md, contracts/, quickstart.md
   - Defines architecture and tech stack
   - Updates agent context for better code suggestions

4. **`/speckit.tasks`** - Generate actionable task breakdown
   - Creates dependency-ordered tasks.md
   - Organizes tasks by user story for independent implementation
   - Each user story can be built/tested/deployed independently
   - Marks parallel tasks with [P]

5. **`/speckit.implement`** - Execute the implementation
   - Checks checklist completion status (prompts if incomplete)
   - Executes tasks phase-by-phase from tasks.md
   - Follows TDD approach when tests are specified
   - Creates ignore files (.gitignore, .dockerignore, etc.) based on tech stack
   - Marks completed tasks with [X]

### Supporting Commands

- **`/speckit.constitution`** - Define/update project coding standards
- **`/speckit.checklist`** - Generate custom quality checklist for current feature
- **`/speckit.analyze`** - Cross-artifact consistency check (after task generation)

## Repository Structure

```
demo.spatial.properties/
├── .specify/                    # Specify workflow infrastructure
│   ├── scripts/powershell/     # Setup and context scripts
│   ├── templates/              # Spec, plan, tasks templates
│   └── memory/                 # Constitution and project memory
├── .claude/commands/           # Custom slash commands (speckit.*)
├── specs/                      # Feature branches create subdirs here
│   └── ###-feature-name/       # Each feature gets own directory
│       ├── spec.md            # What: user stories, requirements
│       ├── plan.md            # How: architecture, tech decisions
│       ├── tasks.md           # Actionable implementation steps
│       ├── research.md        # Technical research and decisions
│       ├── data-model.md      # Entities and relationships
│       ├── contracts/         # API specs, schemas
│       ├── checklists/        # Quality validation checklists
│       └── quickstart.md      # Integration scenarios
└── demo.spatial.properties - design.md  # Initial design concept
```

## Important Workflow Rules

### Specification Phase (/speckit.specify)

- **NO technology choices** - specifications are implementation-agnostic
- Focus on user value, business needs, and measurable outcomes
- Maximum 3 [NEEDS CLARIFICATION] markers - make informed guesses otherwise
- Success criteria must be measurable and technology-agnostic
- Each user story should be independently testable (P1, P2, P3 priorities)

### Planning Phase (/speckit.plan)

- **NOW you choose technologies** based on requirements
- Phase 0: Research - resolve all NEEDS CLARIFICATION markers
- Phase 1: Design - create data models, API contracts, quickstart guide
- Updates agent context to inform code suggestions

### Implementation Phase (/speckit.implement)

- **Check checklists first** - prompts if any incomplete items
- **Phase execution order**:
  1. Setup - project structure, dependencies, config
  2. Foundational - core infrastructure (BLOCKS all user stories)
  3. User Stories - implement by priority (P1 → P2 → P3)
  4. Polish - cross-cutting concerns
- **TDD when tests specified**: Write tests → Verify they fail → Implement
- **Auto-creates ignore files** based on detected tech stack
- **Respects task dependencies**: Sequential vs parallel [P] execution
- **Marks completed tasks** with [X] in tasks.md

### User Story Independence

Each user story MUST be:
- Independently implementable (one story = one MVP slice)
- Independently testable (verify story works on its own)
- Independently deployable (can ship just P1, then P1+P2, etc.)

## Key Principles

The project follows a strict constitution (`.specify/memory/constitution.md`) with these core principles:

1. **Offline-First Operation**: Zero network dependencies during demo execution - must work in airplane mode
2. **Production Format Parity**: Use actual production formats (DuckDB/Parquet/GeoParquet, PMTiles) - no throwaway mockups
3. **Single-Folder Portability**: Entire demo distributable as one self-contained directory (USB stick ready)
4. **Absolute Repeatability**: Fixed seed data, deterministic queries, version-controlled
5. **Minimal Dependency Surface**: Reduce external dependencies to absolute minimum

All features must pass constitution compliance gates during planning and implementation phases.

## Development Approach

### For New Features

Start with natural language description:
```
/speckit.specify Create an interactive map viewer that displays Western Australia utility assets with filtering by status
```

This initiates the full Specify workflow.

### For Quick Changes

If modifying existing code without going through Specify workflow:
- Follow patterns established in the codebase
- Update relevant specs/plans if behavior changes significantly
- Maintain offline-first principle

## Common Patterns

### DuckDB Queries
```python
import duckdb
con = duckdb.connect("demo.duckdb", read_only=True)
con.execute("INSTALL spatial; LOAD spatial;")
result = con.execute("SELECT * FROM assets_geo").fetchall()
```

### PMTiles Integration
```javascript
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
// Use pmtiles://assets/region.pmtiles as source URL
```

### Packaging for Demos
One folder with:
- HTML viewer (index.html)
- DuckDB files (*.duckdb)
- PMTiles bundles (assets/*.pmtiles)
- Run scripts (run.sh, run.ps1)

## Script Paths

All Specify scripts are in `.specify/scripts/powershell/`:
- `create-new-feature.ps1` - Branch and spec initialization
- `setup-plan.ps1` - Planning phase setup
- `update-agent-context.ps1` - Updates AI context files
- `check-prerequisites.ps1` - Validates workflow prerequisites

Note: These scripts are called by slash commands - you rarely invoke them directly.

## Demo Application Commands

The implemented demo lives in `demo-offline-gis/`:

### Running the Demo

**Windows**:
```powershell
cd demo-offline-gis
.\run.ps1
```

**Unix/macOS/Linux**:
```bash
cd demo-offline-gis
./run.sh
```

Both scripts:
1. Check Node.js/npm installation
2. Install dependencies if needed
3. Start http-server on port 3000
4. Open browser automatically

**Manual launch**:
```bash
cd demo-offline-gis
npm install              # First time only
npm run serve           # Auto-opens browser
npm start               # Start without opening browser
```

### Data Management

**Regenerate asset data**:
```bash
cd demo-offline-gis
conda activate gis-demo  # Or create: conda env create -f environment.yml
python scripts/load-assets.py      # CSV → DuckDB
python scripts/export-geojson.py   # DuckDB → GeoJSON
```

**Edit sample data**: Modify `demo-offline-gis/data/assets.csv`, then regenerate

## Project Architecture

### Implemented Demo Stack

The `demo-offline-gis/` directory contains a complete offline GIS demo:

**Frontend** (Single-page application):
- `index.html` - Complete app with inline CSS/JS (no build step)
- MapLibre GL JS 4.7.1 (vendored in `lib/`)
- PMTiles 3.0.7 protocol handler (vendored)
- Displays 80 Western Australia utility assets with interactive map

**Data Layer**:
- DuckDB 0.9+ with spatial extension (`data/demo.duckdb`)
- GeoJSON export for frontend consumption (`data/assets.geojson`)
- CSV seed data (`data/assets.csv`) - 80 WA utility locations
- PMTiles basemap (must be obtained separately - see `assets/README-PMTILES.md`)

**Key Design Decisions**:
1. Pre-exported GeoJSON (not FastAPI backend) for simplicity with <100 assets
2. Vendored libraries (no CDN) to ensure offline operation
3. Single HTML file with inline code (no build tools required)
4. Four-level status color coding (OK/Watch/Alert/Critical)
5. Side panel for asset details (better than popup for detailed info)

**File Structure**:
```
demo-offline-gis/
├── index.html              # Main SPA (complete application)
├── run.sh / run.ps1        # Launch scripts
├── package.json            # Node deps (http-server only)
├── environment.yml         # Python conda environment
├── data/
│   ├── demo.duckdb        # Generated from CSV
│   ├── assets.geojson     # Exported for frontend
│   ├── assets.csv         # Editable source data
│   └── seed.sql           # Database schema
├── lib/                   # Vendored JS libraries (offline)
├── assets/                # PMTiles files go here
├── scripts/               # Data pipeline scripts
└── api/                   # Optional FastAPI backend (Phase 6)
```

**Performance Characteristics**:
- Startup: ~2-3s
- Asset load: ~0.5s (80 assets, 39.8 KB GeoJSON)
- Memory: ~150MB
- Zero network requests after page load

### Specify Workflow Artifacts

Each feature creates a `specs/###-feature-name/` directory with:
- `spec.md` - User stories, requirements (technology-agnostic)
- `plan.md` - Architecture, tech choices, design decisions
- `tasks.md` - Dependency-ordered implementation tasks
- `research.md` - Technical research findings
- `data-model.md` - Entity relationships
- `contracts/` - API specifications, schemas
- `checklists/` - Quality validation

Example: `specs/001-offline-gis-demo/` contains the full specification and planning for the implemented demo.

## Windows Environment

This is a Windows repository (PowerShell scripts, Windows paths). When running bash commands:
- Use Git Bash or WSL
- PowerShell scripts should use `.ps1` extension
- Path separators may need adjustment for cross-platform tools
