# Docs Deployment

The docs are a static Astro Starlight site served at **https://www.savvytechies.com/docs**
(a subdirectory of the marketing site, for SEO). Infrastructure is **Terraform, applied from
CI with remote state** (S3 + DynamoDB) — no local state, no local applies. Content is built and
synced by a separate deploy workflow.

## Architecture
```
push (terraform/**) ─▶ terraform.yml (OIDC → github-deployment-role) ─▶ apply w/ S3+DynamoDB state
push (content)      ─▶ deploy.yml     (OIDC → github-deployment-role) ─▶ s3 sync dist/ → s3://savvytechies-docs/docs/
                                                                       └▶ invalidate /docs/*
browser ─▶ www.savvytechies.com/docs/* ─▶ CloudFront /docs behavior ─▶ S3 website endpoint
```

Both workflows assume the shared **`github-deployment-role`** (trust already covers
`repo:savvytechies-dev/*`); the `AWS_ROLE_ARN` secret on this repo points at it.

## One-time bootstrap (admin creds, run once)
Creates the remote-state bucket + lock table and grants the shared role the permissions the
Terraform workflow needs. Run locally with admin AWS creds:
```bash
bash terraform/bootstrap.sh
```
Creates: `s3://savvytechies-tf-state` (versioned, encrypted), DynamoDB `savvytechies-tf-lock`,
and an inline `docs-terraform` policy on `github-deployment-role` (state + docs bucket + CloudFront).

## Apply infra (CI)
After bootstrap, Terraform runs **in CI** — never locally:
- Push a change under `terraform/**` (or run the **Terraform (docs infra)** workflow manually).
- It inits with the S3 backend, plans, and applies (`aws_s3_bucket.docs` + website config + policy).
- PRs get a plan only; `main` applies.

## Wire `/docs/*` on the shared CloudFront distribution
`aws_cloudfront_distribution` is monolithic, so to manage one behavior on the pre-existing
shared distribution, adopt it into Terraform (this also brings the site + analytics origins
under IaC). Done once, locally, to generate the config, then committed so CI manages it:
```bash
cd terraform
cp distribution-import.tf.example distribution-import.tf   # import block for E3OEC4DI1YRJ40
terraform init
terraform plan -generate-config-out=distribution.generated.tf
# Add the docs origin + /docs/* behavior to distribution.generated.tf (see that file's comments),
# rename it into a tracked .tf, then commit. CI plan MUST show only the docs additions.
```
> The committed distribution HCL is then applied by CI like everything else. The `plan` must
> show **only additions** (docs origin + `/docs/*` behavior) — if it wants to change the site or
> analytics origins, reconcile before merging.

## Deploy content
Push to `main` → `deploy.yml` builds, syncs under `docs/`, invalidates `/docs/*`.
Verify: `curl -I https://www.savvytechies.com/docs/` → 200.

## Local dev
```bash
npm install
npm run dev        # http://localhost:4321/docs
npm run build
```
