# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **spatial properties stack** project using the **speckit workflow system** - a specification-first development methodology implemented through Claude Code slash commands. The workflow guides feature development through structured phases: specification → planning → task generation → implementation.

## Development Workflow

This project uses the speckit specification-first workflow. Features are developed through these sequential phases:

1. **`/speckit.specify [feature description]`** - Create feature specification from natural language
2. **`/speckit.clarify`** - Identify and resolve ambiguities in the spec (optional but recommended)
3. **`/speckit.plan`** - Generate technical implementation plan
4. **`/speckit.tasks`** - Generate actionable task list from design artifacts
5. **`/speckit.analyze`** - Cross-artifact consistency analysis (read-only)
6. **`/speckit.implement`** - Execute the implementation plan

### Starting a New Feature

```bash
/speckit.specify Add user authentication with OAuth2 support
```

This creates a feature branch (`N-feature-name`) and initializes the spec file in `specs/N-feature-name/`.

## Architecture

### Directory Structure

- `.specify/` - Speckit workflow configuration
  - `memory/constitution.md` - Project principles and governance rules (non-negotiable constraints)
  - `templates/` - Templates for specs, plans, tasks, and checklists
  - `scripts/powershell/` - Setup and utility scripts for workflow automation

- `.claude/commands/` - Slash command definitions (speckit.*.md files)

- `specs/` - Feature specifications organized by branch name
  - `N-feature-name/spec.md` - Feature specification
  - `N-feature-name/plan.md` - Implementation plan
  - `N-feature-name/tasks.md` - Task breakdown
  - `N-feature-name/checklists/` - Quality validation checklists
  - `N-feature-name/contracts/` - API contracts (OpenAPI/GraphQL schemas)
  - `N-feature-name/data-model.md` - Entity definitions
  - `N-feature-name/research.md` - Technical decisions and rationale

### Key Concepts

- **User Stories** are prioritized (P1, P2, P3) and must be independently testable
- **Tasks** follow format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
  - `[P]` marker indicates parallelizable tasks
  - `[US1]`, `[US2]` labels map tasks to user stories
- **Constitution** (`.specify/memory/constitution.md`) defines non-negotiable principles

## Build/Test Commands

This repository is in early setup phase. Build and test commands will be determined by the tech stack chosen during `/speckit.plan`.

## Workflow Scripts

PowerShell scripts in `.specify/scripts/powershell/`:

```powershell
# Create new feature branch and initialize spec
.specify/scripts/powershell/create-new-feature.ps1 -Json "feature description"

# Setup implementation plan
.specify/scripts/powershell/setup-plan.ps1 -Json

# Check prerequisites before tasks/implementation
.specify/scripts/powershell/check-prerequisites.ps1 -Json

# Update agent context files
.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude
```

## Important Conventions

- Specifications focus on **WHAT** and **WHY**, never implementation details
- Each user story must be independently testable as a viable MVP increment
- Tasks must include exact file paths
- Constitution violations are automatically CRITICAL severity
- All clarification questions are limited to maximum 3 per session
