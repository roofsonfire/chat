#!/usr/bin/env node

/**
 * Test script to find available Gemini models in your region
 * Run with: node --env-file=.env.local test-available-models.mjs
 */

import { VertexAI } from "@google-cloud/vertexai";

// Models to test (comprehensive list of known Gemini model names)
const MODELS_TO_TEST = [
  // Gemini 2.5 (Latest)
  "gemini-2.5-flash",
  "gemini-2.5-flash-001",
  "gemini-2.5-pro",
  
  // Gemini 2.0 (Experimental/Preview)
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-thinking-exp-1219",
  "gemini-2.0-flash-thinking-exp",
  
  // Stable names (no version)
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
  "gemini-pro",
  "gemini-pro-vision",
  
  // Versioned names
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro-002",
  "gemini-1.5-pro-001",
  "gemini-1.0-pro-002",
  "gemini-1.0-pro-001",
  "gemini-1.0-pro-vision-001",
  
  // Alternative formats
  "gemini-flash",
  "gemini-pro-flash",
  "models/gemini-1.5-flash",
  "models/gemini-1.5-pro",
  "models/gemini-1.0-pro",
  "publishers/google/models/gemini-1.5-flash",
];

async function testModel(vertexAI, modelName) {
  try {
    const model = vertexAI.getGenerativeModel({ model: modelName });
    
    // Use countTokens as a quick validation (faster than generateContent)
    await model.countTokens({ 
      contents: [{ role: "user", parts: [{ text: "test" }] }] 
    });
    
    return { available: true, error: null };
  } catch (error) {
    return { 
      available: false, 
      error: error.message || error.toString() 
    };
  }
}

async function main() {
  console.log("🔍 Testing Available Gemini Models in Your Region\n");
  
  // Check environment
  if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_LOCATION) {
    console.error("❌ Missing required environment variables!");
    console.error("   GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID || "Missing");
    console.error("   GOOGLE_LOCATION:", process.env.GOOGLE_LOCATION || "Missing");
    process.exit(1);
  }
  
  console.log("📋 Configuration:");
  console.log(`   Project: ${process.env.GOOGLE_PROJECT_ID}`);
  console.log(`   Location: ${process.env.GOOGLE_LOCATION}`);
  console.log(`   Testing ${MODELS_TO_TEST.length} model names...\n`);
  
  // Initialize Vertex AI
  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_LOCATION,
  });
  
  const results = [];
  
  // Test each model with timeout
  for (const modelName of MODELS_TO_TEST) {
    process.stdout.write(`Testing "${modelName}"... `);
    
    try {
      const result = await Promise.race([
        testModel(vertexAI, modelName),
        new Promise((resolve) => 
          setTimeout(() => resolve({ available: false, error: "Timeout" }), 10000)
        ),
      ]);
      
      if (result.available) {
        console.log("✅ AVAILABLE");
        results.push({ model: modelName, available: true });
      } else {
        console.log(`❌ Not available (${result.error.split('\n')[0]})`);
        results.push({ model: modelName, available: false, error: result.error });
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({ model: modelName, available: false, error: error.message });
    }
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60) + "\n");
  
  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available);
  
  if (available.length > 0) {
    console.log(`✅ AVAILABLE MODELS (${available.length}):\n`);
    available.forEach(r => console.log(`   ✓ ${r.model}`));
    console.log("\n💡 Recommendation: Update your .env.local file to use one of these model names.");
    console.log(`   For example: GOOGLE_VERTEX_AI_MODEL_ID=${available[0].model}\n`);
  } else {
    console.log("❌ NO AVAILABLE MODELS FOUND\n");
  }
  
  if (unavailable.length > 0) {
    console.log(`\n❌ UNAVAILABLE MODELS (${unavailable.length}):`);
    
    // Group by error type
    const errorGroups = {};
    unavailable.forEach(r => {
      const errorKey = r.error.includes('404') ? '404 Not Found' : 
                       r.error.includes('403') ? '403 Forbidden' : 
                       r.error.includes('Timeout') ? 'Timeout' : 'Other';
      if (!errorGroups[errorKey]) errorGroups[errorKey] = [];
      errorGroups[errorKey].push(r.model);
    });
    
    Object.entries(errorGroups).forEach(([errorType, models]) => {
      console.log(`\n   ${errorType} (${models.length}):`);
      models.forEach(m => console.log(`      - ${m}`));
    });
  }
  
  console.log("\n" + "=".repeat(60));
  
  // Additional diagnostics
  if (available.length === 0) {
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("   1. Check if Vertex AI API is enabled:");
    console.log("      gcloud services list --enabled | grep aiplatform");
    console.log("   2. Try a different region (e.g., us-central1, europe-west4)");
    console.log("   3. Verify project access:");
    console.log("      gcloud projects get-iam-policy " + process.env.GOOGLE_PROJECT_ID);
    console.log("   4. Check quota:");
    console.log("      https://console.cloud.google.com/iam-admin/quotas");
    console.log();
  }
}

main().catch(console.error);
