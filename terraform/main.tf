terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Remote state recommended before team use:
  # backend "s3" { bucket = "savvytechies-tf-state" key = "docs/terraform.tfstate" region = "us-east-1" dynamodb_table = "savvytechies-tf-lock" }
}

provider "aws" {
  region = var.region
}

# ---------------------------------------------------------------------------
# Docs S3 bucket — served as an S3 *website endpoint* origin (matches the main
# site), so directory-index (/docs/x/ -> docs/x/index.html) is handled by S3.
# Objects are published under the "docs/" key prefix by the deploy workflow.
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "docs" {
  bucket = var.docs_bucket
}

resource "aws_s3_bucket_website_configuration" "docs" {
  bucket = aws_s3_bucket.docs.id
  index_document { suffix = "index.html" }
  error_document { key = "docs/404.html" }
}

# Public-read (public documentation, fronted by CloudFront). Mirrors the site bucket.
resource "aws_s3_bucket_public_access_block" "docs" {
  bucket                  = aws_s3_bucket.docs.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "docs" {
  bucket = aws_s3_bucket.docs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadDocs"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.docs.arn}/*"
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.docs]
}

# ---------------------------------------------------------------------------
# GitHub Actions OIDC deploy role — scoped to the docs bucket + invalidation.
# Reuses the existing GitHub OIDC provider created for the website.
# ---------------------------------------------------------------------------
data "aws_caller_identity" "current" {}

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "docs_deploy" {
  name = "docs-deployment-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = data.aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        StringLike   = { "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*" }
      }
    }]
  })
}

resource "aws_iam_role_policy" "docs_deploy" {
  name = "docs-deploy"
  role = aws_iam_role.docs_deploy.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "S3List"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.docs.arn
      },
      {
        Sid      = "S3Write"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.docs.arn}/*"
      },
      {
        Sid      = "CloudFrontInvalidate"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
        Resource = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${var.distribution_id}"
      }
    ]
  })
}
