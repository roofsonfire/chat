#!/usr/bin/env node

/**
 * Test script for image generation and editing functionality
 * Tests the actual API endpoints to identify issues
 */

import { readFileSync, existsSync } from "fs";
import path from "path";

// Load environment variables
const envPath = path.join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const BASE_URL = "http://localhost:3001";

async function testImageGeneration() {
  console.log("🧪 Testing Image Generation API\n");

  // Test 1: Simple text-to-image generation
  console.log("1️⃣ Testing text-to-image generation...");
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Generate a simple red heart on white background",
          },
        ],
        modelId: "gemini-2.5-flash-image",
      }),
    });

    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.status === 429) {
      console.log("❌ Rate limited");
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
      return;
    }

    if (!response.body) {
      console.log("❌ No response body");
      return;
    }

    console.log("✅ Streaming response received");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let textChunks = 0;
    let imageChunks = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const chunk = JSON.parse(line);
          if (chunk.type === "text") {
            textChunks++;
          } else if (chunk.type === "image") {
            imageChunks++;
            console.log(`📸 Image chunk: ${chunk.mimeType}, ${chunk.data.length} chars`);
          }
        } catch {
          console.log("⚠️  Failed to parse chunk:", line.substring(0, 100));
        }
      }
    }

    console.log(`📊 Results: ${textChunks} text chunks, ${imageChunks} image chunks`);
    if (imageChunks > 0) {
      console.log("✅ Image generation successful!\n");
    } else {
      console.log("❌ No images generated\n");
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
  }

  // Test 2: Image editing (mock - would need actual image data)
  console.log("2️⃣ Testing image editing...");
  try {
    // This is a simple test with minimal content to test validation
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "", // Empty content with image should be allowed now
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", // 1x1 pixel
          },
        ],
        modelId: "gemini-2.5-flash-image",
      }),
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 400) {
      const errorData = await response.json();
      console.log("❌ Validation error:", errorData.error);
    } else if (response.status === 429) {
      console.log("❌ Rate limited");
    } else {
      console.log("✅ Image editing request accepted");
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
  }

  console.log("\n✅ Testing complete!");
}

// Run tests
testImageGeneration().catch(console.error);