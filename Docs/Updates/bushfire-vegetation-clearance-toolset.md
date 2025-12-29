# Bushfire Vegetation Clearance – Toolset

## Overview

This toolset defines the **deterministic and LLM-assisted operations** used to convert Spatial Packs into **compliance decisions, field actions, and audit narratives**.

All compliance decisions are traceable to rules and artifacts.

---

## Deterministic Tools (Auditable)

### 1. compute_required_clearance

**Inputs**

- Span geometry

- Conductor attributes

- Clearance rules pack

**Outputs**

- Required horizontal clearance

- Required vertical clearance

- Fire-risk modifiers applied

- Rule trace (rule ID + version)

---

### 2. assign_responsible_party

**Inputs**

- Asset location

- Parcel and verge boundaries

- Responsibility rules

**Outputs**

- Responsible party classification

- Legal basis reference

---

### 3. danger_zone_gate

**Inputs**

- Proposed task

- Voltage class

**Outputs**

- Safety classification

- Required controls / exclusions

---

### 4. environmental_gate

**Inputs**

- Task geometry

- Environmental overlays

**Outputs**

- Permit or exemption check required (yes/no)

---

### 5. risk_to_action

**Inputs**

- Risk flags

- Operational thresholds

**Outputs**

- Prioritised task list

- SLA recommendations

---

## LLM-Assisted Tools (Bounded)

### explain_flag

Produces a human-readable explanation:

- Why an asset is non-compliant

- Which rule triggered

- What action is required

---

### draft_notice

Generates formal notice text:

- Responsible party

- Asset reference

- Required action and deadline

---

### audit_narrative

Summarises:

- Risk identified

- Actions taken

- Evidence captured

Always cites artifact IDs.

---

## Design Principles

- Rules before language

- Deterministic first, LLM second

- No unbounded inference

- Every output traceable

---

## Non-Goals

- Autonomous enforcement

- Legal interpretation beyond encoded rules

