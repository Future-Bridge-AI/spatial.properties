# Spatial.Properties: IAM Roles & Permissions Matrix

## Executive Summary

This document defines all IAM roles, policies, and permissions for the Spatial.Properties platform, with emphasis on IRSA (IAM Roles for Service Accounts) for EKS workloads. All policies follow the principle of least privilege.

**Key Concepts:**
- **IRSA:** EKS pods assume IAM roles via service accounts
- **Least Privilege:** Minimum permissions required for each function
- **Separation of Duties:** Different roles for different responsibilities
- **Temporary Credentials:** No long-lived access keys

---

## 1. IAM Role Architecture

### 1.1 Role Categories

```
┌─────────────────────────────────────────────────────────┐
│                   AWS Account                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Infrastructure Roles                  │  │
│  │  • EKS Cluster Role                              │  │
│  │  • EKS Node Role                                 │  │
│  │  • Lambda Execution Roles                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │             IRSA Roles (EKS Workloads)           │  │
│  │  • Pack Service                                  │  │
│  │  • MCP Gateway                                   │  │
│  │  • Worker Pools                                  │  │
│  │  • Frontend Service                              │  │
│  │  • Observability Collectors                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │             CI/CD Roles                          │  │
│  │  • GitHub Actions OIDC Role                      │  │
│  │  • Terraform Execution Role                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Human/Admin Roles                    │  │
│  │  • Platform Admin                                │  │
│  │  • Developer (Read-Only)                         │  │
│  │  • SRE                                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Roles

### 2.1 EKS Cluster Role

**Role Name:** `role-prod-eks-cluster`

**Purpose:** Allows EKS to manage AWS resources on your behalf

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Managed Policies:**
- `arn:aws:iam::aws:policy/AmazonEKSClusterPolicy`
- `arn:aws:iam::aws:policy/AmazonEKSVPCResourceController`

**Custom Inline Policy:** None required

---

### 2.2 EKS Node Role

**Role Name:** `role-prod-eks-node`

**Purpose:** Allows EC2 instances to be managed as EKS worker nodes

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Managed Policies:**
- `arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy`
- `arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy`
- `arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly`
- `arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore` (for Session Manager)

**Custom Inline Policy:** `eks-node-additional-policy`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEBSOperations",
      "Effect": "Allow",
      "Action": [
        "ec2:AttachVolume",
        "ec2:CreateSnapshot",
        "ec2:CreateTags",
        "ec2:CreateVolume",
        "ec2:DeleteSnapshot",
        "ec2:DeleteTags",
        "ec2:DeleteVolume",
        "ec2:DescribeInstances",
        "ec2:DescribeSnapshots",
        "ec2:DescribeTags",
        "ec2:DescribeVolumes",
        "ec2:DetachVolume"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### 2.3 Lambda Execution Role (Generic)

**Role Name:** `role-prod-lambda-base`

**Purpose:** Base role for Lambda functions

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Managed Policies:**
- `arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`
- `arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole` (if VPC-enabled)

---

## 3. IRSA Roles (EKS Workloads)

### 3.1 IRSA Trust Policy Template

All IRSA roles use this trust policy pattern:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_PROVIDER}:sub": "system:serviceaccount:${NAMESPACE}:${SERVICE_ACCOUNT}",
          "${OIDC_PROVIDER}:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

**Variables:**
- `${OIDC_PROVIDER}`: e.g., `oidc.eks.ap-southeast-2.amazonaws.com/id/ABC123DEF456`
- `${NAMESPACE}`: Kubernetes namespace (e.g., `spatial-properties`)
- `${SERVICE_ACCOUNT}`: Kubernetes service account name

---

### 3.2 Pack Service Role

**Role Name:** `role-prod-irsa-pack-service`

**Service Account:** `spatial-properties/pack-service`

**Purpose:** Build, publish, and manage Spatial Packs

**Trust Policy:** IRSA template with:
- Namespace: `spatial-properties`
- Service Account: `pack-service`

**Custom Policy:** `policy-pack-service`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3PacksBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:DeleteObject",
        "s3:DeleteObjectVersion",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-packs-${environment}-${region}",
        "arn:aws:s3:::spatial-packs-${environment}-${region}/*"
      ]
    },
    {
      "Sid": "S3STACBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-stac-${environment}-${region}",
        "arn:aws:s3:::spatial-stac-${environment}-${region}/*"
      ]
    },
    {
      "Sid": "KMSEncryptDecrypt",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:${region}:${account}:key/${kms_key_id}"
    },
    {
      "Sid": "SecretsManagerRead",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:${region}:${account}:secret:spatial-properties/*"
    },
    {
      "Sid": "SQSSendMessages",
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:GetQueueUrl"
      ],
      "Resource": "arn:aws:sqs:${region}:${account}:spatial-pack-jobs-*"
    },
    {
      "Sid": "SNSPublish",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:${region}:${account}:spatial-pack-events"
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::${account}:distribution/${distribution_id}"
    },
    {
      "Sid": "DynamoDBSTACIndex",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:${region}:${account}:table/spatial-stac-catalog",
        "arn:aws:dynamodb:${region}:${account}:table/spatial-stac-catalog/index/*"
      ]
    }
  ]
}
```

**Kubernetes Service Account:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pack-service
  namespace: spatial-properties
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::${ACCOUNT_ID}:role/role-prod-irsa-pack-service
```

---

### 3.3 MCP Gateway Role

**Role Name:** `role-prod-irsa-mcp-gateway`

**Service Account:** `spatial-properties/mcp-gateway`

**Purpose:** Orchestrate MCP tool executions

**Custom Policy:** `policy-mcp-gateway`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ReadPacks",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-packs-${environment}-${region}",
        "arn:aws:s3:::spatial-packs-${environment}-${region}/*"
      ]
    },
    {
      "Sid": "SQSJobQueue",
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes",
        "sqs:GetQueueUrl"
      ],
      "Resource": "arn:aws:sqs:${region}:${account}:spatial-mcp-jobs-*"
    },
    {
      "Sid": "SNSPublishResults",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:${region}:${account}:spatial-mcp-results"
    },
    {
      "Sid": "SecretsManagerRead",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:${region}:${account}:secret:spatial-properties/mcp-*"
    },
    {
      "Sid": "KMSDecrypt",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": "arn:aws:kms:${region}:${account}:key/${kms_key_id}"
    },
    {
      "Sid": "DynamoDBJobTracking",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:${region}:${account}:table/spatial-mcp-jobs"
    }
  ]
}
```

---

### 3.4 Worker Pool Role

**Role Name:** `role-prod-irsa-worker`

**Service Account:** `spatial-properties/worker`

**Purpose:** Execute geospatial processing tasks (GDAL, tippecanoe, etc.)

**Custom Policy:** `policy-worker`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3FullPacksAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-packs-${environment}-${region}",
        "arn:aws:s3:::spatial-packs-${environment}-${region}/*"
      ]
    },
    {
      "Sid": "S3LandingBucketRead",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-landing-${environment}-${region}",
        "arn:aws:s3:::spatial-landing-${environment}-${region}/*"
      ]
    },
    {
      "Sid": "KMSEncryptDecrypt",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:${region}:${account}:key/${kms_key_id}"
    },
    {
      "Sid": "SQSJobQueue",
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:ChangeMessageVisibility",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:${region}:${account}:spatial-worker-jobs-*"
    },
    {
      "Sid": "SNSPublishCompletion",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:${region}:${account}:spatial-worker-completion"
    },
    {
      "Sid": "CloudWatchMetrics",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "cloudwatch:namespace": "SpatialProperties/Workers"
        }
      }
    }
  ]
}
```

---

### 3.5 Frontend Service Role

**Role Name:** `role-prod-irsa-frontend`

**Service Account:** `spatial-properties/frontend`

**Purpose:** Serve frontend application, minimal AWS access

**Custom Policy:** `policy-frontend`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ReadStaticAssets",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-frontend-${environment}-${region}",
        "arn:aws:s3:::spatial-frontend-${environment}-${region}/*"
      ]
    },
    {
      "Sid": "CloudWatchLogsWrite",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:${region}:${account}:log-group:/spatial-properties/frontend:*"
    }
  ]
}
```

---

### 3.6 Observability Collector Role (Fluent Bit, OTEL)

**Role Name:** `role-prod-irsa-observability`

**Service Account:** `observability/fluent-bit`, `observability/otel-collector`

**Purpose:** Send logs/metrics/traces to CloudWatch and S3

**Custom Policy:** `policy-observability`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchLogsWrite",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:${region}:${account}:log-group:/spatial-properties/*"
    },
    {
      "Sid": "CloudWatchMetrics",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3LogsArchive",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::spatial-logs-${environment}-${region}/observability/*"
    },
    {
      "Sid": "XRayTraces",
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### 3.7 Cluster Autoscaler Role

**Role Name:** `role-prod-irsa-cluster-autoscaler`

**Service Account:** `kube-system/cluster-autoscaler`

**Purpose:** Scale EKS node groups

**Custom Policy:** `policy-cluster-autoscaler`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AutoscalingGroups",
      "Effect": "Allow",
      "Action": [
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:DescribeAutoScalingInstances",
        "autoscaling:DescribeLaunchConfigurations",
        "autoscaling:DescribeScalingActivities",
        "autoscaling:DescribeTags",
        "autoscaling:SetDesiredCapacity",
        "autoscaling:TerminateInstanceInAutoScalingGroup",
        "ec2:DescribeImages",
        "ec2:DescribeInstanceTypes",
        "ec2:DescribeLaunchTemplateVersions",
        "ec2:GetInstanceTypesFromInstanceRequirements",
        "eks:DescribeNodegroup"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### 3.8 AWS Load Balancer Controller Role

**Role Name:** `role-prod-irsa-aws-load-balancer-controller`

**Service Account:** `kube-system/aws-load-balancer-controller`

**Purpose:** Manage ALB/NLB for ingress

**Managed Policy:** Use AWS-provided policy (changes frequently)
```
arn:aws:iam::${account}:policy/AWSLoadBalancerControllerIAMPolicy
```

Download latest from:
```bash
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
```

---

### 3.9 EBS CSI Driver Role

**Role Name:** `role-prod-irsa-ebs-csi-driver`

**Service Account:** `kube-system/ebs-csi-controller-sa`

**Purpose:** Manage EBS volumes for persistent storage

**Managed Policy:**
```
arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy
```

---

### 3.10 External DNS Role (Optional)

**Role Name:** `role-prod-irsa-external-dns`

**Service Account:** `kube-system/external-dns`

**Purpose:** Automatically manage Route 53 DNS records

**Custom Policy:** `policy-external-dns`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Route53Changes",
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets"
      ],
      "Resource": "arn:aws:route53:::hostedzone/${hosted_zone_id}"
    },
    {
      "Sid": "Route53List",
      "Effect": "Allow",
      "Action": [
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets",
        "route53:ListTagsForResource"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 4. CI/CD Roles

### 4.1 GitHub Actions OIDC Role

**Role Name:** `role-prod-github-actions`

**Purpose:** Allow GitHub Actions to deploy to AWS

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${org}/${repo}:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

**Custom Policy:** `policy-github-actions`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPush",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": [
        "arn:aws:ecr:${region}:${account}:repository/spatial-properties/*"
      ]
    },
    {
      "Sid": "ECRGetToken",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "EKSDescribe",
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters"
      ],
      "Resource": "arn:aws:eks:${region}:${account}:cluster/spatial-properties-${environment}"
    },
    {
      "Sid": "S3FrontendDeploy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-frontend-${environment}-${region}",
        "arn:aws:s3:::spatial-frontend-${environment}-${region}/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::${account}:distribution/${distribution_id}"
    }
  ]
}
```

---

### 4.2 Terraform Execution Role

**Role Name:** `role-prod-terraform`

**Purpose:** Execute Terraform plans/applies

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${org}/spatialprops-infra:*"
        }
      }
    }
  ]
}
```

**Managed Policies:**
- `arn:aws:iam::aws:policy/PowerUserAccess`

**Deny Policy (attached separately):** `policy-terraform-guardrails`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyIAMUserCreation",
      "Effect": "Deny",
      "Action": [
        "iam:CreateUser",
        "iam:CreateAccessKey",
        "iam:DeleteUser"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyOrgChanges",
      "Effect": "Deny",
      "Action": [
        "organizations:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "RequireMFAForSensitive",
      "Effect": "Deny",
      "Action": [
        "rds:DeleteDBInstance",
        "dynamodb:DeleteTable",
        "s3:DeleteBucket"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
```

---

## 5. Human/Admin Roles

### 5.1 Platform Admin Role

**Role Name:** `role-prod-platform-admin`

**Purpose:** Full administrative access (use sparingly)

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${account}:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        },
        "IpAddress": {
          "aws:SourceIp": [
            "${office_cidr}",
            "${vpn_cidr}"
          ]
        }
      }
    }
  ]
}
```

**Managed Policies:**
- `arn:aws:iam::aws:policy/AdministratorAccess`

**Session Duration:** 1 hour (require MFA re-auth)

---

### 5.2 Developer (Read-Only) Role

**Role Name:** `role-prod-developer-readonly`

**Purpose:** Investigate issues, view logs (no modification)

**Trust Policy:** Similar to admin, but no MFA/IP restriction

**Managed Policies:**
- `arn:aws:iam::aws:policy/ReadOnlyAccess`

**Additional Inline Policy:** `policy-developer-eks-read`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EKSReadOnly",
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters",
        "eks:DescribeNodegroup",
        "eks:ListNodegroups"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### 5.3 SRE Role

**Role Name:** `role-prod-sre`

**Purpose:** Operational access (deployments, scaling, troubleshooting)

**Trust Policy:** Assume from identity provider (e.g., Okta, Auth0)

**Custom Policy:** `policy-sre`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EKSFullAccess",
      "Effect": "Allow",
      "Action": "eks:*",
      "Resource": "*"
    },
    {
      "Sid": "EC2InstanceManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:TerminateInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "prod"
        }
      }
    },
    {
      "Sid": "RDSManagement",
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances",
        "rds:ModifyDBInstance",
        "rds:RebootDBInstance"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchFullAccess",
      "Effect": "Allow",
      "Action": "cloudwatch:*",
      "Resource": "*"
    },
    {
      "Sid": "LogsAccess",
      "Effect": "Allow",
      "Action": [
        "logs:*"
      ],
      "Resource": "arn:aws:logs:*:${account}:log-group:/spatial-properties/*"
    },
    {
      "Sid": "S3ReadPacks",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spatial-packs-*",
        "arn:aws:s3:::spatial-packs-*/*"
      ]
    },
    {
      "Sid": "SecretsRead",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:${account}:secret:spatial-properties/*"
    },
    {
      "Sid": "DenyDangerousActions",
      "Effect": "Deny",
      "Action": [
        "rds:DeleteDBInstance",
        "s3:DeleteBucket",
        "dynamodb:DeleteTable"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 6. Cross-Account Access (Optional)

### 6.1 DR Account Access Role

**Scenario:** Production account needs to replicate to DR account

**Role in DR Account:** `role-dr-replication-target`

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${prod_account}:role/role-prod-irsa-pack-service"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Policy:** Allow S3 replication, RDS snapshot copy

---

## 7. Service Account to IAM Role Mapping

### 7.1 Complete Mapping Table

| Namespace | Service Account | IAM Role | Purpose |
|-----------|----------------|----------|---------|
| `spatial-properties` | `pack-service` | `role-prod-irsa-pack-service` | Build/publish packs |
| `spatial-properties` | `mcp-gateway` | `role-prod-irsa-mcp-gateway` | MCP orchestration |
| `spatial-properties` | `worker` | `role-prod-irsa-worker` | Geospatial processing |
| `spatial-properties` | `frontend` | `role-prod-irsa-frontend` | Frontend app |
| `observability` | `fluent-bit` | `role-prod-irsa-observability` | Log collection |
| `observability` | `otel-collector` | `role-prod-irsa-observability` | Metrics/traces |
| `kube-system` | `cluster-autoscaler` | `role-prod-irsa-cluster-autoscaler` | Node autoscaling |
| `kube-system` | `aws-load-balancer-controller` | `role-prod-irsa-aws-load-balancer-controller` | ALB/NLB |
| `kube-system` | `ebs-csi-controller-sa` | `role-prod-irsa-ebs-csi-driver` | EBS volumes |
| `kube-system` | `external-dns` | `role-prod-irsa-external-dns` | Route53 automation |

### 7.2 Terraform Module for IRSA

```hcl
module "irsa_pack_service" {
  source = "./modules/irsa-role"
  
  role_name           = "role-${var.environment}-irsa-pack-service"
  oidc_provider_arn   = aws_iam_openid_connect_provider.eks.arn
  oidc_provider_url   = replace(aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")
  namespace           = "spatial-properties"
  service_account     = "pack-service"
  
  policy_arns = [
    aws_iam_policy.pack_service.arn
  ]
  
  tags = {
    Environment = var.environment
    Service     = "pack-service"
  }
}
```

---

## 8. Least Privilege Validation

### 8.1 IAM Access Analyzer

**Enable in each region:**
```bash
aws accessanalyzer create-analyzer \
  --analyzer-name spatial-properties-analyzer \
  --type ACCOUNT \
  --region ap-southeast-2
```

**Findings to Review:**
- Cross-account access (should be documented)
- Public resources (should be none)
- Unused access (remove quarterly)

### 8.2 IAM Policy Simulator

Test policies before deployment:
```bash
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::${account}:role/role-prod-irsa-pack-service \
  --action-names s3:PutObject \
  --resource-arns arn:aws:s3:::spatial-packs-prod-ap-southeast-2/test-object
```

Expected: `allowed`

### 8.3 Automated Compliance Checks

**AWS Config Rules:**
```
- iam-policy-no-statements-with-admin-access
- iam-root-access-key-check
- iam-user-mfa-enabled
- iam-user-unused-credentials-check
- access-keys-rotated
```

---

## 9. Secrets Management

### 9.1 Secrets Manager Naming Convention

```
spatial-properties/{environment}/{service}/{secret-name}

Examples:
  spatial-properties/prod/pack-service/database-password
  spatial-properties/prod/mcp-gateway/anthropic-api-key
  spatial-properties/prod/common/jwt-signing-key
```

### 9.2 IRSA + Secrets Manager Integration

**Kubernetes External Secrets Operator:**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: spatial-properties
spec:
  provider:
    aws:
      service: SecretsManager
      region: ap-southeast-2
      auth:
        jwt:
          serviceAccountRef:
            name: pack-service

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: pack-service-secrets
  namespace: spatial-properties
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: pack-service-secrets
    creationPolicy: Owner
  data:
    - secretKey: database-password
      remoteRef:
        key: spatial-properties/prod/pack-service/database-password
```

### 9.3 Secret Rotation

**Automatic Rotation (RDS/Aurora):**
```bash
aws secretsmanager rotate-secret \
  --secret-id spatial-properties/prod/pack-service/database-password \
  --rotation-lambda-arn arn:aws:lambda:ap-southeast-2:${account}:function:SecretsManagerRDSPostgreSQLRotationSingleUser \
  --rotation-rules AutomaticallyAfterDays=30
```

---

## 10. Terraform Implementation Examples

### 10.1 Complete IRSA Module

**`modules/irsa-role/main.tf`:**
```hcl
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    
    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }
    
    actions = ["sts:AssumeRoleWithWebIdentity"]
    
    condition {
      test     = "StringEquals"
      variable = "${var.oidc_provider_url}:sub"
      values   = ["system:serviceaccount:${var.namespace}:${var.service_account}"]
    }
    
    condition {
      test     = "StringEquals"
      variable = "${var.oidc_provider_url}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "this" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "this" {
  for_each = toset(var.policy_arns)
  
  role       = aws_iam_role.this.name
  policy_arn = each.value
}
```

### 10.2 Pack Service Policy

**`policies/pack-service.tf`:**
```hcl
data "aws_iam_policy_document" "pack_service" {
  statement {
    sid    = "S3PacksBucketAccess"
    effect = "Allow"
    
    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:DeleteObject",
      "s3:DeleteObjectVersion",
      "s3:ListBucket"
    ]
    
    resources = [
      aws_s3_bucket.spatial_packs.arn,
      "${aws_s3_bucket.spatial_packs.arn}/*"
    ]
  }
  
  statement {
    sid    = "KMSEncryptDecrypt"
    effect = "Allow"
    
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey"
    ]
    
    resources = [aws_kms_key.main.arn]
  }
  
  # ... additional statements
}

resource "aws_iam_policy" "pack_service" {
  name   = "policy-${var.environment}-pack-service"
  policy = data.aws_iam_policy_document.pack_service.json
}
```

---

## 11. Audit & Compliance

### 11.1 Monthly IAM Audit Checklist

**Access Review:**
- [ ] No IAM users with access keys (use SSO/IRSA only)
- [ ] All roles have MFA where applicable
- [ ] No overly permissive policies (`*:*` actions)
- [ ] Unused roles identified and removed
- [ ] Service accounts match deployed services

**Policy Review:**
- [ ] All policies follow least privilege
- [ ] No inline policies (use managed where possible)
- [ ] Resource ARNs are specific (not `*`)
- [ ] Condition statements applied where appropriate

**Trust Relationship Review:**
- [ ] IRSA trust policies match actual service accounts
- [ ] No wildcards in trust policies
- [ ] Cross-account access documented

### 11.2 CloudTrail Monitoring

**Key Events to Alert On:**
```
- IAM policy changes (CreatePolicy, PutRolePolicy)
- Role assumption from unexpected IPs
- Failed AssumeRole attempts (>10 in 5 minutes)
- Changes to KMS key policies
- S3 bucket policy modifications
- Security group changes
```

**CloudWatch Insights Query:**
```
fields @timestamp, userIdentity.principalId, eventName, errorCode
| filter eventSource = "iam.amazonaws.com"
| filter eventName like /Policy/
| sort @timestamp desc
| limit 100
```

---

## 12. Emergency Procedures

### 12.1 Compromised IAM Credentials

**Detection:**
- GuardDuty alert: Unusual API activity
- CloudTrail: API calls from unexpected regions/IPs

**Response:**
1. Identify affected role/user
2. Attach deny-all policy immediately:
```bash
aws iam put-role-policy \
  --role-name ${ROLE_NAME} \
  --policy-name EmergencyDeny \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Deny","Action":"*","Resource":"*"}]}'
```
3. Revoke active sessions:
```bash
aws sts assume-role --role-arn ${ROLE_ARN} --role-session-name invalidate
```
4. Investigate extent of compromise (CloudTrail)
5. Rotate affected secrets
6. Remove deny policy, restore least privilege
7. Post-mortem

### 12.2 Lost Access to Critical Role

**Scenario:** IRSA configuration error, can't access pack-service

**Recovery:**
1. Use bastion host with admin role
2. Verify OIDC provider configuration
3. Check service account annotation
4. Validate IAM trust policy
5. Test with `aws sts assume-role-with-web-identity`
6. Fix and redeploy

---

## Summary & Quick Reference

### Key Principles
✅ **IRSA for all workloads** - No long-lived credentials in pods
✅ **Least privilege** - Only necessary permissions
✅ **Separate roles** - One role per service
✅ **MFA for humans** - Require MFA for admin roles
✅ **Audit everything** - CloudTrail + Config + Access Analyzer

### Critical Actions Before Launch
1. ✅ Enable IRSA on EKS cluster
2. ✅ Create OIDC provider in IAM
3. ✅ Deploy all IRSA roles via Terraform
4. ✅ Annotate service accounts correctly
5. ✅ Test each role with IAM Policy Simulator
6. ✅ Enable CloudTrail + Config
7. ✅ Set up IAM Access Analyzer
8. ✅ Document all cross-account access

### Role Count Summary
- **Infrastructure Roles:** 3
- **IRSA Roles:** 10
- **CI/CD Roles:** 2
- **Human Roles:** 3
- **Total:** 18 roles

### Cost Impact
- **IRSA:** No additional cost
- **IAM Access Analyzer:** Free for account-level analysis
- **Secrets Manager:** ~$0.40/secret/month
- **CloudTrail:** ~$2/100K events + S3 storage

**Estimated Monthly IAM-Related Cost:** $50-100 (mostly Secrets Manager)


---

## 13. SSO & Session Management


## 13. SSO & Session Management

Integrate Identity Provider (Okta/Auth0/Cognito Federation) for human roles using SAML or OIDC. Enforce:
- MFA for all admin roles
- Session duration ≤ 1 hour for privileged roles
- Device posture checks (where supported)

## 14. Permission Boundaries & Guardrails

Attach permission boundaries to CI/CD and Terraform roles to prevent creation of overly permissive policies or IAM users. Example boundary denies `iam:*` mutations outside approved prefixes and restricts destructive actions without MFA context (see `policy-terraform-guardrails`).

## 15. Quarterly IAM Hygiene

Automate detection of unused roles/policies and prune quarterly. Require ticketed justification for any wildcard `Resource: "*"` statements; replace with specific ARNs where possible.

# IAM Roles & Permissions — Marketplace and Edge Additions

## 0. Principles (Unchanged)

IRSA everywhere; least privilege; MFA for humans; audit all actions.

## 1. New Roles

### IRSA
- `role/sp-edge-sync` — publish/consume Edge Sync subjects; presign limited URLs; write DTN queues.  
- `role/sp-marketplace-api` — CRUD listings; run pre‑publish checks; read license/provenance; emit billing events.  
- `role/sp-device-ca` — issue/rotate/revoke device certs (scoped via path/ARN).

### Human
- `role/human-publisher-admin` — onboarding and delist; view revenue reports.  
- `role/human-venue-operator` — manage beacons in owned venues.

## 2. Permission Boundaries

- Marketplace roles blocked from direct S3 object writes outside `marketplace/` prefixes.  
- Edge Sync roles cannot alter Pack manifests; presign only for **CSP‑1** paths.

## 3. Session & SSO

- Session ≤ 1h for privileged roles; device posture checks where possible.

## 4. Hygiene

- Quarterly prune; report any wildcard Resource statements; rotate marketplace/billing keys.
