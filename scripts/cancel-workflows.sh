#!/bin/bash

# Cancel stuck GitHub Actions workflows
# Usage: ./scripts/cancel-workflows.sh

set -euo pipefail

echo "🔍 Checking for running workflows..."

# Cancel all running workflows for this repo
gh run list --status in_progress --json databaseId --jq '.[].databaseId' | while read -r run_id; do
    if [[ -n "$run_id" ]]; then
        echo "🛑 Cancelling workflow run: $run_id"
        gh run cancel "$run_id"
    fi
done

# List recent workflow runs
echo
echo "📋 Recent workflow runs:"
gh run list --limit 5

echo
echo "✅ Done! All in-progress workflows have been cancelled."