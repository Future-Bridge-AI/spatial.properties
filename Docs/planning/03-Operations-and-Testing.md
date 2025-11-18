# Spatial.Properties: Operations and Testing

## 9. SLOs, Capacity, Cost

### Service Level Objectives

#### Availability
- **Production:** 99.9% uptime
- **Calculation:** Monthly uptime percentage

#### Latency (p95)
- **First Visual Tile:** < 2s
- **Tile Hit:** < 500ms
- **STAC Search:** < 600ms

#### Durability
- **Object Storage:** ≥ 11 nines (99.999999999%)

#### Disaster Recovery
- **RPO (Recovery Point Objective):** ≤ 15 minutes
- **RTO (Recovery Time Objective):** ≤ 60 minutes

#### Edge/DTN SLOs

- **CSP-1 fetch (edge cache):** p95 < 800ms  
- **Delta apply (≤50MB):** p95 < 3s  
- **Mesh convergence (DTN):** ≤ 5 minutes for 95% of peers in pilot metro  
- **Replay detection to quarantine:** < 60s


### Cost Management

#### Optimization Targets
- **Cache Hit Rate:** ≥ 85%
- **Budget Alarms:** Weekly monitoring
- **Delta Strategy:** Prefer full rebuild if deltas exceed threshold

---

## 10. Observability & Operations

### Metrics

#### Key Performance Indicators
- Tile hit/miss ratio
- Build duration
- Delta size
- Tool execution latency
- Queue depth

#### Collection
- **Standards:** OpenTelemetry
- **Storage:** Prometheus
- **Visualization:** Grafana

### Distributed Tracing
- **Protocol:** OpenTelemetry
- **Flow:** API → Orchestrator → Workers
- **Backends:** Grafana/Tempo/Jaeger

### Logging
- **Format:** Structured JSON
- **Aggregation:** Loki

### Runbooks

Critical operational procedures:
1. **Cache Incident** - CDN cache miss troubleshooting
2. **Rollback** - Version rollback procedures
3. **License Violation** - Compliance remediation
4. **Slow Build QoS** - Performance optimization
5. **Quarantine** - Data isolation procedures
6. **Replay Detected:** quarantine peer → invalidate URL family → rotate device cert → notify security.  
8. **Beacon Spoofing Suspected:** disable venue beacons in region, raise WAF rules for short TTLs, request owner re-provision.  
9. **DTN Backlog Spike:** enable full refresh for hot cells; temporarily raise TTL; throttle low-priority exchanges.


#
**Edge Sync metrics:** peer counts, exchange success rate, time-to-convergence, DTN backlog depth.  
**Marketplace metrics:** listing views, conversion, license gate failures.  
**Security metrics:** replay detections, invalid attestation rate, device cert rotations.

---

## 11. Disaster Recovery & Backups

### Replication Strategy
- **Object Storage:** Cross-region replication
- **Pack Manifests:** Vaulted backups
- **Metadata:** Hourly snapshots

### DR Testing
- **Frequency:** Quarterly drills
- **Scope:** Full failover scenarios
- **Documentation:** Update runbooks after each drill

- Replicate **manifest and overlay indexes**.  
- Snapshot marketplace listings and rev-share reports.  
- Retain **beacon registry** with geo-scoped exports.

---

## 13. Testing Strategy

### Unit Testing
- **Scope:**
  - Validators
  - Transformers
  - Manifest builders
- **Coverage Target:** > 80%

### Integration Testing
- **End-to-End Scenarios:**
  - Complete pack build workflow
  - Delta application
  - CDN signed URL validation
- **Automation:** CI/CD pipeline

### Performance Testing
- **Metrics:**
  - Tile throughput
  - Pack build time vs dataset size
  - Concurrent user load
- **Tools:** Load testing frameworks

### Chaos Engineering
- **Scenarios:**
  - Origin throttling
  - Orchestrator restarts
  - Network partitions
- **Frequency:** Monthly in staging

### Security Testing
- **Focus Areas:**
  - Authorization bypass attempts
  - URL tampering
  - License policy enforcement
- **Tools:** SAST/DAST tools

### User Acceptance Testing (UAT)
- **Personas:**
  - Analyst workflows
  - Field agent operations
  - Offline delta synchronization
- **Cadence:** Pre-release validation

### DTN & Mesh
- **Partition tests:** 30/60/120 minute link outages; ensure graceful catchup.  
- **Replay tests:** duplicate packets with stale nonce → expect quarantine.  
- **Throughput tests:** LPWAN-sized envelopes (≤ 50 KB) for hints/claims.  

### Edge SDK
- **Delta-apply correctness** on PMTiles/Parquet; integrity before commit.  
- **Route-based prefetch** acceptance on ROS2 planner integration.  

### Marketplace
- **License contamination** simulations; provenance forks; delisting flows.  
- **Billing** statement reconciliation and alerting.



---

## 14. Rollout & Migration

### Deployment Strategy

#### Canary Releases
- **Initial:** Deploy to canary tenants
- **Validation:** Monitor metrics for 24-48 hours
- **Rollout:** Gradual expansion to all tenants

#### Dual Publishing
- **Strategy:** Publish both vN and vN+1 for one cycle
- **Purpose:** Zero-downtime migration
- **Duration:** One release cycle

#### Deprecation Policy
- **Notice Period:** 90 days
- **Communication:** Email + in-app notifications
- **Support:** Extended support during transition

#### Rollback Capability
- **Speed:** One-click rollback to prior version
- **Automation:** Automated rollback on critical failures
- **Testing:** Regular rollback drills

---

## 15. Risks & Mitigations

### Risk Register

#### Delta Size Spikes
- **Risk:** Delta exceeds threshold, causing performance issues
- **Mitigation:** Threshold-based decision to use full rebuild
- **Monitoring:** Alert on delta size ratio

#### License Contamination
- **Risk:** Incompatible licenses introduced into packs
- **Mitigation:**
  - Pre-merge license simulation
  - Red/green gate enforcement
  - Automated compatibility checks

#### Remote Cold Starts
- **Risk:** High latency on first access from new regions
- **Mitigation:**
  - Pre-warm top tiles in new regions
  - Region-aware caching configurations
  - Predictive cache population

#### Worker Drift
- **Risk:** Inconsistent tool versions across workers
- **Mitigation:**
  - Pinned container toolchains
  - Immutable worker images
  - Version validation on job start

#### P2P Replay/Poisoning
  Sign and nonce-bind; strict hash verification; quarantine lists.  
#### Venue Rules Drift
  SLA with venue owners; overlay expiries; alerts on stale overlays.  
#### Publisher Fraud
  KYC option; bond/escrow for high-risk listings; rapid delist API.







### Risk Review
- **Frequency:** Monthly risk assessment
- **Updates:** Quarterly mitigation strategy review
- **Escalation:** Critical risks to steering committee






---

## 10.1 Incident Management Policies


## 10.1 Incident Management Policies

**Severity Levels & Targets:**
- **SEV1 (Critical user impact, widespread):** Target acknowledge 5 min, mitigate 30 min, comms every 15 min.
- **SEV2 (Degraded service, partial impact):** Ack 15 min, mitigate 2 h, comms every 30 min.
- **SEV3 (Minor impact, workaround available):** Ack 1 h, mitigate 1 business day.
- **SEV4 (No user impact, internal):** Planned fix next sprint.

**Roles:** Incident Commander (IC), Ops Lead, Comms Lead, Subject Matter Experts.

**Runbooks:** Link all SEV runbooks under `/runbooks/*` in repo. Each runbook includes Preconditions, Diagnostic commands, Rollback steps, Post‑checks.

**Post‑Incident Review (PIR) Template:**
- Summary & timeline
- Contributing factors (5 whys)
- Customer impact & metrics
- What worked / didn't work
- Action items with owners and due dates
- Follow‑up verification plan

### 10.2 Change Management

- All production changes via PRs with mandatory code owners and CI.
- Risk‑scored deploys (low/med/high) gated by change windows.
- Canary + automated rollback (see §14 Rollout & Migration).
- Weekly change advisory sync summarizing production changes.

### 10.3 SLI Definitions

- **Availability:** Successful requests / total requests (5XX excluded if client aborts) over rolling monthly windows.
- **Latency:** p95 end‑to‑end per endpoint and p95 tile get (see §9 SLOs).
- **Freshness:** Mean and p95 time from source arrival to pack publish.
- **Cost Efficiency:** Cost/GB served and cache hit ratio.
- **Security:** # of policy denials vs attempts; # of open critical vulns.

### 10.4 On‑Call & Escalation

- Primary + secondary rotation weekly; handover notes required.
- Pager triggers from SLO alert rules; escalation to Staff/SRE and Security on policy violations.
- Executive comms for SEV1 within 30 minutes; customer update within 1 hour.

