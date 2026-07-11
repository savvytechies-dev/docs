# Docs Deployment

The docs are a static Astro Starlight site served at **https://www.savvytechies.com/docs**
(a subdirectory of the marketing site, chosen for SEO). CI builds and syncs to an S3 bucket
under the `docs/` key prefix; a `/docs/*` behavior on the shared CloudFront distribution
(`E3OEC4DI1YRJ40`) serves it.

## Architecture
```
push to main ──▶ GitHub Actions (OIDC) ──▶ aws s3 sync dist/ → s3://savvytechies-docs/docs/
                                        └─▶ invalidate /docs/* on E3OEC4DI1YRJ40
browser ──▶ www.savvytechies.com/docs/* ──▶ CloudFront /docs behavior ──▶ S3 website endpoint
```

## One-time setup

### 1. Provision the bucket + deploy role (Terraform)
```bash
cd terraform
terraform init
terraform apply          # creates: docs S3 bucket + website config + public-read policy
                         #          + docs-deployment-role (GitHub OIDC)
terraform output         # note deploy_role_arn and docs_website_endpoint
```

### 2. Set the GitHub secret
On `savvytechies-dev/docs` → Settings → Secrets and variables → Actions:
- `AWS_ROLE_ARN` = `deploy_role_arn` output from step 1.

### 3. Wire `/docs/*` on the shared CloudFront distribution
`aws_cloudfront_distribution` is a single monolithic resource, so to manage one behavior on
the pre-existing shared distribution, adopt it into Terraform (recommended) — this also brings
the site + analytics origins under IaC:

```bash
cd terraform
# Adopt the live distribution and let Terraform generate its HCL from the current config:
#   1. Add an import block (see distribution-import.tf.example) pointing at E3OEC4DI1YRJ40
#   2. terraform plan -generate-config-out=distribution.generated.tf
#   3. In distribution.generated.tf, add:
#        - an origin  { origin_id = "docs", domain_name = <docs_website_endpoint>,
#                       custom_origin_config { origin_protocol_policy = "http-only", http_port = 80, ... } }
#        - an ordered_cache_behavior { path_pattern = "/docs/*", target_origin_id = "docs",
#                       viewer_protocol_policy = "redirect-to-https",
#                       cache_policy_id = <CachingOptimized>, ... }
#   4. terraform plan   # MUST show only the docs origin + behavior being ADDED
#   5. terraform apply
```

> The `terraform plan` in step 4 is the safety gate: it must show **only additions** (the docs
> origin + `/docs/*` behavior). If it wants to change/remove the site or analytics origins, the
> generated config drifted — reconcile before applying. Run this as a reviewed, gated step.

### 4. Deploy
Push to `main` (or run the workflow manually). CI builds, syncs under `docs/`, and invalidates
`/docs/*`. Verify: `curl -I https://www.savvytechies.com/docs/` → 200.

## Local dev
```bash
npm install
npm run dev        # http://localhost:4321/docs
npm run build      # static output in dist/
```
