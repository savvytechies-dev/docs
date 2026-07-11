terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Remote state — no local state. Bootstrap the state bucket + lock table once
  # with terraform/bootstrap.sh (see DEPLOYMENT.md), then this backend is used by
  # the terraform.yml GitHub workflow.
  backend "s3" {
    bucket         = "savvytechies-tf-state"
    key            = "docs/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "savvytechies-tf-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
}

# ---------------------------------------------------------------------------
# Docs S3 bucket — served as an S3 *website endpoint* origin (matches the main
# site), so directory-index (/docs/x/ -> docs/x/index.html) is handled by S3.
# Objects are published under the "docs/" key prefix by the deploy workflow.
# Deploys and this Terraform both assume the shared github-deployment-role
# (AWS_ROLE_ARN secret), whose trust already covers repo:savvytechies-dev/*.
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
