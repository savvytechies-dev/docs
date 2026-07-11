#!/usr/bin/env bash
# One-time bootstrap (run with admin AWS creds): creates the remote-state S3 bucket +
# DynamoDB lock table, and grants the shared github-deployment-role the permissions the
# terraform.yml workflow needs (state, docs bucket, CloudFront). After this, all Terraform
# runs happen in CI with remote state — nothing local.
set -euo pipefail

REGION="us-east-1"
ACCOUNT="145554831595"
STATE_BUCKET="savvytechies-tf-state"
LOCK_TABLE="savvytechies-tf-lock"
ROLE="github-deployment-role"
DOCS_BUCKET="savvytechies-docs"
DIST="E3OEC4DI1YRJ40"

echo "==> 1/3 remote-state S3 bucket"
aws s3api create-bucket --bucket "$STATE_BUCKET" --region "$REGION" 2>/dev/null || echo "   (exists)"
aws s3api put-bucket-versioning --bucket "$STATE_BUCKET" --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket "$STATE_BUCKET" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-public-access-block --bucket "$STATE_BUCKET" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

echo "==> 2/3 DynamoDB lock table"
aws dynamodb create-table --table-name "$LOCK_TABLE" --region "$REGION" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST 2>/dev/null && echo "   created" || echo "   (exists)"

echo "==> 3/3 grant github-deployment-role the Terraform + docs permissions"
aws iam put-role-policy --role-name "$ROLE" --policy-name docs-terraform --policy-document "$(cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TfStateBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::${STATE_BUCKET}", "arn:aws:s3:::${STATE_BUCKET}/*"]
    },
    {
      "Sid": "TfStateLock",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:DescribeTable"],
      "Resource": "arn:aws:dynamodb:${REGION}:${ACCOUNT}:table/${LOCK_TABLE}"
    },
    {
      "Sid": "DocsBucketManage",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::${DOCS_BUCKET}", "arn:aws:s3:::${DOCS_BUCKET}/*"]
    },
    {
      "Sid": "CloudFrontDocsBehavior",
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution",
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListDistributions"
      ],
      "Resource": "*"
    }
  ]
}
JSON
)"
echo "DONE. Push to main (or run the Terraform workflow) to apply the docs infra."
