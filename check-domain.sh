#!/bin/bash
echo "Checking domain status at $(date)..."
echo "SSL Certificate test:"
curl -I https://staging.chat.daza.ar --connect-timeout 5 2>&1 | head -3
echo ""
echo "Domain mapping status:"
gcloud beta run domain-mappings list --region=us-central1 --filter="metadata.name:staging.chat.daza.ar" --format="value(status.conditions[].reason)"
