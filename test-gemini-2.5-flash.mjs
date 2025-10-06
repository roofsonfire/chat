#!/usr/bin/env node

/**
 * Test script for Gemini 2.5 Flash
 * Run with: node --env-file=.env.local test-gemini-2.5-flash.mjs
 */

import { VertexAI } from "@google-cloud/vertexai";

async function testGemini25Flash() {
  console.log("🔧 Testing Gemini 2.5 Flash...\n");

  if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_LOCATION) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
  }

  console.log("📋 Configuration:");
  console.log(`   Project: ${process.env.GOOGLE_PROJECT_ID}`);
  console.log(`   Location: ${process.env.GOOGLE_LOCATION}`);
  console.log("\n");

  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_LOCATION,
  });

  // Test different possible model names
  const modelNames = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-001",
    "gemini-2.0-flash-exp-02-05", // Sometimes there are dated versions
  ];

  for (const modelName of modelNames) {
    try {
      process.stdout.write(`Testing "${modelName}"... `);
      
      const model = vertexAI.getGenerativeModel({ model: modelName });
      
      // Quick validation
      await model.countTokens({ 
        contents: [{ role: "user", parts: [{ text: "test" }] }] 
      });
      
      console.log("✅ AVAILABLE");
      
      // Try to generate content
      console.log(`\n📤 Sending test prompt to ${modelName}...`);
      const result = await model.generateContent("Say hello in one word");
      const response = result.response;
      const text = response.candidates[0].content.parts[0].text;
      console.log(`📥 Response: ${text}\n`);
      
      console.log("✨ SUCCESS! Gemini 2.5 Flash is working!\n");
      console.log("💡 Update your .env.local file:");
      console.log(`   GOOGLE_VERTEX_AI_MODEL_ID=${modelName}\n`);
      
      return modelName;
    } catch (error) {
      console.log(`❌ Not available`);
      console.log(`   Error: ${error.message.split('\n')[0]}\n`);
    }
  }
  
  console.log("❌ None of the Gemini 2.5 Flash model names worked.");
  console.log("\n💡 To enable this model:");
  console.log("1. Visit: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemini-2.5-flash-image");
  console.log("2. Click 'Enable' or 'Deploy'");
  console.log("3. Wait a few minutes for activation");
  console.log("4. Run this script again\n");
}

testGemini25Flash().catch(console.error);
