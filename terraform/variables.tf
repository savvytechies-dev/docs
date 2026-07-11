variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "docs_bucket" {
  description = "S3 bucket for the docs site (served as a website endpoint origin)"
  type        = string
  default     = "savvytechies-docs"
}

variable "github_repo" {
  description = "GitHub repo allowed to assume the deploy role (OIDC sub)"
  type        = string
  default     = "savvytechies-dev/docs"
}

variable "distribution_id" {
  description = "Shared CloudFront distribution that serves www.savvytechies.com"
  type        = string
  default     = "E3OEC4DI1YRJ40"
}
