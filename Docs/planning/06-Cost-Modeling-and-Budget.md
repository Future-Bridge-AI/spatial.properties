# Spatial.Properties: Cost Modeling & Budget

## Executive Summary

This document provides comprehensive cost modeling for the Spatial.Properties platform across different scales and deployment scenarios. All estimates are based on AWS pricing in **ap-southeast-2 (Sydney)** region as of October 2025.

### Quick Reference

| Environment | Monthly Cost | Annual Cost |
|-------------|--------------|-------------|
| **MVP (Dev/Staging)** | ~$680 | ~$8,160 |
| **Production (Small)** - 10TB | ~$5,862 | ~$70,344 |
| **Production (Medium)** - 100TB | ~$22,770 | ~$273,240 |
| **Production (Large)** - 1PB | ~$101,775 | ~$1,221,300 |

---

## 1. MVP Environment (Dev/Staging)

### Assumptions
- **Data Volume:** 1TB (500GB vector, 400GB raster, 100GB point cloud)
- **Active Users:** 10-20 internal users
- **API Requests:** ~50K/month
- **CDN Traffic:** 100GB egress/month
- **Build Frequency:** 2-3 packs/day
- **High Availability:** Single region, minimal redundancy

### Cost Breakdown

#### 1.1 Compute (EKS)

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **Control Plane** | EKS cluster | $0.10/hour | 730 hours | $73 |
| **Worker Nodes** | m6i.large (2 vCPU, 8GB) | $0.096/hour | 3 nodes × 730h | $210 |
| **Fargate (optional)** | Workers for build jobs | $0.04/vCPU-hour | 50 vCPU-hours | $2 |
| **EBS Volumes** | gp3 for node storage | $0.08/GB-month | 300GB | $24 |
| | | | **Subtotal** | **$309** |

#### 1.2 Storage

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **S3 Standard** | spatial-packs bucket | $0.023/GB | 1,000GB | $23 |
| **S3 Versioning** | 20% overhead | $0.023/GB | 200GB | $5 |
| **S3 Requests** | PUT/GET | $0.005/1K + $0.0004/1K | 500K PUT, 1M GET | $3 |
| **STAC Metadata** | spatial-stac bucket | $0.023/GB | 10GB | $0.23 |
| **Logs** | spatial-logs bucket | $0.023/GB | 50GB | $1.15 |
| | | | **Subtotal** | **$32** |

#### 1.3 Content Delivery (CDN)

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **CloudFront** | Distribution | $0.085/GB | 100GB egress | $8.50 |
| **CloudFront Requests** | HTTPS requests | $0.0100/10K | 50K requests | $0.05 |
| **OAC** | Origin Access Control | No charge | - | $0 |
| | | | **Subtotal** | **$8.55** |

#### 1.4 Database & Cache

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **RDS PostGIS** | db.t3.medium (2 vCPU, 4GB) | $0.068/hour | 730 hours | $50 |
| **RDS Storage** | gp3 | $0.138/GB | 100GB | $14 |
| **ElastiCache** | cache.t3.medium | $0.068/hour | 730 hours | $50 |
| | | | **Subtotal** | **$114** |

#### 1.5 Networking

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **NAT Gateway** | Single NAT | $0.059/hour | 730 hours | $43 |
| **Data Processing** | NAT data | $0.059/GB | 100GB | $6 |
| **VPC Endpoints** | S3, CloudWatch | $0.01/hour × 2 | 1,460 hours | $15 |
| | | | **Subtotal** | **$64** |

#### 1.6 Observability

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **CloudWatch Logs** | Ingestion + storage | $0.50/GB + $0.03/GB | 50GB ingestion | $26.50 |
| **Prometheus** | Storage (EBS) | $0.08/GB | 100GB | $8 |
| **Loki Storage** | S3 | $0.023/GB | 50GB | $1.15 |
| **Tempo Storage** | S3 | $0.023/GB | 20GB | $0.46 |
| | | | **Subtotal** | **$36** |

#### 1.7 Security & Compliance

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **KMS Keys** | 3 CMKs | $1/key/month | 3 | $3 |
| **KMS Requests** | Encrypt/decrypt | $0.03/10K | 100K requests | $0.30 |
| **Secrets Manager** | 10 secrets | $0.40/secret | 10 | $4 |
| **WAF (Basic)** | Web ACL + rules | $5/month + $1/rule | 5 rules | $10 |
| | | | **Subtotal** | **$17** |

#### 1.8 Additional Services

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **SQS/SNS** | Event bus backup | $0.40/M + $0.50/M | Minimal | $2 |
| **ECR** | Container registry | $0.10/GB | 20GB | $2 |
| **Route 53** | Hosted zone + queries | $0.50/zone + $0.40/M | 1 zone, 1M queries | $0.90 |
| **ACM** | TLS certificates | Free | - | $0 |
| | | | **Subtotal** | **$5** |

#### 1.9 Data Transfer

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **Inter-AZ** | EKS pod communication | $0.01/GB | 500GB | $5 |
| **S3 to CloudFront** | Origin traffic | Free | - | $0 |
| | | | **Subtotal** | **$5** |

### MVP Total Cost

| Category | Monthly Cost |
|----------|--------------|
| Compute | $309 |
| Storage | $32 |
| CDN | $9 |
| Database & Cache | $114 |
| Networking | $64 |
| Observability | $36 |
| Security | $17 |
| Additional Services | $5 |
| Data Transfer | $5 |
| **Buffer (15%)** | **$89** |
| **TOTAL** | **~$680/month** |

**Annual MVP Cost:** ~$8,160

---

## 2. Production Environment - Small (10TB)

### Assumptions
- **Data Volume:** 10TB (6TB vector, 3TB raster, 1TB point cloud)
- **Active Users:** 100-200 users
- **API Requests:** ~5M/month
- **CDN Traffic:** 5TB egress/month (50% cache hit rate)
- **Build Frequency:** 10-20 packs/day
- **High Availability:** Multi-AZ, cross-region DR

### Cost Breakdown

#### 2.1 Compute (EKS)

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **Control Plane** | EKS cluster | 1 | $73 |
| **Worker Nodes** | m6i.xlarge (4 vCPU, 16GB) | 6 nodes | $840 |
| **Spot Instances** | Build workers (50% discount) | 4 nodes | $280 |
| **EBS Volumes** | gp3 | 1TB | $80 |
| | | **Subtotal** | **$1,273** |

#### 2.2 Storage

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **S3 Standard** | Hot data (40%) | 4TB | $92 |
| **S3 Intelligent-Tiering** | Warm data (60%) | 6TB | $124 |
| **S3 Versioning** | 20% overhead | 2TB | $46 |
| **S3 Requests** | PUT/GET/LIST | 10M PUT, 50M GET | $230 |
| **Cross-Region Replication** | DR region | 10TB × $0.02/GB | $200 |
| | | **Subtotal** | **$692** |

#### 2.3 Content Delivery (CDN)

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **CloudFront Data Transfer** | First 10TB | 5TB × $0.085/GB | $425 |
| **CloudFront Requests** | HTTPS | 100M requests | $100 |
| **Invalidations** | Cache purges | 50K paths | $2.50 |
| | | **Subtotal** | **$527** |

#### 2.4 Database & Cache

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **RDS PostGIS (Primary)** | db.r6g.xlarge Multi-AZ | 1 × 730h | $584 |
| **RDS Storage** | gp3 | 500GB | $69 |
| **RDS I/O** | Provisioned IOPS | 10K IOPS | $650 |
| **ElastiCache Redis** | cache.r6g.large (cluster) | 3 nodes | $438 |
| | | **Subtotal** | **$1,741** |

#### 2.5 Networking

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **NAT Gateway** | 3 NATs (one per AZ) | 3 × 730h | $129 |
| **NAT Data Processing** | | 500GB | $30 |
| **VPC Endpoints** | S3, DynamoDB, ECR, CloudWatch | 5 × 730h | $37 |
| **Private Link** | API Gateway | 730h + 1GB | $8 |
| | | **Subtotal** | **$204** |

#### 2.6 Observability

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **CloudWatch Logs** | Ingestion + storage | 500GB | $265 |
| **CloudWatch Metrics** | Custom metrics | 1,000 metrics | $30 |
| **Prometheus Storage** | EBS | 500GB | $40 |
| **Loki Storage** | S3 | 300GB | $7 |
| **Tempo Storage** | S3 | 100GB | $2.30 |
| **Grafana Cloud (optional)** | Managed | 1 workspace | $50 |
| | | **Subtotal** | **$394** |

#### 2.7 Security & Compliance

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **KMS Keys** | Per-tenant keys | 10 keys | $10 |
| **KMS Requests** | | 10M requests | $30 |
| **Secrets Manager** | | 50 secrets | $20 |
| **WAF (Advanced)** | + rate limiting | $35/month | $35 |
| **GuardDuty** | Threat detection | 1 account | $30 |
| **Config** | Compliance monitoring | Rules + snapshots | $25 |
| | | **Subtotal** | **$150** |

#### 2.8 Event Bus & Orchestration

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **NATS JetStream** | Self-hosted on EKS | Storage only | $5 |
| **EventBridge (backup)** | Custom bus | 5M events | $5 |
| **Step Functions** | Workflow orchestration | 100K transitions | $25 |
| **SQS** | Dead-letter queues | 10M requests | $4 |
| | | **Subtotal** | **$39** |

#### 2.9 Additional Services

| Component | Specification | Quantity | Monthly Cost |
|-----------|--------------|----------|--------------|
| **ECR** | Container images | 100GB | $10 |
| **Route 53** | Hosted zones + queries | 3 zones, 100M queries | $41.50 |
| **Certificate Manager** | Free | - | $0 |
| **Backup** | AWS Backup service | 500GB | $25 |
| | | **Subtotal** | **$76.50** |

### Production Small (10TB) Total Cost

| Category | Monthly Cost |
|----------|--------------|
| Compute | $1,273 |
| Storage | $692 |
| CDN | $527 |
| Database & Cache | $1,741 |
| Networking | $204 |
| Observability | $394 |
| Security | $150 |
| Event Bus | $39 |
| Additional Services | $77 |
| **Buffer (15%)** | **$765** |
| **TOTAL** | **~$5,862/month** |

**Annual Cost:** ~$70,344

---

## 3. Production Environment - Medium (100TB)

### Assumptions
- **Data Volume:** 100TB
- **Active Users:** 1,000-2,000
- **API Requests:** ~50M/month
- **CDN Traffic:** 40TB egress/month (70% cache hit rate)
- **Build Frequency:** 50-100 packs/day

### Key Changes from Small
- Larger EKS node pools with autoscaling
- S3 Intelligent-Tiering for most data
- Enhanced CloudFront with additional edge locations
- Larger RDS and ElastiCache instances
- Cross-region active-active (not just DR)

### Cost Breakdown

| Category | Monthly Cost | Notes |
|----------|--------------|-------|
| **Compute** | $4,800 | 12-20 nodes (m6i.2xlarge), spot workers |
| **Storage** | $2,800 | S3 Intelligent-Tiering, glacier deep archive for old versions |
| **CDN** | $3,200 | 40TB × $0.080/GB (volume discount tier) |
| **Database & Cache** | $4,500 | db.r6g.4xlarge Multi-AZ, 6-node Redis cluster |
| **Networking** | $800 | Enhanced NAT, more VPC endpoints |
| **Observability** | $1,200 | Managed Prometheus, enhanced retention |
| **Security** | $500 | 50 tenant keys, enhanced WAF, audit logs |
| **Event Bus** | $200 | Higher throughput, larger message volumes |
| **Additional** | $300 | Larger backups, more ECR storage |
| **Data Transfer** | $1,500 | Inter-region replication, API egress |
| **Buffer (15%)** | **$2,970** | |
| **TOTAL** | **~$22,770/month** | |

**Annual Cost:** ~$273,240

---

## 4. Production Environment - Large (1PB)

### Assumptions
- **Data Volume:** 1PB (1,000TB)
- **Active Users:** 10,000+
- **API Requests:** ~500M/month
- **CDN Traffic:** 300TB egress/month (80% cache hit rate)
- **Build Frequency:** 200-500 packs/day
- **Multi-region active-active**

### Cost Breakdown

| Category | Monthly Cost | Notes |
|----------|--------------|-------|
| **Compute** | $18,000 | Large EKS clusters per region, extensive autoscaling |
| **Storage** | $15,000 | Aggressive tiering, Glacier for archives |
| **CDN** | $21,000 | 300TB × $0.070/GB (enterprise tier) |
| **Database & Cache** | $12,000 | Aurora Global, large ElastiCache clusters |
| **Networking** | $4,000 | Global accelerator, multiple regions |
| **Observability** | $5,000 | Enterprise Grafana, long retention |
| **Security** | $2,000 | 500 tenant keys, enterprise WAF |
| **Event Bus** | $1,500 | High-throughput NATS clusters |
| **Additional** | $2,000 | Enterprise support considerations |
| **Data Transfer** | $8,000 | Multi-region replication |
| **Buffer (15%)** | **$13,275** | |
| **TOTAL** | **~$101,775/month** | |

**Annual Cost:** ~$1,221,300

---

## 5. Per-User & Per-API-Call Economics

### Per-User Monthly Cost

| Scenario | Users | Monthly Cost | Cost/User/Month |
|----------|-------|--------------|-----------------|
| MVP | 20 | $680 | $34.00 |
| Small Production | 200 | $5,862 | $29.31 |
| Medium Production | 2,000 | $22,770 | $11.39 |
| Large Production | 10,000 | $101,775 | $10.18 |

**Key Insight:** Economies of scale kick in significantly after 1,000 users.

### Per-API-Call Cost

| Scenario | API Calls/Month | Monthly Cost | Cost/1M Calls |
|----------|-----------------|--------------|---------------|
| MVP | 50K | $680 | $13,600 |
| Small Production | 5M | $5,862 | $1,172 |
| Medium Production | 50M | $22,770 | $455 |
| Large Production | 500M | $101,775 | $204 |

### Per-GB-Served Cost (CDN)

| Data Volume | Cache Hit Rate | Egress/Month | CDN Cost | Cost/GB |
|-------------|----------------|--------------|----------|---------|
| 10TB | 50% | 5TB | $527 | $0.105 |
| 100TB | 70% | 40TB | $3,200 | $0.080 |
| 1PB | 80% | 300TB | $21,000 | $0.070 |

**Key Insight:** Higher cache hit rates dramatically reduce costs. Each 10% improvement in cache hit rate saves ~$500-$2,000/month at scale.

---

## 6. Cost Comparison: Single-Region vs Multi-Region

### Small Production (10TB)

| Component | Single Region | Multi-Region (Active-Passive) | Multi-Region (Active-Active) |
|-----------|---------------|-------------------------------|------------------------------|
| **Compute** | $1,273 | $1,400 (+10% DR region) | $2,400 (+90% for second region) |
| **Storage** | $692 | $892 (+$200 replication) | $1,200 (+75% for second region) |
| **CDN** | $527 | $580 (+10% routing) | $600 (+15% split traffic) |
| **Database** | $1,741 | $1,950 (+12% read replica) | $3,200 (+85% for Aurora Global) |
| **Networking** | $204 | $280 (+37% cross-region) | $450 (+120% for active-active) |
| **Other** | $658 | $700 (+6%) | $800 (+22%) |
| **Buffer (15%)** | $765 | $900 | $1,190 |
| **TOTAL** | **$5,862** | **$6,702** | **$9,840** |
| **Increase** | Baseline | **+14%** | **+68%** |

### Key Insights
- **Active-Passive DR:** Adds 14-20% to baseline costs
- **Active-Active:** Nearly doubles infrastructure costs but provides:
  - Higher availability
  - Better global performance
  - No failover downtime
  - Regional data residency compliance

### Cost Optimization: Hybrid Approach
Consider active-active for Control Plane only:
- **Control Plane:** Multi-region for API availability (~+40% cost)
- **Data Plane:** Single region with DR replication (~+15% cost)
- **Total Increase:** ~25% over single region
- **Benefit:** Better user experience without doubling storage costs

---

## 7. Cost Optimization Strategies

### 7.1 Compute Savings (20-40% potential)

#### Reserved Instances / Savings Plans
- **3-year commitment:** 62% discount on m6i.xlarge ($0.192/hr → $0.073/hr)
- **1-year commitment:** 40% discount
- **Recommendation:** Reserve 60% of baseline capacity

**Annual Savings Example (Small Production):**
- Baseline: 6 × m6i.xlarge × $0.192 × 8,760 = $10,101
- With 3-year RI: 6 × $0.073 × 8,760 = $3,838
- **Savings: $6,263/year (62%)**

#### Spot Instances for Workers
- **Use for:** Build workers, batch processing
- **Savings:** 50-70% vs on-demand
- **Caveat:** Need interruption handling

**Annual Savings:** $3,000-$5,000 for medium workloads

### 7.2 Storage Optimization (30-50% potential)

#### Intelligent-Tiering
- **Automatic:** Moves infrequently accessed data to cheaper tiers
- **Savings:** 40-70% on tiered data
- **Cost:** $0.0025/1K objects monitoring fee

**Example (100TB dataset):**
- Standard tier: 100TB × $0.023 = $2,300/month
- Intelligent-Tiering: 40TB × $0.023 + 60TB × $0.0125 = $920 + $750 = $1,670/month
- **Savings: $630/month ($7,560/year)**

#### Lifecycle Policies
```
Current version → 30 days → Intelligent-Tiering
Non-current versions → 90 days → Glacier Instant Retrieval → 365 days → Delete
```

### 7.3 CDN Optimization (20-40% potential)

#### Improve Cache Hit Rate
**Impact:** Every 10% improvement saves significant egress costs

| Cache Hit Rate | 40TB Egress | Requests to Origin | CDN Cost | Savings vs 50% |
|----------------|-------------|-------------------|----------|----------------|
| 50% | 40TB | 20TB | $3,400 | Baseline |
| 60% | 40TB | 16TB | $3,000 | $400/month |
| 70% | 40TB | 12TB | $2,600 | $800/month |
| 80% | 40TB | 8TB | $2,200 | $1,200/month |

**Tactics:**
- Pre-warm popular tiles
- Longer cache TTLs (immutable content)
- Cache-friendly URL patterns
- Regional edge caching

#### CDN Volume Discounts
Negotiate enterprise agreements:
- Standard: $0.085/GB
- 100TB+: $0.075/GB (12% discount)
- 500TB+: $0.065/GB (24% discount)

### 7.4 Database Optimization (15-30% potential)

#### Right-Size Instances
- Monitor CPU/memory utilization
- Use CloudWatch recommendations
- Consider Aurora Serverless v2 for variable workloads

#### Read Replicas vs Caching
- **Cache hit:** $0.001/request
- **Read replica hit:** $0.01/request
- **Primary DB hit:** $0.02/request

**Strategy:** Aggressive ElastiCache for metadata reads

### 7.5 Observability Optimization (20-30% potential)

#### Log Retention Policies
```
Critical logs: 90 days CloudWatch → S3
Debug logs: 7 days CloudWatch → Delete
Audit logs: 7 years S3 → Glacier
```

#### Metric Aggregation
- Pre-aggregate metrics before CloudWatch
- Use Prometheus for internal metrics
- Send only alerts to CloudWatch

**Savings:** $100-$500/month depending on scale

---

## 8. Cost Guardrails & Monitoring

### 8.1 Budget Alarms

#### MVP/Dev Environment
```
Warning: 80% of $1,000/month budget
Critical: 100% of budget
Emergency: 150% of budget (potential runaway)
```

#### Production Environment (Small)
```
Warning: 80% of $7,500/month budget
Critical: 100% of budget
Emergency: 150% of budget
```

### 8.2 Cost Anomaly Detection

Enable AWS Cost Anomaly Detection:
- **Threshold:** >$100 or >25% increase day-over-day
- **Alert:** Slack + Email
- **Common Causes:**
  - Data transfer spike
  - Failed batch jobs (retry storms)
  - Cache invalidation errors (origin flood)
  - Misconfigured autoscaling

### 8.3 Resource Tagging Strategy

**Required Tags:**
```
Environment: dev|staging|prod
Project: spatial-properties
CostCenter: engineering|operations|cdn
Service: pack-service|mcp-gateway|frontend
Tenant: shared|acme|xyz (for multi-tenant costs)
```

### 8.4 Cost Allocation

#### By Service
- Pack Service: 15-20%
- Workers/Build Pipeline: 30-40%
- Storage: 20-25%
- CDN: 15-20%
- Observability: 5-8%
- Other: 5-10%

#### By Tenant (Production)
Track per-tenant costs:
- Storage: Direct allocation by prefix
- Compute: Proportional to API calls
- CDN: Direct allocation by signed URL metrics

---

## 9. ROI & Pricing Strategy

### 9.1 Cost Recovery Models

#### Model 1: Per-User SaaS
- **Cost/User/Month:** $10-$30 (depending on scale)
- **Price/User/Month:** $50-$150
- **Gross Margin:** 67-80%

#### Model 2: Usage-Based (API Calls)
- **Cost/1M Calls:** $200-$1,200 (depending on scale)
- **Price/1M Calls:** $1,000-$5,000
- **Gross Margin:** 75-83%

#### Model 3: Data Volume
- **Cost/TB Stored:** $10-$30/month
- **Price/TB Stored:** $50-$200/month
- **Gross Margin:** 75-85%

#### Model 4: Hybrid (Recommended)
- **Base Fee:** $5,000/month (covers infrastructure)
- **Storage:** $100/TB/month
- **API Calls:** $2.00/1K calls over quota
- **CDN Egress:** $0.15/GB over quota

### 9.2 Break-Even Analysis

#### MVP (Internal Use)
- **Monthly Cost:** $680
- **Required to Break Even:** N/A (R&D investment)

#### Small Production
- **Monthly Cost:** $5,862
- **At $100/user/month:** 59 paying users
- **At $50/user/month:** 118 paying users

#### Medium Production
- **Monthly Cost:** $22,770
- **At $50/user/month:** 456 paying users
- **At $25/user/month:** 911 paying users

**Key Insight:** Need 100-500 paying customers to achieve sustainability, depending on pricing tier.

---

## 10. Cost Decision Matrix

### When to Upgrade Tiers

| Metric | MVP → Small | Small → Medium | Medium → Large |
|--------|-------------|----------------|----------------|
| **Data Volume** | >2TB | >20TB | >200TB |
| **Active Users** | >50 | >500 | >5,000 |
| **API Calls/mo** | >1M | >10M | >100M |
| **CDN Egress/mo** | >500GB | >10TB | >100TB |
| **Monthly Cost** | $680 → $5,862 | $5,862 → $22,770 | $22,770 → $101,775 |
| **Trigger** | Any 2 metrics | Any 2 metrics | Any 2 metrics |

### Cost/Performance Trade-offs

| Optimization | Cost Impact | Performance Impact | Recommendation |
|--------------|-------------|-------------------|----------------|
| **Spot Instances** | -50% compute | Risk of interruption | Use for workers only |
| **S3 Intelligent-Tiering** | -40% storage | No impact (automatic) | Enable for all packs |
| **Single NAT Gateway** | -67% NAT cost | Single point of failure | MVP only |
| **Longer cache TTL** | -30% origin requests | Slightly stale data | Safe for immutable packs |
| **Smaller RDS instance** | -50% DB cost | May bottleneck | Monitor closely |
| **Self-hosted observability** | -60% obs cost | Management overhead | Consider for large scale |

---

## 11. Quarterly Cost Review Checklist

### Q1: Foundation Quarter
- [ ] Verify actual vs projected costs (±20% acceptable)
- [ ] Review resource utilization (target 60-80%)
- [ ] Implement cost anomaly detection
- [ ] Tag all resources
- [ ] Enable CloudWatch billing alerts

### Q2: Optimization Quarter
- [ ] Purchase RIs/Savings Plans for stable workloads
- [ ] Enable S3 Intelligent-Tiering
- [ ] Implement lifecycle policies
- [ ] Optimize cache hit rates (target 70%+)
- [ ] Right-size instances based on actual usage

### Q3: Efficiency Quarter
- [ ] Review multi-region strategy (cost vs benefit)
- [ ] Implement spot instances for workers
- [ ] Negotiate CDN volume discounts
- [ ] Optimize observability retention
- [ ] Implement per-tenant cost tracking

### Q4: Planning Quarter
- [ ] Forecast next year's costs
- [ ] Review pricing strategy
- [ ] Plan capacity for growth
- [ ] Evaluate RI/SP renewals
- [ ] Budget for new features

---

## Appendix A: Cost Calculation Spreadsheet Variables

```python
# Core Variables
data_volume_tb = 10
active_users = 200
api_calls_per_month = 5_000_000
cdn_egress_tb = 5
cache_hit_rate = 0.70
builds_per_day = 15

# Pricing (ap-southeast-2)
eks_control_plane = 0.10  # per hour
m6i_xlarge = 0.192  # per hour
s3_standard = 0.023  # per GB
cloudfront_tier1 = 0.085  # per GB (first 10TB)
rds_r6g_xlarge = 0.584  # per hour (Multi-AZ)
elasticache_r6g_large = 0.146  # per hour
nat_gateway = 0.059  # per hour
nat_processing = 0.059  # per GB

# Compute costs
worker_nodes = 6
worker_hours_per_month = 730
compute_cost = worker_nodes * worker_hours_per_month * m6i_xlarge

# Storage costs
storage_cost = data_volume_tb * 1024 * s3_standard

# CDN costs (adjusted for cache hit rate)
origin_requests = cdn_egress_tb * (1 - cache_hit_rate)
cdn_cost = cdn_egress_tb * cloudfront_tier1

# Total
total_monthly_cost = compute_cost + storage_cost + cdn_cost + ...
```

---

## Summary & Recommendations

### Immediate Actions (Pre-MVP)
1. ✅ **Set up billing alerts** at 80%, 100%, 150% of projected MVP budget ($680/month)
2. ✅ **Enable Cost Anomaly Detection** with $100 daily threshold
3. ✅ **Implement resource tagging** strategy across all resources
4. ✅ **Create cost dashboard** in Grafana with real-time AWS Cost Explorer data

### Month 1-3 (MVP Phase)
- Monitor actual vs projected (expect ±30% variance initially)
- Optimize obvious waste (unused resources, over-provisioned instances)
- Establish cost baselines for each service

### Month 4-6 (Pre-Production)
- Purchase 1-year RIs for stable baseline capacity (40% savings)
- Enable S3 Intelligent-Tiering (30-40% storage savings)
- Implement spot instances for workers (50% compute savings)
- Negotiate initial CDN volume commitments

### Month 7-12 (Production Ramp)
- Achieve 70%+ cache hit rate
- Implement per-tenant cost tracking
- Establish cost allocation and showback
- Plan 3-year RI strategy based on stable workloads

### Expected Savings Timeline
- **Month 3:** 10-15% reduction through waste elimination
- **Month 6:** 25-30% reduction with RIs and tiering
- **Month 12:** 35-45% reduction with full optimization

**Target Efficiency:** $0.08-0.12 per GB-served (including infrastructure, not just CDN)


---

## 12. Feature-Specific Cost Estimates

### 12.1 Schema Registry & Validation (E2c)

The schema registry uses static hosting (minimal infrastructure) with validation running as part of existing pack build pipeline.

#### Infrastructure Costs

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **Schema Hosting (S3)** | Static JSON/YAML schemas | $0.023/GB | 1GB | $0.02 |
| **CloudFront for Schemas** | CDN for schema resolution | $0.085/GB | 10GB egress | $0.85 |
| **Validator Container** | Part of existing EKS | Shared | - | $0 (included) |
| **Conformance Reports (S3)** | JSON reports per pack | $0.023/GB | 5GB | $0.12 |
| **Schema Registry UI** | Part of Pack Explorer | Shared | - | $0 (included) |
| | | | **Subtotal** | **~$1/month** |

#### Development Investment (One-Time)

| Item | Effort | Notes |
|------|--------|-------|
| Schema JSON Schema definitions | 2-3 days | Base schemas for roads, parcels |
| Validator CLI | 3-5 days | TypeScript + Python packages |
| CI/CD integration | 1-2 days | GitHub Actions workflow |
| Conformance report generator | 2-3 days | JSON output format |
| Schema browser UI | 3-5 days | Part of Pack Explorer |
| **Total** | **11-18 days** | ~2-3 weeks engineering |

**Marginal Cost:** Effectively **$0** additional infrastructure (uses existing S3/CDN).

---

### 12.2 Trust & Policy Artifacts (E2d)

Trust artifacts add signing infrastructure and machine-readable contracts.

#### Infrastructure Costs

| Component | Specification | Unit Cost | Quantity | Monthly Cost |
|-----------|--------------|-----------|----------|--------------|
| **KMS Signing Key** | Manifest signing | $1/key/month | 2 keys | $2 |
| **KMS Sign/Verify** | Per-pack operations | $0.03/10K | 50K requests | $0.15 |
| **integrity.json Storage** | Per-pack receipts | $0.023/GB | 1GB | $0.02 |
| **contract.json Storage** | License contracts | $0.023/GB | 0.5GB | $0.01 |
| **policy.json Storage** | Access policies | $0.023/GB | 0.5GB | $0.01 |
| **UDG-lite Graph (Phase 2)** | RDS for lineage | See existing RDS | Shared | $0 (included) |
| | | | **Subtotal** | **~$2.20/month** |

#### Development Investment (One-Time)

| Item | Effort | Notes |
|------|--------|-------|
| integrity.json schema + generator | 2-3 days | BLAKE3/SHA256 hashing |
| Manifest signing workflow | 3-4 days | KMS integration |
| Verification CLI | 2-3 days | Offline-capable |
| contract.json schema | 2-3 days | License, attribution, constraints |
| policy.json schema | 2-3 days | Classification, access rules |
| Trace envelope in events | 2-3 days | NATS event extension |
| UDG-lite graph API (Phase 2) | 5-8 days | Query endpoints |
| Pack Explorer trust UI (Phase 2) | 3-5 days | Trust summary display |
| **Total** | **21-32 days** | ~4-6 weeks engineering |

**Marginal Cost:** **~$2-3/month** additional (primarily KMS).

---

### 12.3 WA Solar Feasibility Pack (E17)

Hero pack demonstrating full pack-first workflow.

#### Pack Build Costs (One-Time)

| Item | Data Source | Processing | Estimated Cost |
|------|-------------|-----------|----------------|
| **Solar Exposure COG** | BOM/NASA POWER | GDAL reproject/optimize | $10-20 compute |
| **DEM COG** | National DEM/SRTM | GDAL optimize | $15-30 compute |
| **Slope/Aspect COGs** | Derived from DEM | GDAL terrain | $10-20 compute |
| **Bushfire PMTiles** | WA Open Data | tippecanoe | $5-10 compute |
| **Soils GeoParquet** | ASRIS | rio-tiler | $10-15 compute |
| **Roads PMTiles** | OSM | tippecanoe | $10-20 compute |
| **Manifest + Validation** | Generated | Pack Service | $1-2 compute |
| **Total Build** | | | **$60-120** |

#### Pack Storage & Delivery Costs (Monthly)

| Component | Size Estimate | Unit Cost | Monthly Cost |
|-----------|--------------|-----------|--------------|
| **S3 Storage** | 500MB (v0.1 pack) | $0.023/GB | $0.01 |
| **CDN Egress** | 50GB (pilot usage) | $0.085/GB | $4.25 |
| **S3 Requests** | 10K GET requests | $0.0004/1K | $0.004 |
| | | **Subtotal** | **~$4.30/month** |

#### Development Investment (One-Time)

| Item | Effort | Notes |
|------|--------|-------|
| Data source acquisition | 2-3 days | Download, license verification |
| Layer processing scripts | 3-5 days | GDAL/tippecanoe workflows |
| Manifest authoring | 1-2 days | spatialpack.json + artifacts |
| Demo app integration | 2-3 days | MapLibre layer loading |
| Screening workflow | 3-5 days | Score calculation + report |
| Documentation | 1-2 days | User guide, disclaimers |
| **Total** | **12-20 days** | ~2-4 weeks engineering |

#### Licensing Considerations

| Layer | License | Cost |
|-------|---------|------|
| Solar (BOM/NASA) | Open | $0 |
| DEM (SRTM/National) | Open | $0 |
| Slope/Aspect | Derived | $0 |
| Bushfire (WA) | Open | $0 |
| Soils (ASRIS) | Open | $0 |
| Roads (OSM) | ODbL | $0 |
| **v0 Total** | | **$0** |

**Note:** v1 add-ons (cadastre, zoning, commercial irradiance) will require licensing agreements—costs TBD.

---

### 12.4 Combined Feature Costs Summary

| Feature | Infrastructure (Monthly) | Development (One-Time) |
|---------|-------------------------|------------------------|
| E2c: Schema Registry | ~$1 | 2-3 weeks |
| E2d: Trust Artifacts | ~$2-3 | 4-6 weeks |
| E17: Solar Pack | ~$4-5 | 2-4 weeks |
| **Total** | **~$7-9/month** | **8-13 weeks** |

**Conclusion:** These features add negligible infrastructure cost (~$10/month combined) while providing significant product differentiation. The primary investment is engineering effort.

---

## Methodology & Reconciliation Note


## Methodology & Reconciliation Note

Earlier drafts contained higher top‑line estimates. The detailed bottoms‑up modeling in this document (compute, storage, CDN, database, networking, observability, security, and buffers) yields **lower, defensible totals** shown in the Quick Reference. The Quick Reference above is now the **source of truth**. Variance drivers include cache hit rate, spot usage for workers, and Intelligent‑Tiering adoption. Revisit quarterly as usage patterns evolve.


# Cost Modeling & Budget — Agents & Edge Additions

## 0. Pricing Lens (Per‑Agent)

Layer per‑agent subscription on top of hybrid model:
- **Base Platform Fee** (covers control/data plane)
- **Per‑Agent Tier** by **tile frequency** and **layers** (e.g., CSP‑1 base vs +live layers)
- **Overages:** API calls and CDN egress as before

## 1. New Cost Lines

| Item | Unit | Est. (Monthly) | Notes |
|------|------|-----------------|------|
| **Device PKI** | /1K devices | $50–$200 | ACM PCA/Vault PKI, rotation, CRL/OCSP |
| **Edge Sync Service** | small cluster | $300–$800 | NATS + workers |
| **DTN Storage** | /100GB | $2–$5 | S3 infrequent for queues |
| **Sat/LPWAN** | /device | varies | If used; plan per‑message |
| **Beacon Infra** | /venue | $5–$20 | Battery + admin time |
| **Marketplace Ops** | service | $200–$600 | APIs + reports |

## 2. Revenue Model Additions

- **Agent Tiers** (examples):  
  - **Lite:** CSP‑1 (base + regs), 1Hz prefetch → $8/agent/mo  
  - **Pro:** + live layers, 2Hz prefetch → $15/agent/mo  
  - **Venue Pack Add‑on:** event overlays → +$2/agent/mo

- **Marketplace Rev‑Share:** default 80/20 (publisher/platform), negotiable for exclusives.

## 3. Sensitivity: Cache Hit Impact

Higher edge cache hit and route‑based prefetch **reduces egress** materially; target pack hit rates ≥ 70%.

## 4. Guardrails (No Change + Additions)

- Enforce max **delta size** before full refresh  
- Alert on **per‑agent** egress anomalies  
- Negotiate **CDN volume discounts** and **sat message bundles**
