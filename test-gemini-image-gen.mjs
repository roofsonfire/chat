/**
 * Test script to verify Gemini image generation capabilities
 * Tests multiple potential model names
 */

import { VertexAI } from "@google-cloud/vertexai";
import { writeFileSync, readFileSync } from "fs";

// Load env variables manually
const envContent = readFileSync(".env.local", "utf-8");
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || "us-central1";

// Try different potential model names
const MODEL_OPTIONS = [
  "gemini-2.5-flash-image-preview",
  "gemini-2.5-flash-image",
  "gemini-flash-image",
];

console.log("\n🧪 Testing Gemini Image Generation Models");
console.log("=".repeat(50));
console.log(`📍 Project: ${PROJECT_ID}`);
console.log(`📍 Location: ${LOCATION}\n`);

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

for (const MODEL_ID of MODEL_OPTIONS) {
  console.log(`\n🤖 Testing: ${MODEL_ID}`);
  console.log("-".repeat(50));

  try {
    const model = vertexAI.getGenerativeModel({
      model: MODEL_ID,
    });

    console.log("📤 Sending request...");

    const request = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Generate a simple red heart",
            },
          ],
        },
      ],
    };

    const response = await model.generateContent(request);
    
    console.log("✅ Response received!");

    // Check for parts
    const parts = response.response?.candidates?.[0]?.content?.parts || [];
    console.log(`📦 Total parts: ${parts.length}`);

    let textParts = 0;
    let imageParts = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.text) {
        textParts++;
        console.log(`📝 Text part ${i + 1}: ${part.text.substring(0, 100)}...`);
      }
      
      if (part.inlineData) {
        imageParts++;
        console.log(`🖼️  Image part ${i + 1}:`);
        console.log(`   MIME: ${part.inlineData.mimeType}`);
        console.log(`   Size: ${part.inlineData.data?.length || 0} chars`);
        
        if (part.inlineData.data) {
          const filename = `test-${MODEL_ID}-${Date.now()}.png`;
          const buffer = Buffer.from(part.inlineData.data, "base64");
          writeFileSync(filename, buffer);
          console.log(`   ✅ Saved: ${filename} (${buffer.length} bytes)`);
        }
      }
    }

    console.log(`\n📊 Summary: ${textParts} text, ${imageParts} images`);
    
    if (imageParts > 0) {
      console.log(`\n✅ SUCCESS! Model ${MODEL_ID} can generate images!`);
      break; // Found working model, stop testing
    } else {
      console.log(`⚠️  Model only returned text, no images`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.message.includes("404") || error.message.includes("NOT_FOUND")) {
      console.log(`   Model ${MODEL_ID} not available in ${LOCATION}`);
    }
  }
}

console.log("\n" + "=".repeat(50));
console.log("Test complete\n");
