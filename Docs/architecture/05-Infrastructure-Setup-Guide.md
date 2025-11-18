# Spatial.Properties: SRE Infrastructure Setup Guide

## Target Audience
SREs with zero prior context on this project

## Outcome
Reachable EKS cluster with:
- Autoscaling + IRSA (IAM Roles for Service Accounts)
- Secure S3 with KMS & lifecycle policies
- CDN with OAC & Range/CORS support
- CI/CD pipeline ready
- Base observability stack

## Brand Context
Use `spatial.properties` domain and **Spatial Packs** naming throughout. The brand palette guides UI, docs, and dashboards—not infrastructure. However, set Grafana theme colors to reflect:
- **Primary:** Muted Teal `#02b0ad`
- **Accents:** Pink `#f1456d` + Orange `#fe8305`
- Good contrast per accessibility standards

Maintain tone: **confident and helpful** in runbooks and status pages.

---

## 0. Prerequisites

### Required Access
- AWS account with bootstrap admin role
- Domain control for `spatial.properties`

### Required Tools
- `aws` CLI v2
- `kubectl` v1.29+
- `helm` v3+
- `terraform` v1.7+
- `eksctl` (optional)
- `jq`
- `yq`
- `openssl`

### Repository Structure
```
spatialprops-infra/
├── terraform/
│   ├── envs/
│   └── modules/
├── helm/
├── scripts/
└── .github/
    └── workflows/
```

### Environment Setup

Export these variables for your session:

```bash
export ORG="spatialprops"
export ENV="dev"
export AWS_REGION="ap-southeast-2"    # WA-friendly region
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
```

---

## E1.1 — VPC & EKS Cluster (IRSA + Autoscaling)

### Step 1: Terraform State Bootstrap

Create S3 bucket and DynamoDB table for Terraform state management:

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://tfstate-${ORG}-${ENV}-${AWS_REGION} --region ${AWS_REGION}

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name tf-lock-${ORG}-${ENV}-${AWS_REGION} \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ${AWS_REGION}
```

**Next:** Create `terraform/versions.tf` with providers and backend configuration, then initialize with the bucket/table above.

---

### Step 2: VPC Configuration

Use the **AWS VPC Terraform module** with:
- **Availability Zones:** 3
- **Subnets:** Public and private in each AZ
- **NAT Gateway:** Single NAT is fine for dev (use one per AZ for production)

**Example Terraform snippet:**
```hcl
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "${var.org}-${var.env}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true  # Change to false for production
  
  tags = {
    Environment = var.env
    Project     = "spatial-properties"
  }
}
```

---

### Step 3: EKS Cluster with IRSA

Use the **AWS EKS Terraform module**:

**Configuration:**
- `cluster_version`: 1.30
- `enable_irsa`: true
- Private API enabled
- Public API also allowed initially
- Node Group: e.g., `m6i.large`, min=2, desired=3, max=6

**Example Terraform snippet:**
```hcl
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "${var.org}-${var.env}-eks"
  cluster_version = "1.30"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  enable_irsa = true
  
  eks_managed_node_groups = {
    main = {
      min_size     = 2
      max_size     = 6
      desired_size = 3
      
      instance_types = ["m6i.large"]
    }
  }
}
```

**Verify the cluster:**

```bash
# Update kubeconfig
aws eks update-kubeconfig --region ${AWS_REGION} --name ${ORG}-${ENV}-eks

# Verify nodes are ready
kubectl get nodes
```

---

### Step 4: Base Kubernetes Controllers

Install essential controllers:

#### Metrics Server
Required for Horizontal Pod Autoscaler

```bash
helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
helm upgrade --install metrics-server metrics-server/metrics-server \
  -n kube-system \
  --set args="{--kubelet-insecure-tls}"
```

#### Cluster Autoscaler
With IRSA enabled

```bash
# Install via Helm or kubectl
# Ensure IRSA role has appropriate ASG permissions
```

#### AWS Load Balancer Controller
For ALB/NLB ingress support

```bash
helm repo add eks https://aws.github.io/eks-charts
kubectl create ns aws-lbc || true

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n aws-lbc \
  --set clusterName=${ORG}-${ENV}-eks \
  --set region=${AWS_REGION} \
  --set vpcId=$(aws eks describe-cluster --name ${ORG}-${ENV}-eks --region ${AWS_REGION} \
      --query "cluster.resourcesVpcConfig.vpcId" --output text)
```

---

### Acceptance Criteria (E1.1)

- ✅ Nodes are Ready (2–3 minimum)
- ✅ OIDC issuer present (IRSA enabled)
- ✅ Metrics Server running
- ✅ Cluster Autoscaler running
- ✅ AWS Load Balancer Controller running

**Validation:**
```bash
kubectl get nodes
kubectl get pods -n kube-system
kubectl get pods -n aws-lbc
```

---

## E1.2 — Object Store (S3) with KMS & Lifecycle

### Step 1: KMS Customer Managed Key

Create a KMS key for data encryption:

```bash
aws kms create-key \
  --description "KMS for ${ORG}-${ENV} data" \
  --key-usage ENCRYPT_DECRYPT \
  --origin AWS_KMS \
  --region ${AWS_REGION}

# Get the key ID
KMS_KEY_ID=$(aws kms list-keys --query 'Keys[0].KeyId' --output text --region ${AWS_REGION})
```

---

### Step 2: Create S3 Buckets

Create three buckets:

1. **`spatial-packs-*`** — Spatial Pack assets (PMTiles/COG/Parquet)
2. **`spatial-stac-*`** — STAC collections/items
3. **`spatial-logs-*`** — Access logs

```bash
for B in spatial-packs spatial-stac spatial-logs; do
  # Create bucket
  aws s3api create-bucket \
    --bucket ${B}-${ORG}-${ENV}-${AWS_REGION} \
    --region ${AWS_REGION} \
    --create-bucket-configuration LocationConstraint=${AWS_REGION}
  
  # Block public access
  aws s3api put-public-access-block \
    --bucket ${B}-${ORG}-${ENV}-${AWS_REGION} \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  
  # Enable KMS encryption
  aws s3api put-bucket-encryption \
    --bucket ${B}-${ORG}-${ENV}-${AWS_REGION} \
    --server-side-encryption-configuration \
      '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"'"${KMS_KEY_ID}"'"}}]}'
  
  # Enable versioning
  aws s3api put-bucket-versioning \
    --bucket ${B}-${ORG}-${ENV}-${AWS_REGION} \
    --versioning-configuration Status=Enabled
done
```

---

### Step 3: Logging & Lifecycle Policies

#### Enable Logging
Configure `spatial-packs` and `spatial-stac` to log to `spatial-logs`:

```bash
# Example for spatial-packs bucket
aws s3api put-bucket-logging \
  --bucket spatial-packs-${ORG}-${ENV}-${AWS_REGION} \
  --bucket-logging-status \
    '{"LoggingEnabled":{"TargetBucket":"spatial-logs-'"${ORG}-${ENV}-${AWS_REGION}"'","TargetPrefix":"spatial-packs/"}}'
```

#### Lifecycle Transitions
Add lifecycle rules for cost optimization:

```json
{
  "Rules": [
    {
      "Id": "TransitionNonCurrentVersions",
      "Status": "Enabled",
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "NoncurrentDays": 90,
          "StorageClass": "GLACIER_IR"
        }
      ],
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 365
      }
    }
  ]
}
```

#### CORS Configuration
Enable CORS for asset buckets:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": [
        "ETag",
        "Accept-Ranges",
        "Content-Range",
        "Content-Length",
        "Content-Type"
      ],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors \
  --bucket spatial-packs-${ORG}-${ENV}-${AWS_REGION} \
  --cors-configuration file://cors-config.json
```

---

### Acceptance Criteria (E1.2)

- ✅ All three buckets exist
- ✅ KMS encryption enabled
- ✅ Versioning enabled
- ✅ Public access blocked
- ✅ Lifecycle rules active
- ✅ CORS configured on asset buckets

**Validation:**
```bash
aws s3 ls | grep spatial
aws s3api get-bucket-encryption --bucket spatial-packs-${ORG}-${ENV}-${AWS_REGION}
aws s3api get-bucket-versioning --bucket spatial-packs-${ORG}-${ENV}-${AWS_REGION}
```

---

## E1.3 — CDN (CloudFront) with OAC, Range, CORS

### Step 1: TLS Certificate (us-east-1)

**Important:** CloudFront certificates must be in `us-east-1`.

```bash
export CF_REGION="us-east-1"
export CDN_DOMAIN="cdn.spatial.properties"

# Request certificate
aws acm request-certificate \
  --domain-name ${CDN_DOMAIN} \
  --validation-method DNS \
  --region ${CF_REGION}

# Get certificate ARN
CERT_ARN=$(aws acm list-certificates --region ${CF_REGION} \
  --query 'CertificateSummaryList[?DomainName==`'${CDN_DOMAIN}'`].CertificateArn' \
  --output text)
```

**Action Required:**
1. Add DNS CNAME record for validation
2. Wait for certificate status: `ISSUED`

---

### Step 2: Create Origin Access Control (OAC) and Distribution

#### Create OAC
```bash
aws cloudfront create-origin-access-control \
  --origin-access-control-config \
    Name="${ORG}-${ENV}-oac",\
    SigningProtocol=sigv4,\
    SigningBehavior=always,\
    OriginAccessControlOriginType=s3
```

#### Create CloudFront Distribution

**Configuration Requirements:**
- **Origin:** `spatial-packs-${ORG}-${ENV}-${AWS_REGION}.s3.${AWS_REGION}.amazonaws.com`
- **Cache Behavior:**
  - Methods: GET, HEAD only
  - Compress: true
  - Cache Policy: CachingOptimized
- **Viewer Certificate:**
  - ACM certificate from above
  - TLS: v1.2_2021
- **Associate OAC**

**Update S3 Bucket Policy:**
Restrict S3 bucket access to CloudFront only:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::spatial-packs-${ORG}-${ENV}-${AWS_REGION}/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::${AWS_ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}"
        }
      }
    }
  ]
}
```

---

### Step 3: DNS Configuration

Create CNAME record:

```
cdn.spatial.properties → d123abc456def.cloudfront.net
```

---

### Step 4: Validate Range Requests & CORS

```bash
# Test basic access
curl -I https://${CDN_DOMAIN}/path/to/asset.pmtiles

# Test range requests
curl -H "Range: bytes=0-1023" -I https://${CDN_DOMAIN}/path/to/large.pmtiles
```

**Expected Response Headers:**
- `Accept-Ranges: bytes`
- `Access-Control-Allow-Origin: *`
- `Content-Range: bytes 0-1023/...`

---

### Acceptance Criteria (E1.3)

- ✅ Distribution deployed
- ✅ Custom domain resolves
- ✅ `Accept-Ranges: bytes` header present
- ✅ CORS headers present
- ✅ TLS certificate valid

**Validation:**
```bash
curl -I https://${CDN_DOMAIN}/
dig ${CDN_DOMAIN}
```

---

## E1.4 — CI/CD (GitHub Actions → ECR → Helm to EKS)

### Step 1: Create ECR Repositories

Create one repository per service:

```bash
for REPO in pack-service frontend mcp-gateway; do
  aws ecr create-repository \
    --repository-name ${ORG}/${REPO} \
    --region ${AWS_REGION}
done
```

---

### Step 2: GitHub OIDC → AWS

#### Create OIDC Identity Provider

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 1234567890abcdef1234567890abcdef12345678
```

#### Create IAM Role for GitHub Actions

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

**Permissions:**
- ECR: Push images
- EKS: Describe cluster
- STS: AssumeRole

---

### Step 3: GitHub Workflow Example

**`.github/workflows/deploy-pack-service.yml`:**

```yaml
name: Deploy Pack Service

on:
  push:
    branches: [main]
    paths:
      - 'services/pack-service/**'

permissions:
  id-token: write
  contents: read

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}
      
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: spatialprops/pack-service
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region ${{ vars.AWS_REGION }} --name spatialprops-dev-eks
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install pack-service ./helm/pack-service \
            --set image.tag=${{ github.sha }} \
            --namespace spatial-properties \
            --create-namespace
```

---

### Acceptance Criteria (E1.4)

- ✅ ECR repositories created
- ✅ GitHub OIDC provider configured
- ✅ IAM role with appropriate permissions
- ✅ PR builds and tests pass
- ✅ Merges push images to ECR
- ✅ Helm deploys roll pods successfully

**Validation:**
- Check GitHub Actions logs
- Verify images in ECR
- Check pod status in EKS

---

## E1.5 — Observability Base

### Step 1: Create Namespace & Add Helm Repos

```bash
kubectl create namespace observability

# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

---

### Step 2: Install kube-prometheus-stack

```bash
helm upgrade --install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace observability \
  --set prometheus.prometheusSpec.retention=15d \
  --set grafana.enabled=true \
  --set grafana.adminPassword='changeme123!'
```

**Components Installed:**
- Prometheus
- Alertmanager
- Grafana
- Node Exporter
- kube-state-metrics

---

### Step 3: Install Loki + Promtail (Logs)

```bash
helm upgrade --install loki grafana/loki-stack \
  --namespace observability \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=10Gi \
  --set promtail.enabled=true
```

---

### Step 4: Install Tempo + OpenTelemetry Collector (Traces)

```bash
helm upgrade --install tempo grafana/tempo \
  --namespace observability

helm upgrade --install opentelemetry-collector \
  open-telemetry/opentelemetry-collector \
  --namespace observability
```

---

### Step 5: Grafana Provisioning

Create ConfigMap to auto-add data sources:

**`grafana-datasources.yaml`:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: observability
  labels:
    grafana_datasource: "1"
data:
  datasources.yaml: |
    apiVersion: 1
    datasources:
      - name: Prometheus
        type: prometheus
        url: http://kube-prometheus-stack-prometheus:9090
        isDefault: true
      - name: Loki
        type: loki
        url: http://loki:3100
      - name: Tempo
        type: tempo
        url: http://tempo:3100
```

Apply the ConfigMap:
```bash
kubectl apply -f grafana-datasources.yaml
```

---

### Step 6: Access Grafana

```bash
# Port forward to access locally
kubectl port-forward -n observability \
  svc/kube-prometheus-stack-grafana 3000:80

# Access at: http://localhost:3000
# Username: admin
# Password: changeme123!
```

---

### Step 7: Apply Brand Theme

In Grafana settings, customize:
- **Primary Color:** #02b0ad (Muted Teal)
- **Accent Colors:** #f1456d (Pink), #fe8305 (Orange)
- Ensure good contrast for accessibility

---

### Acceptance Criteria (E1.5)

- ✅ Prometheus targets are up
- ✅ Logs visible in Loki
- ✅ Traces visible in Tempo
- ✅ Grafana dashboards render
- ✅ All data sources connected

**Validation:**
```bash
kubectl get pods -n observability
kubectl get svc -n observability

# Check Prometheus targets
kubectl port-forward -n observability svc/kube-prometheus-stack-prometheus 9090:9090
# Visit: http://localhost:9090/targets
```

---

## Verification Checklist (E1 Exit Criteria)

### ✅ E1.1 — VPC & EKS
- [ ] EKS cluster accessible
- [ ] IRSA enabled
- [ ] Autoscaling configured
- [ ] Load Balancer Controller running

### ✅ E1.2 — Object Storage
- [ ] S3 buckets created (`spatial-packs`, `spatial-stac`, `spatial-logs`)
- [ ] KMS encryption enabled
- [ ] Versioning enabled
- [ ] Lifecycle policies active
- [ ] CORS configured

### ✅ E1.3 — CDN
- [ ] CloudFront distribution deployed
- [ ] Custom domain resolves
- [ ] OAC configured
- [ ] TLS certificate valid
- [ ] Range requests working
- [ ] CORS headers present

### ✅ E1.4 — CI/CD
- [ ] ECR repositories created
- [ ] GitHub OIDC configured
- [ ] Workflow builds and deploys successfully

### ✅ E1.5 — Observability
- [ ] Prometheus collecting metrics
- [ ] Loki collecting logs
- [ ] Tempo collecting traces
- [ ] Grafana dashboards accessible

---

## Common Pitfalls & Fixes

### 403 Errors via CDN
**Symptom:** CloudFront returns 403 when accessing assets

**Causes:**
- OAC not granted in S3 bucket policy
- Origin domain not using regional S3 endpoint

**Fix:**
1. Verify S3 bucket policy includes CloudFront service principal
2. Ensure origin domain is `bucket-name.s3.region.amazonaws.com` (not s3.amazonaws.com)

---

### Autoscaler Not Scaling
**Symptom:** Cluster doesn't scale despite load

**Causes:**
- Metrics Server not running
- IAM role missing ASG permissions

**Fix:**
```bash
# Check Metrics Server
kubectl get pods -n kube-system | grep metrics-server

# Check Autoscaler logs
kubectl logs -n kube-system -l app=cluster-autoscaler
```

---

### Grafana Dashboards Empty
**Symptom:** No data in Grafana dashboards

**Causes:**
- Data source provisioning label mismatch
- Data sources not in correct namespace

**Fix:**
1. Verify ConfigMap has label `grafana_datasource: "1"`
2. Check namespace matches Grafana installation
3. Restart Grafana pods

---

### OIDC Role Errors
**Symptom:** GitHub Actions can't assume AWS role

**Causes:**
- Trust relationship conditions don't match repo/branch
- OIDC provider not created

**Fix:**
1. Verify trust policy matches exactly: `repo:ORG/REPO:ref:refs/heads/BRANCH`
2. Check OIDC provider exists in IAM

---

## Rollback / Cleanup (Non-Production)

### Quick Teardown for Dev/Test

```bash
# Uninstall Helm releases
helm uninstall -n observability kube-prometheus-stack
helm uninstall -n observability loki
helm uninstall -n observability tempo
helm uninstall -n aws-lbc aws-load-balancer-controller

# Delete namespaces
kubectl delete namespace observability
kubectl delete namespace aws-lbc
kubectl delete namespace spatial-properties

# Disable CloudFront distribution first
aws cloudfront get-distribution-config --id ${DISTRIBUTION_ID} > dist-config.json
# Edit and set Enabled to false, then update
aws cloudfront update-distribution --id ${DISTRIBUTION_ID} --if-match ${ETAG} --distribution-config file://updated-config.json

# Wait for distribution to be disabled, then delete
aws cloudfront delete-distribution --id ${DISTRIBUTION_ID} --if-match ${NEW_ETAG}

# Empty and delete S3 buckets
for B in spatial-packs spatial-stac spatial-logs; do
  aws s3 rm s3://${B}-${ORG}-${ENV}-${AWS_REGION} --recursive
  aws s3api delete-bucket --bucket ${B}-${ORG}-${ENV}-${AWS_REGION}
done

# Destroy Terraform resources
cd terraform/
terraform destroy -auto-approve
```

---

## Next Steps

After completing E1 (Foundations), proceed to:

1. **E2** — Develop Spatial Pack specification and validators
2. **E3** — Build Pack Service APIs
3. **E4** — Implement worker pipelines
4. Refer to **Implementation Plan** document for complete epic sequence

---

## Support & Documentation

### Internal Resources
- **Design Document:** See complete architecture and data model docs
- **Implementation Plan:** Detailed WBS and timelines
- **Runbooks:** (To be created in E9/E16)

### External Resources
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

### Escalation
For issues blocking progress:
1. Check troubleshooting section above
2. Review AWS CloudWatch logs
3. Escalate to Platform Engineering team
4. Document issue for runbook updates


---

## Infrastructure Tagging, Variables, and Security Scanning


## Infrastructure Tagging & Policy Guardrails

Apply required tags to all resources (enforced by CI policy checks):

```
Environment=dev|staging|prod
Project=spatial-properties
Service=<service-name>
CostCenter=<team>
Owner=<email>
```

## Terraform Variables & Environments

Create `terraform/envs/{dev,staging,prod}.tfvars` with:
```
org           = "spatialprops"
env           = "dev"
aws_region    = "ap-southeast-2"
domain        = "spatial.properties"
tags          = { Project = "spatial-properties", Environment = "dev" }
```

Use `terraform workspace` per environment. Validate with `terraform validate` and `tflint` in CI.

## Security Scanning

- Container scanning: Trivy on all images (fail build on HIGH/CRITICAL).
- IaC scanning: tfsec/checkov on Terraform.
- Cluster baseline: kube-bench and kube-hunter in staging quarterly.



--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


# SRE Infrastructure Setup — Edge & Marketplace Additions

> This extends the existing guide with **optional** components for agents.

## 0. Prereqs (No Change)

EKS + IRSA, S3/KMS, CloudFront OAC, CI/CD, Observability.

## 1. Edge Sync Service (New)

### 1.1 Deploy Service
- Namespace `edge-sync`  
- Deploy NATS (JetStream) or connect to managed broker  
- Configure subjects: `edge.peer.sync`, `edge.beacon.updated`, `security.replay.detected`

### 1.2 DTN Gateway
- Deploy store-and-forward queue (S3-backed)  
- Configure satellite/LPWAN uplink adapters (placeholder containers)  
- Set envelope size ≤ 50 KB for hint/claim payloads

### 1.3 P2P Bridge (Optional)
- Deploy libp2p sidecar or NATS leaf‑node bridge  
- Rate-limit and sign exchanges

### 1.4 Beacon Registry
- Deploy `beacons` API (Edge Sync) and admin UI  
- Store beacon → packet pointers (no PII)  
- Rotation job for short TTLs

## 2. Device Identity (New)

- Issue device certificates via internal CA (ACM PCA or Vault PKI)  
- Automate rotation (≤ 30 days) and revocation list updates  
- Enable **mTLS** for agent-class clients to CDN presigner/Edge Sync

## 3. Marketplace (New)

- Deploy `marketplace-api` and `marketplace-ui`  
- Configure billing hooks (stub in dev)  
- Connect to License/Provenance service for pre‑publish gates

## 4. Observability (Additions)

- Dashboards: DTN backlog, mesh convergence, beacon updates, certificate rotations  
- Alerts: replay detected, invalid attestation rate, delist spikes

## 5. Rollback & Cleanup (Additions)

- Disable P2P bridge first; drain DTN queues; revoke device certs for compromised cohorts; export beacon registry per venue.
