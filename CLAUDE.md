# CLAUDE.md - Spatial.Properties Monorepo

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **monorepo** containing all Spatial.Properties projects - a pack-first geospatial platform delivering curated spatial packs for site selection and corridor planning.

**Owner:** Future Bridge AI (craig@futurebridgeai.com.au)

## Repository Structure

```
spatial.properties/
├── .specify/                   # Speckit workflow infrastructure (shared)
│   ├── templates/              # Spec, plan, tasks templates
│   ├── scripts/powershell/     # Workflow automation scripts
│   └── memory/                 # Shared project memory
├── .claude/commands/           # Slash commands (speckit.*.md)
├── Docs/                       # Core architecture and planning documentation
│   ├── architecture/           # Technical architecture docs
│   ├── planning/               # Planning and strategy
│   ├── research/               # Research materials
│   └── Updates/                # Current updates and new specs
├── spec/                       # Feature specifications
│   ├── constitution.md         # Core operating principles
│   └── features/               # Feature specs
├── adr/                        # Architecture Decision Records
│
├── website/                    # Marketing website (Next.js 14)
│   └── See website/CLAUDE.md
│
├── demo/                       # Offline GIS demo system
│   └── See demo/CLAUDE.md
│
├── cng-stack/                  # Speckit workflow framework
│   └── See cng-stack/CLAUDE.md
│
└── mockup/                     # Template/mockup workspace
```

## Speckit Workflow

This repository uses the unified **Speckit** specification-first workflow. All slash commands are available from the root:

### Feature Development Lifecycle

1. **`/speckit.specify [feature description]`** - Create feature specification
2. **`/speckit.clarify`** - Refine underspecified areas (optional)
3. **`/speckit.plan`** - Generate implementation plan
4. **`/speckit.tasks`** - Generate actionable task breakdown
5. **`/speckit.implement`** - Execute the implementation

### Supporting Commands

- **`/speckit.constitution`** - Define/update project coding standards
- **`/speckit.checklist`** - Generate custom quality checklist
- **`/speckit.analyze`** - Cross-artifact consistency check
- **`/speckit.taskstoissues`** - Convert tasks to GitHub issues

## Project-Specific Guidance

Each subdirectory has its own CLAUDE.md with project-specific instructions:

| Directory | Purpose | Tech Stack |
|-----------|---------|------------|
| `website/` | Marketing website | Next.js 14, TypeScript, Tailwind |
| `demo/` | Offline GIS demo | DuckDB, MapLibre GL, PMTiles |
| `cng-stack/` | Speckit framework | Specification templates |
| `mockup/` | Design prototypes | N/A |

## Key Concepts

Spatial.Properties inverts traditional GIS thinking:

1. **Spatial Packs** - Versioned bundles of spatial assets + manifest (`spatialpack.json`)
2. **Immutability** - Every version publishes to a new path. No silent overwrites.
3. **Governance Gates** - License/provenance validation enforced before publish
4. **CSP-1** - H3/S2-scoped context packets for agents and edge clients
5. **Deterministic Tools** - Operations accept URIs, produce publishable layers

## Constitution

The project follows strict principles defined in `spec/constitution.md`:

- **Offline-First** (for demo) - Zero network dependencies
- **Production Format Parity** - Real formats (DuckDB, PMTiles, Parquet)
- **Single-Folder Portability** - USB-stick deployable
- **Absolute Repeatability** - Fixed seed data, deterministic queries

## Build Commands by Project

### Website
```bash
cd website
npm install && npm run dev      # Development
npm run build                   # Production build
npm run type-check              # Type checking
```

### Demo
```bash
cd demo/demo-offline-gis
npm install && npm run serve    # Start demo server
# Or use run.ps1 / run.sh
```

## Important Conventions

- Specifications focus on **WHAT** and **WHY**, not implementation
- Each user story must be independently testable (P1, P2, P3 priorities)
- Tasks must include exact file paths
- Constitution violations are automatically CRITICAL severity
- All clarification questions limited to maximum 3 per session

## Documentation

Core documentation is in `Docs/`:
- `architecture/` - Technical architecture (data model, services, APIs)
- `planning/` - Implementation plans, budgets, brand
- `research/` - Market research, competitive analysis, benchmarks
- `Updates/` - Current work in progress
