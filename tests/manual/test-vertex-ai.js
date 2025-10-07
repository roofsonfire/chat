#!/usr/bin/env node

/**
 * Quick test script to verify Vertex AI setup
 * Run with: node --env-file=.env.local test-vertex-ai.js
 */

import { VertexAI } from "@google-cloud/vertexai";

async function testVertexAI() {
  try {
    console.log("🔧 Testing Vertex AI Configuration...\n");

    // Check environment variables
    console.log("📋 Environment Variables:");
    console.log(
      `   GOOGLE_PROJECT_ID: ${process.env.GOOGLE_PROJECT_ID || "❌ Missing"}`
    );
    console.log(
      `   GOOGLE_LOCATION: ${process.env.GOOGLE_LOCATION || "❌ Missing"}`
    );
    console.log(
      `   GOOGLE_VERTEX_AI_MODEL_ID: ${process.env.GOOGLE_VERTEX_AI_MODEL_ID || "❌ Missing"}\n`
    );

    if (
      !process.env.GOOGLE_PROJECT_ID ||
      !process.env.GOOGLE_LOCATION ||
      !process.env.GOOGLE_VERTEX_AI_MODEL_ID
    ) {
      console.error("❌ Missing required environment variables!");
      process.exit(1);
    }

    // Initialize Vertex AI
    console.log("🚀 Initializing Vertex AI client...");
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_LOCATION,
    });

    const model = vertexAI.getGenerativeModel({
      model: process.env.GOOGLE_VERTEX_AI_MODEL_ID,
    });

    console.log("✅ Vertex AI client initialized successfully!\n");

    // Test simple prompt
    console.log('📤 Sending test prompt: "Say hello in one word"');
    const result = await model.generateContent("Say hello in one word");
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log("📥 Response received:", text);
    console.log("\n✨ SUCCESS! Vertex AI is working correctly! ✨\n");

    // Cost estimate
    console.log("💰 Cost Estimate:");
    console.log("   Model: gemini-1.5-flash-002");
    console.log("   Input: ~$0.01875 per 1M characters");
    console.log("   Output: ~$0.075 per 1M characters");
    console.log("   This test cost: < $0.0001 (basically free!)\n");
  } catch (error) {
    console.error("\n❌ Error testing Vertex AI:");
    console.error(error.message);

    if (error.message.includes("PERMISSION_DENIED")) {
      console.error("\n💡 Solution: Make sure you ran:");
      console.error("   gcloud auth application-default login");
      console.error("   gcloud services enable aiplatform.googleapis.com");
    }

    if (error.message.includes("API has not been used")) {
      console.error("\n💡 Solution: Enable the Vertex AI API:");
      console.error("   gcloud services enable aiplatform.googleapis.com");
    }

    process.exit(1);
  }
}

testVertexAI();
