output "docs_bucket" {
  description = "Docs S3 bucket name"
  value       = aws_s3_bucket.docs.id
}

output "docs_website_endpoint" {
  description = "S3 website endpoint — use as the CloudFront /docs origin domain"
  value       = aws_s3_bucket_website_configuration.docs.website_endpoint
}
