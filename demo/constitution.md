<!--
SYNC IMPACT REPORT
==================
Version Change: [NEW] → 1.0.0 (Initial ratification)
Created: 2025-10-27

Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (5 principles)
  - Deployment Requirements
  - Development Workflow
  - Governance

Templates Status:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - Success criteria alignment verified
  ✅ tasks-template.md - Task categorization compatible
  ✅ All command files reviewed - no agent-specific references found

Follow-up TODOs: None
-->

# Demo Spatial Properties Constitution

## Core Principles

### I. Offline-First Operation (NON-NEGOTIABLE)

The system MUST function completely without network connectivity or cloud services:

- Zero external API calls or cloud service dependencies during runtime
- No authentication credentials (cloud, OAuth, API keys) required to operate
- All data files (DuckDB, PMTiles, assets) MUST be bundled locally
- Network access only permitted for initial download of dependencies during
  development setup - never during demo execution
- External CDN resources (maplibre-gl, pmtiles.js) MUST be vendored or bundled
  for production demos

**Rationale**: Demos occur in unreliable network environments (planes,
boardrooms, remote sites). Network dependency = demo failure risk.

**Validation**: Every feature MUST be testable with network disabled
(airplane mode, firewall block).

### II. Production Format Parity

All demo data formats MUST match production system formats:

- Use DuckDB + Parquet/GeoParquet (never SQLite, CSV-only, or mock databases)
- Use PMTiles for vector tiles (never raster-only, image tiles, or proprietary
  formats)
- Database schemas MUST reflect real-world entity relationships
- Query patterns MUST demonstrate production-viable approaches

**Rationale**: Demo work becomes production foundation - zero throwaway
effort. Prospects see actual technology stack, not simplified mockups.

**Anti-pattern**: "Demo database" that differs from production architecture.

### III. Single-Folder Portability

The entire demo system MUST be distributable as one self-contained directory:

- All components in single root folder: `index.html`, `*.duckdb`,
  `assets/*.pmtiles`, run scripts
- Launch scripts MUST work with relative paths only (no hardcoded absolute
  paths)
- Dependencies vendored or documented in single requirements file
- Portable across Windows/Linux/macOS without modification
- USB stick or ZIP distribution ready

**Rationale**: Sales team needs trivial distribution method. Complex setup
= unused demo.

**Target**: Non-technical user can copy folder to new machine and run with
one command.

### IV. Absolute Repeatability

Every demo execution MUST produce identical results:

- Fixed seed data with known entity counts and relationships
- Deterministic queries returning consistent result sets
- Version-controlled data files alongside code
- No randomization or time-dependent behavior in core flows
- Demo scripts produce same output regardless of execution environment

**Rationale**: Consistent demos build confidence. Variations cause confusion
and support burden.

**Exception**: Date/time displays may show current time if explicitly
required, but data timestamps MUST be fixed.

### V. Minimal Dependency Surface

Reduce external dependencies to absolute minimum:

- Prefer standard library solutions over third-party packages
- When external library required, choose stable, widely-adopted options
  (DuckDB, MapLibre GL)
- Avoid framework lock-in - favor vanilla implementations where practical
- Document every dependency's purpose and offline availability
- Avoid build tools requiring network access during demo execution

**Rationale**: Each dependency = potential installation failure point.
Minimize demo setup friction.

**Test**: Fresh machine setup should complete in under 15 minutes with
clear error messages.

## Deployment Requirements

### Distribution Package Contents

Every demo package MUST include:

1. **Run Scripts**: `run.sh` (Unix) and `run.ps1` (Windows) with zero
   arguments required
2. **Data Files**: All `.duckdb` files and `assets/*.pmtiles` with known-good
   test data
3. **Application Files**: HTML/JS/CSS or compiled binaries ready to execute
4. **README**: Single-page quick start with system requirements and
   troubleshooting
5. **Dependency List**: Exact versions of any required runtime (Python, Node,
   etc.)

### Performance Targets

Demo system MUST meet these performance criteria on standard laptop hardware:

- Initial load time: <5 seconds from script execution to visible UI
- Map interaction: <100ms pan/zoom response time
- Query execution: <1 second for all dashboard KPIs
- Memory footprint: <500MB total process memory
- Data bundle size: <100MB for base demo (excluding large optional datasets)

**Rationale**: Sluggish demos undermine "production-ready" messaging.

## Development Workflow

### Feature Development Process

All features MUST follow the Specify workflow:

1. **Specification** (`/speckit.specify`): Technology-agnostic requirements,
   no implementation details
2. **Planning** (`/speckit.plan`): Choose technologies respecting
   constitution principles
3. **Task Breakdown** (`/speckit.tasks`): Generate dependency-ordered
   implementation tasks
4. **Implementation** (`/speckit.implement`): Execute tasks with constitution
   compliance checks

### Constitution Compliance Gates

**Planning Phase Gate**:
- Verify offline-first design (no cloud services)
- Confirm production format usage (DuckDB/PMTiles)
- Validate single-folder deployment feasibility

**Implementation Phase Gate**:
- Test with network disabled
- Verify portable paths (no absolute paths)
- Measure performance against targets
- Confirm dependency minimalism

### Violation Justification

If a feature requires violating a principle:

1. Document violation in plan.md Complexity Tracking section
2. Explain why principle cannot be satisfied
3. Propose mitigation strategy
4. Get explicit approval before implementation
5. Add technical debt item for future resolution

## Governance

### Amendment Process

Constitution changes require:

1. **Proposal**: Document proposed change with rationale and impact analysis
2. **Review**: Validate against existing features and templates
3. **Version Bump**: Follow semantic versioning (MAJOR.MINOR.PATCH)
4. **Propagation**: Update all dependent templates and documentation
5. **Commit**: Single atomic commit with all related changes

### Versioning Policy

- **MAJOR**: Principle removal or incompatible redefinition
- **MINOR**: New principle added or significant expansion
- **PATCH**: Clarifications, wording improvements, non-semantic changes

### Compliance Review

Every feature specification and plan MUST include:

- Constitution Check section validating principle compliance
- Justification for any deviations
- Performance target verification
- Deployment model confirmation

All pull requests MUST verify:

- No network calls in demo execution paths
- Production format usage (not mock data)
- Portable deployment structure maintained
- Performance targets met or exceeded

### Relation to Other Documentation

- **CLAUDE.md**: Runtime development guidance for AI assistants - references
  this constitution
- **README.md**: User-facing quick start - does not duplicate constitutional
  requirements
- **Specification templates**: Enforce constitution principles through
  structured validation

**Version**: 1.0.0 | **Ratified**: 2025-10-27 | **Last Amended**: 2025-10-27
