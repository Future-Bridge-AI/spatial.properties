# Spatial.Properties — Latency, Reliability & Cost Playbook

## 1. Two-Lane Service Model

| Lane | Purpose | Typical Ops | p95 | p99 | Availability |
|------|----------|--------------|-----|-----|--------------|
| **A – Cache-Gated Lookups** | Hot path (read-heavy) | STAC metadata, tiles, GeoParquet slices, bbox filters | ≤150 ms | ≤300 ms | ≥99.95% |
| **B – Deep-Reasoning Calls** | Cold path (AI/graph ops) | UNM traversals, AI imputation, joins | ≤3 s | ≤8 s | ≥99.9% |

* **First-byte target:** < 50 ms when cached.  
* **Partial stream:** send preview within 300 ms for Lane B.

---

## 2. Streaming & Fallback Logic

1. **Stream partials:** coarse geometry or top-N preview while completing full result.  
2. **Deterministic fallbacks:**  
   - Pre-baked SQL joins for asset/workorder and feeder/customer.  
   - GEOS/CGAL local geometry ops.  
   - Pre-validated planner route IDs if full plan exceeds budget.  
3. **Incident toggle:** “Tool-only” mode → serve cached tiles, PMTiles, STAC, canned queries.

---

## 3. Observability & SLO Enforcement

- **Trace tags:** `lane=A|B`, `hit=cache|origin`, `fallback=yes|no`, `partial=yes|no`.  
- **Four golden signals:** latency, error rate, saturation, cost.  
- **SLO burn alerts:** only page on burn; log rest for tuning.  
- **Per-lane budgets:** ms + $ budgets tracked and exported.

---

## 4. Cost Control Patterns

### Pre-Gating Heuristics
- Validate **BBox / CRS / extent** before query.  
- Estimate **cardinality**; if > threshold → require refinement or sampled preview.  
- Use **cost hints** per dataset (geometry density, index state).

### Caching
- **Prompt keying:** hash(tool + params + viewport + timestamp bucket).  
- **Delta caching:** reuse overlapping tiles/slices on pan/zoom.  
- **Result distillation:** canonicalize repetitive responses to schema’d JSON + refs.

### Per-Tenant Budgets
- QPS + monthly $ cap + max concurrent deep calls.  
- Auto-degrade: Lane A only, lower precision geometry, smaller sample.  
- Kill-switch heavy tools on runaway cost.

### Stall Detection
- No byte / token in 300 ms → abort chain, emit cached preview, log trace.

---

## 5. Reference Architecture (Minimal Demo-Ready)

```
[Client/UI]
    ↓
[CDN + Edge Functions]  → tiles, PMTiles, STAC
    ↓
[Hot Path Store] – Object Store + Read-through Cache
    ↓
[Query Service] – DuckDB / ClickHouse / PostGIS
    ↓
[Reasoning Plane] – Tool-first agent (LLM + timeouts)
    ↓
[Observability Stack] – OpenTelemetry + Cost Exporter
```

---

## 6. Default SLO Values

| Category | Example | p95 | p99 | Notes |
|-----------|----------|-----|-----|-------|
| Tile / PMTiles / STAC | Cached | 150 ms | 300 ms | TTL 7-30 days |
| GeoParquet bbox ≤ 25 km | Slice | 250 ms | 400 ms | ≤ 50 k rows |
| UNM Topology Check | AI Reason | 3 s | 8 s | Stream partials 300 ms |
| Imputation / Join | AI Reason | 3 s | 8 s | Single retry only |

---

## 7. Rollout Checklist

- [ ] Publish Lane A/B SLOs on status page  
- [ ] Tag requests with lane + budget  
- [ ] Enable BBox/CRS validators  
- [ ] Activate prompt/result cache  
- [ ] Implement partials (preview + top-N)  
- [ ] Register fallback SQL/GEOS handlers  
- [ ] Configure tenant caps + degrade rules  
- [ ] Add SLO burn alerts + incident toggle  
- [ ] Weekly review: latency + cost reports

---

© 2025 Spatial.Properties — Internal Reliability and Cost Governance Playbook
