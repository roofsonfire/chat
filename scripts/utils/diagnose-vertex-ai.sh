#!/bin/bash

echo "🔍 Diagnosing Vertex AI Configuration"
echo "======================================"
echo ""

# Load environment
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

PROJECT_ID="${GOOGLE_PROJECT_ID}"
LOCATION="${GOOGLE_LOCATION}"

echo "📋 Configuration:"
echo "   Project ID: ${PROJECT_ID}"
echo "   Location: ${LOCATION}"
echo ""

echo "🔐 Current Authentication:"
gcloud auth list
echo ""

echo "📦 Checking if Vertex AI API is enabled..."
gcloud services list --enabled --project="${PROJECT_ID}" 2>/dev/null | grep -i "aiplatform\|vertex"
if [ $? -eq 0 ]; then
    echo "✅ Vertex AI API is enabled"
else
    echo "❌ Vertex AI API is NOT enabled"
    echo ""
    echo "💡 To enable it, run:"
    echo "   gcloud services enable aiplatform.googleapis.com --project=${PROJECT_ID}"
fi
echo ""

echo "🌍 Checking available regions for Vertex AI..."
gcloud ai models list --region=us-central1 --project="${PROJECT_ID}" 2>&1 | head -20
echo ""

echo "📊 Checking IAM permissions..."
gcloud projects get-iam-policy "${PROJECT_ID}" --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$(gcloud config get-value account)" 2>/dev/null | head -10
echo ""

echo "💰 Checking quotas..."
gcloud compute project-info describe --project="${PROJECT_ID}" 2>&1 | grep -i "quota" | head -5
echo ""

echo "🔗 Useful Links:"
echo "   Console: https://console.cloud.google.com/vertex-ai?project=${PROJECT_ID}"
echo "   Enable API: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=${PROJECT_ID}"
echo "   Gemini Docs: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini"
echo ""

echo "======================================"
echo "Diagnosis complete!"
