#!/usr/bin/env bash
# Add a /docs/* behavior to the shared CloudFront distribution, pointing at the docs S3
# website endpoint. Additive only (does not touch the site or analytics origins). Backs up
# the current config first. Run once; afterwards the docs deploy workflow just syncs+invalidates.
#
# (This is the one imperative step; the distribution can later be adopted into Terraform via
# the import flow in distribution-import.tf.example for full IaC.)
set -euo pipefail

DIST="E3OEC4DI1YRJ40"
DOCS_ORIGIN_DOMAIN="savvytechies-docs.s3-website-us-east-1.amazonaws.com"
ORIGIN_ID="docs"
CACHING_OPTIMIZED="658327ea-f89d-4fab-a63d-7e88639e58f6"  # Managed-CachingOptimized
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT

echo "==> fetch distribution config"
aws cloudfront get-distribution-config --id "$DIST" > "$WORK/dist.json"
ETAG=$(jq -r .ETag "$WORK/dist.json")
jq .DistributionConfig "$WORK/dist.json" > "$WORK/config.json"
cp "$WORK/config.json" "$(dirname "$0")/cloudfront-config.backup.json"
echo "   backup: terraform/cloudfront-config.backup.json (ETag $ETAG)"

if jq -e --arg id "$ORIGIN_ID" '.Origins.Items[]?|select(.Id==$id)' "$WORK/config.json" >/dev/null; then
  echo "   docs origin already present — nothing to do"; exit 0
fi

ORIGIN=$(jq -n --arg d "$DOCS_ORIGIN_DOMAIN" --arg id "$ORIGIN_ID" '{
  Id:$id, DomainName:$d, OriginPath:"", CustomHeaders:{Quantity:0},
  CustomOriginConfig:{HTTPPort:80,HTTPSPort:443,OriginProtocolPolicy:"http-only",
    OriginSslProtocols:{Quantity:1,Items:["TLSv1.2"]},OriginReadTimeout:30,OriginKeepaliveTimeout:5},
  ConnectionAttempts:3, ConnectionTimeout:10, OriginShield:{Enabled:false}
}')
BEHAVIOR=$(jq -n --arg id "$ORIGIN_ID" --arg cp "$CACHING_OPTIMIZED" '{
  PathPattern:"/docs/*", TargetOriginId:$id, ViewerProtocolPolicy:"redirect-to-https",
  AllowedMethods:{Quantity:3,Items:["GET","HEAD","OPTIONS"],CachedMethods:{Quantity:2,Items:["GET","HEAD"]}},
  Compress:true, SmoothStreaming:false, FieldLevelEncryptionId:"",
  CachePolicyId:$cp, LambdaFunctionAssociations:{Quantity:0}, FunctionAssociations:{Quantity:0}
}')
jq --argjson o "$ORIGIN" --argjson b "$BEHAVIOR" '
  .Origins.Items += [$o] | .Origins.Quantity += 1 |
  .CacheBehaviors.Items = ((.CacheBehaviors.Items // []) + [$b]) |
  .CacheBehaviors.Quantity = (.CacheBehaviors.Items|length)
' "$WORK/config.json" > "$WORK/new.json"

echo "==> update-distribution (adds /docs/* → docs origin)"
aws cloudfront update-distribution --id "$DIST" --if-match "$ETAG" \
  --distribution-config "file://$WORK/new.json" --query 'Distribution.Status' --output text

echo "==> invalidate /docs/*"
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/docs/*" --query 'Invalidation.Id' --output text
echo "DONE. Wait for propagation, then: curl -I https://www.savvytechies.com/docs/"
