# Spatial.Properties: Network & Security Architecture

## Executive Summary

This document defines the complete network topology, security controls, and defense-in-depth strategy for the Spatial.Properties platform. All configurations are production-ready and follow AWS Well-Architected Framework security best practices.

**Key Principles:**
- **Zero Trust:** No implicit trust based on network location
- **Defense in Depth:** Multiple layers of security controls
- **Least Privilege:** Minimal necessary access at all levels
- **Encryption Everywhere:** In-transit and at-rest
- **Automated Compliance:** Security as code

---

## 1. VPC Architecture

### 1.1 CIDR Allocation Strategy

#### Production VPC (ap-southeast-2)
```
VPC CIDR: 10.0.0.0/16 (65,536 IPs)
├── Public Subnets (Internet-facing)
│   ├── ap-southeast-2a: 10.0.0.0/24    (256 IPs) - ALB, NAT Gateway
│   ├── ap-southeast-2b: 10.0.1.0/24    (256 IPs) - ALB, NAT Gateway
│   └── ap-southeast-2c: 10.0.2.0/24    (256 IPs) - ALB, NAT Gateway
├── Private Subnets (EKS Nodes, RDS)
│   ├── ap-southeast-2a: 10.0.10.0/23   (512 IPs) - EKS worker nodes
│   ├── ap-southeast-2b: 10.0.12.0/23   (512 IPs) - EKS worker nodes
│   └── ap-southeast-2c: 10.0.14.0/23   (512 IPs) - EKS worker nodes
├── Data Subnets (RDS, ElastiCache)
│   ├── ap-southeast-2a: 10.0.20.0/24   (256 IPs) - RDS primary, cache
│   ├── ap-southeast-2b: 10.0.21.0/24   (256 IPs) - RDS standby, cache
│   └── ap-southeast-2c: 10.0.22.0/24   (256 IPs) - Cache replica
└── Management Subnets (Bastion, VPN)
    ├── ap-southeast-2a: 10.0.30.0/28   (16 IPs) - Bastion
    ├── ap-southeast-2b: 10.0.30.16/28  (16 IPs) - Bastion
    └── VPN Gateway: 10.0.30.32/28      (16 IPs)
```

#### DR/Secondary Region VPC (ap-southeast-1)
```
VPC CIDR: 10.1.0.0/16 (65,536 IPs)
└── Same subnet structure with 10.1.x.x addressing
```

#### Development VPC (ap-southeast-2)
```
VPC CIDR: 10.10.0.0/16 (65,536 IPs)
└── Simplified: 3 public, 3 private subnets only
```

### 1.2 VPC Design Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Internet Gateway                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────▼─────┐          ┌─────▼──────┐         ┌─────▼──────┐
    │ Public   │          │  Public    │         │  Public    │
    │ Subnet-A │          │  Subnet-B  │         │  Subnet-C  │
    │ 10.0.0/24│          │ 10.0.1/24  │         │ 10.0.2/24  │
    └────┬─────┘          └─────┬──────┘         └─────┬──────┘
         │                      │                      │
    ┌────▼─────┐          ┌─────▼──────┐         ┌─────▼──────┐
    │   ALB    │          │    ALB     │         │    ALB     │
    │   NAT-A  │          │   NAT-B    │         │   NAT-C    │
    └────┬─────┘          └─────┬──────┘         └─────┬──────┘
         │                      │                      │
    ┌────▼─────────────────────▼──────────────────────▼──────┐
    │              Private Route Table (Default: NAT)         │
    └─────────────────────────┬──────────────────────────────┘
         │                    │                       │
    ┌────▼──────┐       ┌─────▼──────┐         ┌─────▼──────┐
    │ Private   │       │  Private   │         │  Private   │
    │ Subnet-A  │       │  Subnet-B  │         │  Subnet-C  │
    │10.0.10/23 │       │10.0.12/23  │         │10.0.14/23  │
    │           │       │            │         │            │
    │ EKS Nodes │       │ EKS Nodes  │         │ EKS Nodes  │
    └────┬──────┘       └─────┬──────┘         └─────┬──────┘
         │                    │                       │
         │              ┌─────▼──────┐                │
         │              │ VPC        │                │
         └─────────────►│ Endpoints  │◄───────────────┘
                        │ S3, ECR,   │
                        │ CloudWatch │
                        └────────────┘
                        
    ┌──────────────────────────────────────────────────┐
    │            Data Subnets (Isolated)               │
    │  ┌─────────┐    ┌─────────┐    ┌─────────┐     │
    │  │  RDS    │    │  RDS    │    │ Cache   │     │
    │  │ Primary │    │ Standby │    │ Replica │     │
    │  │ 10.0.20 │    │ 10.0.21 │    │ 10.0.22 │     │
    │  └─────────┘    └─────────┘    └─────────┘     │
    └──────────────────────────────────────────────────┘
```

### 1.3 Routing Tables

#### Public Subnet Route Table
```
Destination         Target              Purpose
0.0.0.0/0          igw-xxxxx           Internet access
10.0.0.0/16        local               VPC internal
10.1.0.0/16        pcx-xxxxx           DR region peering
```

#### Private Subnet Route Table
```
Destination         Target              Purpose
0.0.0.0/0          nat-xxxxx           Internet via NAT
10.0.0.0/16        local               VPC internal
10.1.0.0/16        pcx-xxxxx           DR region peering
s3 prefix-list     vpce-s3-xxxxx       S3 VPC endpoint
dynamodb prefix    vpce-ddb-xxxxx      DynamoDB endpoint
```

#### Data Subnet Route Table
```
Destination         Target              Purpose
10.0.0.0/16        local               VPC internal only
10.1.0.0/16        pcx-xxxxx           DR region (RDS replication)
(No 0.0.0.0/0 - fully isolated from Internet)
```

---

## 2. Security Groups

### 2.1 Naming Convention
```
sg-{env}-{service}-{direction}-{protocol}
Example: sg-prod-eks-ingress-https
```

### 2.2 Security Group Definitions

#### SG-001: ALB Security Group (`sg-prod-alb-public`)
**Purpose:** Application Load Balancer in public subnets

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Ingress | TCP | 443 | 0.0.0.0/0 | HTTPS from internet |
| Ingress | TCP | 80 | 0.0.0.0/0 | HTTP (redirect to HTTPS) |
| Egress | TCP | 8080 | sg-prod-eks-nodes | To EKS ingress pods |
| Egress | TCP | 443 | 0.0.0.0/0 | Health checks, AWS APIs |

#### SG-002: EKS Control Plane (`sg-prod-eks-control-plane`)
**Purpose:** EKS Kubernetes API server

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Ingress | TCP | 443 | sg-prod-eks-nodes | Node to control plane |
| Ingress | TCP | 443 | sg-prod-bastion | Admin access |
| Ingress | TCP | 443 | 10.0.0.0/16 | VPC internal |
| Egress | TCP | 443 | 0.0.0.0/0 | AWS APIs |
| Egress | TCP | 10250 | sg-prod-eks-nodes | Kubelet communication |

#### SG-003: EKS Worker Nodes (`sg-prod-eks-nodes`)
**Purpose:** EKS worker nodes in private subnets

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Ingress | TCP | 443 | sg-prod-alb-public | From ALB (ingress) |
| Ingress | TCP | 8080 | sg-prod-alb-public | App traffic from ALB |
| Ingress | TCP | 10250 | sg-prod-eks-control-plane | Kubelet |
| Ingress | All | All | sg-prod-eks-nodes | Pod-to-pod communication |
| Ingress | TCP | 22 | sg-prod-bastion | SSH (emergency only) |
| Egress | TCP | 443 | 0.0.0.0/0 | Internet (via NAT) |
| Egress | TCP | 5432 | sg-prod-rds | PostgreSQL/PostGIS |
| Egress | TCP | 6379 | sg-prod-cache | Redis |
| Egress | TCP | 443 | sg-prod-eks-control-plane | To control plane |

#### SG-004: RDS PostGIS (`sg-prod-rds`)
**Purpose:** PostgreSQL/PostGIS database

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Ingress | TCP | 5432 | sg-prod-eks-nodes | From EKS pods |
| Ingress | TCP | 5432 | sg-prod-bastion | Admin access |
| Ingress | TCP | 5432 | 10.1.20.0/24 | DR region replication |
| Egress | TCP | 443 | 0.0.0.0/0 | AWS Secrets Manager (via VPC endpoint preferred) |

#### SG-005: ElastiCache Redis (`sg-prod-cache`)
**Purpose:** Redis cluster for caching

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Ingress | TCP | 6379 | sg-prod-eks-nodes | From EKS pods |
| Ingress | TCP | 6379 | sg-prod-bastion | Admin monitoring |
| Egress | - | - | - | (None required) |

#### SG-006: Bastion Host (`sg-prod-bastion`)
**Purpose:** Jump host for admin access

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Ingress | TCP | 22 | {OFFICE_IP_RANGES} | SSH from office |
| Ingress | TCP | 22 | {VPN_CIDR} | SSH from VPN |
| Egress | TCP | 22 | sg-prod-eks-nodes | SSH to nodes |
| Egress | TCP | 443 | sg-prod-eks-control-plane | kubectl access |
| Egress | TCP | 5432 | sg-prod-rds | Database admin |
| Egress | TCP | 6379 | sg-prod-cache | Cache admin |

**Note:** Replace `{OFFICE_IP_RANGES}` with actual office CIDR blocks.

#### SG-007: VPC Endpoints (`sg-prod-vpc-endpoints`)
**Purpose:** Interface endpoints for AWS services

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Ingress | TCP | 443 | 10.0.0.0/16 | HTTPS from VPC |
| Egress | - | - | - | (None required) |

### 2.3 Security Group Terraform Example

```hcl
resource "aws_security_group" "eks_nodes" {
  name_prefix = "sg-${var.environment}-eks-nodes-"
  description = "Security group for EKS worker nodes"
  vpc_id      = aws_vpc.main.id

  # Ingress from ALB
  ingress {
    description     = "HTTPS from ALB"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Ingress from other nodes (pod-to-pod)
  ingress {
    description = "All traffic from cluster nodes"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  # Ingress from control plane
  ingress {
    description     = "Kubelet from control plane"
    from_port       = 10250
    to_port         = 10250
    protocol        = "tcp"
    security_groups = [aws_eks_cluster.main.vpc_config[0].cluster_security_group_id]
  }

  # Egress to Internet (via NAT)
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "sg-${var.environment}-eks-nodes"
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  lifecycle {
    create_before_destroy = true
  }
}
```

---

## 3. Network ACLs (NACLs)

### 3.1 Design Philosophy
- Security Groups are primary control (stateful)
- NACLs provide defense-in-depth (stateless)
- NACLs used for broad subnet-level filtering

### 3.2 NACL Definitions

#### NACL-001: Public Subnet NACL

**Inbound Rules:**
| Rule | Type | Protocol | Port | Source | Allow/Deny |
|------|------|----------|------|--------|------------|
| 100 | TCP | 6 | 443 | 0.0.0.0/0 | ALLOW |
| 110 | TCP | 6 | 80 | 0.0.0.0/0 | ALLOW |
| 120 | TCP | 6 | 1024-65535 | 0.0.0.0/0 | ALLOW (ephemeral) |
| * | All | -1 | - | 0.0.0.0/0 | DENY |

**Outbound Rules:**
| Rule | Type | Protocol | Port | Destination | Allow/Deny |
|------|------|----------|------|-------------|------------|
| 100 | TCP | 6 | 443 | 0.0.0.0/0 | ALLOW |
| 110 | TCP | 6 | 80 | 0.0.0.0/0 | ALLOW |
| 120 | TCP | 6 | 1024-65535 | 0.0.0.0/0 | ALLOW (ephemeral) |
| * | All | -1 | - | 0.0.0.0/0 | DENY |

#### NACL-002: Private Subnet NACL

**Inbound Rules:**
| Rule | Type | Protocol | Port | Source | Allow/Deny |
|------|------|----------|------|--------|------------|
| 100 | All | -1 | - | 10.0.0.0/16 | ALLOW (VPC internal) |
| 110 | All | -1 | - | 10.1.0.0/16 | ALLOW (DR region) |
| 120 | TCP | 6 | 1024-65535 | 0.0.0.0/0 | ALLOW (ephemeral) |
| * | All | -1 | - | 0.0.0.0/0 | DENY |

**Outbound Rules:**
| Rule | Type | Protocol | Port | Destination | Allow/Deny |
|------|------|----------|------|-------------|------------|
| 100 | All | -1 | - | 10.0.0.0/16 | ALLOW (VPC internal) |
| 110 | All | -1 | - | 10.1.0.0/16 | ALLOW (DR region) |
| 120 | TCP | 6 | 443 | 0.0.0.0/0 | ALLOW (HTTPS out) |
| 130 | TCP | 6 | 1024-65535 | 0.0.0.0/0 | ALLOW (ephemeral) |
| * | All | -1 | - | 0.0.0.0/0 | DENY |

#### NACL-003: Data Subnet NACL

**Inbound Rules:**
| Rule | Type | Protocol | Port | Source | Allow/Deny |
|------|------|----------|------|--------|------------|
| 100 | TCP | 6 | 5432 | 10.0.10.0/23 | ALLOW (from EKS-A) |
| 110 | TCP | 6 | 5432 | 10.0.12.0/23 | ALLOW (from EKS-B) |
| 120 | TCP | 6 | 5432 | 10.0.14.0/23 | ALLOW (from EKS-C) |
| 130 | TCP | 6 | 6379 | 10.0.10.0/23 | ALLOW (Redis from EKS-A) |
| 140 | TCP | 6 | 6379 | 10.0.12.0/23 | ALLOW (Redis from EKS-B) |
| 150 | TCP | 6 | 6379 | 10.0.14.0/23 | ALLOW (Redis from EKS-C) |
| 160 | TCP | 6 | 5432 | 10.1.20.0/24 | ALLOW (RDS replication from DR) |
| * | All | -1 | - | 0.0.0.0/0 | DENY |

**Outbound Rules:**
| Rule | Type | Protocol | Port | Destination | Allow/Deny |
|------|------|----------|------|-------------|------------|
| 100 | TCP | 6 | 1024-65535 | 10.0.0.0/16 | ALLOW (ephemeral to VPC) |
| 110 | TCP | 6 | 5432 | 10.1.20.0/24 | ALLOW (RDS replication to DR) |
| * | All | -1 | - | 0.0.0.0/0 | DENY |

---

## 4. VPC Endpoints

### 4.1 Gateway Endpoints (No Charge)

#### S3 Gateway Endpoint
```
Service: com.amazonaws.ap-southeast-2.s3
Type: Gateway
Route Tables: All private route tables
Policy: Allow all (restricted by IAM/bucket policies)
```

#### DynamoDB Gateway Endpoint
```
Service: com.amazonaws.ap-southeast-2.dynamodb
Type: Gateway
Route Tables: All private route tables
Policy: Allow all (for state locking)
```

### 4.2 Interface Endpoints (Charged)

**Cost:** ~$0.01/hour per endpoint = $7.20/month each

| Service | Endpoint ID | Subnets | Security Group | Purpose |
|---------|-------------|---------|----------------|---------|
| **ECR API** | com.amazonaws...ecr.api | Private (all AZs) | sg-prod-vpc-endpoints | Pull container images |
| **ECR DKR** | com.amazonaws...ecr.dkr | Private (all AZs) | sg-prod-vpc-endpoints | Docker registry auth |
| **CloudWatch Logs** | com.amazonaws...logs | Private (all AZs) | sg-prod-vpc-endpoints | Send logs from pods |
| **Secrets Manager** | com.amazonaws...secretsmanager | Private (all AZs) | sg-prod-vpc-endpoints | Fetch secrets |
| **KMS** | com.amazonaws...kms | Private (all AZs) | sg-prod-vpc-endpoints | Encrypt/decrypt |
| **STS** | com.amazonaws...sts | Private (all AZs) | sg-prod-vpc-endpoints | IRSA token exchange |

**Total Interface Endpoint Cost:** ~$43/month

### 4.3 PrivateLink for Third-Party Services

If using third-party services via PrivateLink:
```
Service: Custom (e.g., Auth0)
Type: Interface
DNS: Custom private DNS name
```

---

## 5. Egress Filtering & Controls

### 5.1 NAT Gateway Strategy

#### Production: High Availability (3 NAT Gateways)
```
NAT Gateway A (ap-southeast-2a): nat-xxxxx
  ├─ Elastic IP: 54.206.x.x
  └─ Routes private-subnet-A traffic

NAT Gateway B (ap-southeast-2b): nat-yyyyy
  ├─ Elastic IP: 13.239.x.x
  └─ Routes private-subnet-B traffic

NAT Gateway C (ap-southeast-2c): nat-zzzzz
  ├─ Elastic IP: 3.25.x.x
  └─ Routes private-subnet-C traffic
```

**Cost:** $0.059/hour × 3 × 730h = $129/month + data processing

#### Development: Cost-Optimized (1 NAT Gateway)
```
Single NAT Gateway in AZ-A
  └─ All private subnets route through this
  
Risk: Single point of failure
Acceptable for: Dev/test environments only
```

### 5.2 Egress Filtering with AWS Network Firewall

For production environments requiring deep packet inspection:

```
┌──────────────────────────────────────────────────────┐
│              Internet Gateway                         │
└────────────────┬─────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Firewall       │
        │  Subnet         │
        │  (per AZ)       │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  AWS Network    │
        │  Firewall       │
        │  • Domain filter│
        │  • IPS/IDS      │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  NAT Gateway    │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Private        │
        │  Subnets        │
        └─────────────────┘
```

**Network Firewall Rules:**

```
# Domain filtering (whitelist)
Rule 1: Allow traffic to:
  - *.amazonaws.com
  - *.ubuntu.com
  - *.npmjs.org
  - *.pythonhosted.org
  - *.docker.io
  - *.github.com
  - api.anthropic.com

Rule 2: Block all other outbound HTTPS

Rule 3: Alert on:
  - Known malicious IPs (threat intel feeds)
  - Suspicious outbound patterns
  - Large data exfiltration attempts
```

**Cost Impact:** ~$0.395/hour + $0.065/GB = ~$288/month + data processing

### 5.3 Egress Monitoring & Alerting

**CloudWatch Metric Filters:**
```
Metric: EgressBytesPerSecond
Threshold: > 1 Gbps sustained for 5 minutes
Action: SNS alert to security team

Metric: NewEgressDestination
Threshold: Connection to IP not in whitelist
Action: SNS alert + Lambda auto-block
```

---

## 6. AWS WAF Configuration

### 6.1 Web ACL Structure

```
Web ACL: spatial-properties-prod-waf
  ├─ Associated with: ALB (api.spatial.properties)
  ├─ Default Action: Allow
  └─ Rules (evaluated in order):
```

### 6.2 WAF Rules

#### Rule 1: AWS Managed - Core Rule Set
```
Name: AWSManagedRulesCommonRuleSet
Priority: 1
Action: Block
Protections:
  - SQLi (SQL injection)
  - XSS (Cross-site scripting)
  - Path traversal
  - Known bad inputs
```

#### Rule 2: AWS Managed - Known Bad Inputs
```
Name: AWSManagedRulesKnownBadInputsRuleSet
Priority: 2
Action: Block
Protections:
  - Log4j vulnerability patterns
  - ShellShock patterns
```

#### Rule 3: Rate Limiting (Per IP)
```
Name: RateLimitPerIP
Priority: 10
Rate Limit: 2,000 requests per 5 minutes per IP
Action: Block (403) for 10 minutes
Scope: All endpoints
```

#### Rule 4: Rate Limiting (API Key)
```
Name: RateLimitPerAPIKey
Priority: 11
Rate Limit: 10,000 requests per 5 minutes per API key
Header: X-API-Key
Action: Block (429) with Retry-After header
Scope: /v1/* endpoints
```

#### Rule 5: Geo-Blocking (Optional)
```
Name: GeoBlockNonAU
Priority: 20
Action: Block
Countries: All except AU, NZ, US, EU (adjust as needed)
Scope: Public endpoints only
Note: Consider impact on global CDN
```

#### Rule 6: IP Reputation List
```
Name: BlockMaliciousIPs
Priority: 5
Action: Block
Source: AWS Managed IP reputation list
Updates: Automatic
```

#### Rule 7: Custom - Protect API Endpoints
```
Name: APIEndpointProtection
Priority: 30
Match Conditions:
  - URI starts with /v1/
  - Missing Authorization header
Action: Block (401)
```

#### Rule 8: Custom - Block Large Payloads
```
Name: BlockLargePayloads
Priority: 40
Match Conditions:
  - Body size > 10 MB
Action: Block (413)
Exception: /v1/packs (allow up to 100 MB for pack uploads)
```

### 6.3 WAF Logging & Monitoring

```
Log Destination: S3 bucket (waf-logs-spatial-props-prod)
Sampling Rate: 100% (all requests)
Retention: 90 days
Format: JSON

CloudWatch Dashboard:
  - Blocked requests by rule
  - Rate limit triggers
  - Top blocked IPs
  - Geographic distribution
```

### 6.4 WAF Terraform Example

```hcl
resource "aws_wafv2_web_acl" "main" {
  name  = "${var.environment}-spatial-properties-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Core rule set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # Rate limiting
  rule {
    name     = "RateLimitPerIP"
    priority = 10

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitPerIPMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.environment}-spatial-properties-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

---

## 7. DDoS Protection Strategy

### 7.1 AWS Shield Standard (Included)
- Automatic protection against common DDoS attacks
- Layer 3/4 protection (SYN floods, UDP reflection)
- No additional cost

### 7.2 AWS Shield Advanced (Optional - $3,000/month)

**Consider for production if:**
- Regulatory requirements
- High-value targets
- Need 24/7 DDoS Response Team (DRT)

**Benefits:**
- Advanced attack detection
- Layer 7 DDoS protection
- Cost protection (DDoS-related scaling costs)
- Access to DRT during attacks

**Recommendation:** Evaluate after 6 months of operation based on attack frequency.

### 7.3 Architectural DDoS Mitigations

#### CloudFront as Shield
- CDN absorbs volumetric attacks
- Geo-fencing capabilities
- Origin cloaking (hide actual origin)

#### Auto-Scaling for Absorption
```
Target Tracking Policy:
  Metric: RequestCountPerTarget
  Target: 1000 requests/target
  Cooldown: 60 seconds
  
Max Capacity: 50 nodes (adjust based on budget)
```

#### Fail2Ban on Bastion
```
[sshd]
enabled = true
maxretry = 3
bantime = 3600
findtime = 600
```

---

## 8. Network Flow Logs

### 8.1 VPC Flow Logs Configuration

```
Resource: VPC (entire VPC)
Traffic Type: ALL (Accept + Reject)
Destination: CloudWatch Logs
Log Format: Custom (include subnet-id, instance-id, action)
Aggregation: 1 minute intervals
Retention: 90 days

Cost: ~$0.50/GB + storage
Estimated: $200-500/month for production
```

### 8.2 Flow Log Analysis

#### Useful Queries
```
# Top rejected connections (potential attacks)
fields @timestamp, srcAddr, dstAddr, dstPort, action
| filter action = "REJECT"
| stats count() by dstPort
| sort count desc

# Data transfer by subnet
fields @timestamp, srcAddr, dstAddr, bytes
| stats sum(bytes) as totalBytes by srcAddr
| sort totalBytes desc

# Unusual outbound destinations
fields @timestamp, srcAddr, dstAddr, dstPort
| filter dstAddr not like /10\.\d+\.\d+\.\d+/
| filter dstAddr not like /172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+/
| stats count() by dstAddr
```

### 8.3 Automated Flow Log Alerting

```
Lambda Function: flow-log-analyzer
Trigger: CloudWatch Logs Subscription (real-time)
Actions:
  - Alert on unusual outbound spikes
  - Alert on rejected connections > 1000/min
  - Alert on new egress destinations not in whitelist
  - Update security group rules dynamically
```

---

## 9. TLS/SSL Strategy

### 9.1 Certificate Management

#### Public-Facing Certificates (ACM)
```
Domain: *.spatial.properties
Provider: AWS Certificate Manager (ACM)
Validation: DNS (CNAME)
Renewal: Automatic (90 days before expiry)
Cost: Free

Domains Covered:
  - api.spatial.properties (ALB)
  - cdn.spatial.properties (CloudFront)
  - www.spatial.properties (optional web)
```

#### Internal Certificates (Private CA - Optional)
```
Use Case: Internal service mesh, mTLS
Provider: AWS Private CA
Cost: $400/month CA + $0.75/cert
Alternative: Use cert-manager + Let's Encrypt in cluster
```

### 9.2 TLS Configuration

#### CloudFront TLS Policy
```
Minimum: TLSv1.2_2021
Ciphers:
  - TLS_AES_128_GCM_SHA256
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256
  - ECDHE-RSA-AES128-GCM-SHA256
  - ECDHE-RSA-AES256-GCM-SHA384

HSTS: Enabled (max-age=31536000)
OCSP Stapling: Enabled
```

#### ALB TLS Policy
```
Policy: ELBSecurityPolicy-TLS-1-2-Ext-2018-06
Minimum: TLSv1.2
Ciphers: AWS-managed strong cipher list
```

### 9.3 Certificate Rotation Monitoring

```
CloudWatch Alarm: ACM Certificate Expiry
Metric: DaysToExpiry
Threshold: < 30 days
Action: SNS alert (should never fire for ACM)

For Private Certificates:
Lambda: Check expiry weekly
Alert: 60 days, 30 days, 7 days before expiry
```

---

## 10. Network Topology Diagrams

### 10.1 Full Production Topology

```
                        ┌──────────────────┐
                        │   Route 53       │
                        │ spatial.prop...  │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐       ┌───────▼────────┐
            │  CloudFront    │       │   ALB (API)    │
            │  (cdn.*)       │       │  (api.*)       │
            └───────┬────────┘       └───────┬────────┘
                    │                        │
                    │ (S3 via OAC)          │ (Target Groups)
                    │                        │
            ┌───────▼────────┐       ┌───────▼────────────────┐
            │ S3 Bucket      │       │  Public Subnets        │
            │ spatial-packs  │       │  10.0.0/24, 10.0.1/24  │
            └────────────────┘       │  • NAT Gateways         │
                                     └───────┬────────────────┘
                                             │
                                     ┌───────▼────────────────┐
                                     │  Private Subnets       │
                                     │  10.0.10-14/23         │
                                     │                        │
                                     │  ┌──────────────────┐  │
                                     │  │  EKS Cluster     │  │
                                     │  │  • Control Plane │  │
                                     │  │  • Worker Nodes  │  │
                                     │  │  • Pods          │  │
                                     │  └────┬─────────────┘  │
                                     └───────┼────────────────┘
                                             │
                                     ┌───────▼────────────────┐
                                     │  Data Subnets          │
                                     │  10.0.20-22/24         │
                                     │                        │
                                     │  ┌────────┐ ┌────────┐ │
                                     │  │  RDS   │ │ Redis  │ │
                                     │  │PostGIS │ │ Cache  │ │
                                     │  └────────┘ └────────┘ │
                                     └────────────────────────┘
```

### 10.2 Multi-Region Topology

```
┌──────────────────────────────────────────────────────────────┐
│                    Route 53 (Global)                          │
│  Health Checks + Failover Routing                             │
└────────┬────────────────────────────────┬────────────────────┘
         │                                │
         │ Primary (ap-southeast-2)       │ DR (ap-southeast-1)
         │                                │
┌────────▼───────────────┐       ┌────────▼───────────────┐
│  VPC 10.0.0.0/16       │       │  VPC 10.1.0.0/16       │
│                        │◄──────►│                        │
│  ┌─────────────────┐   │ Peer  │   ┌─────────────────┐  │
│  │ EKS Cluster     │   │       │   │ EKS Cluster     │  │
│  │ (Active)        │   │       │   │ (Standby)       │  │
│  └─────────────────┘   │       │   └─────────────────┘  │
│                        │       │                        │
│  ┌─────────────────┐   │       │   ┌─────────────────┐  │
│  │ RDS Primary     │───┼───────┼──►│ RDS Read Replica│  │
│  └─────────────────┘   │ Repl  │   └─────────────────┘  │
│                        │       │                        │
│  ┌─────────────────┐   │       │   ┌─────────────────┐  │
│  │ S3 (primary)    │───┼───────┼──►│ S3 (replica)    │  │
│  └─────────────────┘   │ CRR   │   └─────────────────┘  │
└────────────────────────┘       └────────────────────────┘
```

---

## 11. Compliance & Audit

### 11.1 AWS Config Rules

```
Enabled Rules:
  ✓ vpc-sg-open-only-to-authorized-ports
  ✓ vpc-flow-logs-enabled
  ✓ s3-bucket-public-read-prohibited
  ✓ s3-bucket-public-write-prohibited
  ✓ encrypted-volumes
  ✓ rds-encryption-enabled
  ✓ cloudtrail-enabled
  ✓ multi-region-cloudtrail-enabled
```

### 11.2 CloudTrail Logging

```
Trail Name: spatial-properties-org-trail
Multi-Region: Yes
Management Events: Read + Write
Data Events: S3 (spatial-packs bucket)
Encryption: KMS
Log File Validation: Enabled
SNS Notifications: security-alerts topic
```

### 11.3 Network Audit Checklist

**Monthly Review:**
- [ ] Review VPC Flow Logs for anomalies
- [ ] Check for unused security groups
- [ ] Verify no overly permissive rules (0.0.0.0/0 ingress)
- [ ] Review NAT Gateway data transfer costs
- [ ] Validate VPC endpoint usage
- [ ] Check WAF blocked requests
- [ ] Review GuardDuty findings

**Quarterly Review:**
- [ ] Penetration testing
- [ ] Security group rule optimization
- [ ] NACL rule review
- [ ] Certificate expiry check
- [ ] DR failover test

---

## 12. Incident Response Runbooks

### 12.1 Suspected DDoS Attack

**Detection:**
- CloudWatch alarm: RequestCount > 10× baseline
- WAF blocks increasing rapidly
- Auto-scaling hitting max capacity

**Response:**
1. Verify legitimate traffic spike vs attack
2. Enable AWS Shield Advanced (if not already)
3. Contact AWS DDoS Response Team
4. Adjust WAF rate limits down temporarily
5. Enable geo-blocking if attack source identified
6. Scale out capacity (if budget allows)
7. Communicate status to users

### 12.2 Compromised EC2 Instance

**Detection:**
- GuardDuty alert: Unusual network activity
- Flow logs show unexpected egress
- Unauthorized SSH attempts

**Response:**
1. Isolate instance: Update security group to deny all traffic
2. Create snapshot for forensics
3. Terminate instance
4. Review CloudTrail logs for compromise vector
5. Rotate all credentials accessed by instance
6. Deploy replacement from known-good AMI
7. Update security controls to prevent recurrence

### 12.3 S3 Data Exfiltration

**Detection:**
- Unusual S3 GetObject API volume
- Flow logs show large egress to unexpected IP
- Cost anomaly: Data transfer spike

**Response:**
1. Identify source: Review CloudTrail S3 data events
2. Revoke credentials if compromised
3. Update S3 bucket policy: Deny all temporarily
4. Review VPC endpoint policies
5. Enable S3 Object Lock if not already
6. Assess data impact
7. Notification per breach procedures

---

## 13. Network Cost Optimization

### 13.1 Cost Reduction Strategies

| Strategy | Annual Savings | Implementation Effort | Risk |
|----------|----------------|----------------------|------|
| **Use VPC Endpoints** | $500-2,000 | Low | None |
| **Single NAT (dev only)** | $1,032 | Low | High (SPOF) |
| **S3 Gateway Endpoint** | Included free | Low | None |
| **Optimize Data Transfer** | $3,000-10,000 | Medium | Low |
| **Reserved NAT capacity** | Not applicable | - | - |

### 13.2 Data Transfer Optimization

```
Inbound to AWS: Free
Outbound from AWS: $0.09-0.15/GB (tiered)
Inter-region: $0.02/GB
Inter-AZ: $0.01/GB

Optimization Tactics:
1. Use CloudFront for egress (cheaper rates)
2. Keep traffic within same AZ when possible
3. Use VPC endpoints (avoid NAT for AWS services)
4. Compress data before transfer
5. Cache aggressively
```

---

## Appendix A: Quick Reference Tables

### A.1 Port Reference

| Port | Protocol | Service | Security Group |
|------|----------|---------|----------------|
| 22 | TCP | SSH | Bastion → Nodes |
| 443 | TCP | HTTPS | ALB, Internet → ALB |
| 5432 | TCP | PostgreSQL | Nodes → RDS |
| 6379 | TCP | Redis | Nodes → Cache |
| 8080 | TCP | App HTTP | ALB → Nodes |
| 10250 | TCP | Kubelet | Control Plane → Nodes |

### A.2 CIDR Calculator

```
/16 = 65,536 IPs (VPC)
/23 = 512 IPs (private subnets)
/24 = 256 IPs (public, data subnets)
/28 = 16 IPs (management subnets)
```

### A.3 Security Group Relationship Matrix

|  | ALB | EKS-CP | EKS-Nodes | RDS | Cache | Bastion |
|---|-----|--------|-----------|-----|-------|---------|
| **ALB** | ↔ | ✗ | → | ✗ | ✗ | ✗ |
| **EKS-CP** | ✗ | ↔ | ↔ | ✗ | ✗ | ← |
| **EKS-Nodes** | ← | ↔ | ↔ | → | → | ← |
| **RDS** | ✗ | ✗ | ← | ✗ | ✗ | ← |
| **Cache** | ✗ | ✗ | ← | ✗ | ✗ | ← |
| **Bastion** | ✗ | → | → | → | → | ↔ |

Legend: → (initiates), ← (receives), ↔ (bidirectional), ✗ (no connection)

---

## Summary

This network and security architecture provides:

✅ **Defense in Depth:** Multiple layers of security controls
✅ **High Availability:** Multi-AZ deployment for critical components  
✅ **Cost Optimized:** Efficient use of NAT, VPC endpoints, and CloudFront
✅ **Compliance Ready:** Logging, monitoring, and audit trails
✅ **Scalable:** Architecture supports growth to 1PB+ data
✅ **Secure by Default:** All traffic encrypted, least privilege access

**Critical Actions Before Launch:**
1. Replace placeholder office IP ranges with actual CIDRs
2. Request and validate all ACM certificates
3. Enable VPC Flow Logs and CloudTrail
4. Configure WAF rules and test thoroughly
5. Run security group audit (no overly permissive rules)
6. Document all custom configurations in runbooks


---

## 1.4 Data Classification → ABAC Mapping


## 1.4 Data Classification → ABAC Mapping

Classification values used in pack manifests map to authorization attributes:

| Manifest `security.classification` | ABAC Attribute | Default Visibility |
|------------------------------------|----------------|--------------------|
| `public` | `classification=public` | All tenants (no PII) |
| `internal` | `classification=internal` | Tenant roles only (analyst, viewer) |
| `restricted` | `classification=restricted` | Explicit allow lists (`tenant:role`) + additional audit logging |

CDN signed URLs embed `classification` and `tenant` to enforce access at the edge.

## 1.5 Optional mTLS Service Mesh

For environments with higher East‑West trust requirements, enable a lightweight service mesh (e.g., Linkerd) to provide mTLS between services and policy‑driven traffic splitting for canaries. Certificate rotation is automated via cert‑manager; monitor mesh latency overhead in SLOs.

