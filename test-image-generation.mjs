#!/usr/bin/env node

/**
 * Test script to verify gemini-2.5-flash-image model availability
 * and image generation capabilities
 */

import { VertexAI } from '@google-cloud/vertexai';

const projectId = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_LOCATION || 'us-central1';

if (!projectId) {
  console.error('❌ GOOGLE_PROJECT_ID environment variable is required');
  process.exit(1);
}

console.log('🧪 Testing Gemini 2.5 Flash Image Generation Model\n');
console.log(`Project: ${projectId}`);
console.log(`Location: ${location}\n`);

const vertexAI = new VertexAI({
  project: projectId,
  location: location,
});

async function testImageGeneration() {
  try {
    console.log('📝 Testing: gemini-2.5-flash-image');
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
    });

    console.log('✅ Model instance created successfully');
    
    // Test with a simple text-to-image prompt
    console.log('\n🎨 Generating test image: "A small red heart"');
    
    const request = {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Generate a simple image of a small red heart on white background' }],
        },
      ],
    };

    console.log('⏳ Calling generateContent...');
    const result = await model.generateContent(request);
    const response = result.response;

    console.log('\n📊 Response Analysis:');
    console.log(`  - Candidates: ${response.candidates?.length || 0}`);
    
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      const parts = candidate.content?.parts || [];
      
      console.log(`  - Parts: ${parts.length}`);
      
      let textParts = 0;
      let imageParts = 0;
      
      parts.forEach((part, index) => {
        if (part.text) {
          textParts++;
          console.log(`    - Part ${index + 1}: TEXT (${part.text.length} chars)`);
          console.log(`      Preview: "${part.text.substring(0, 100)}..."`);
        }
        if (part.inlineData) {
          imageParts++;
          console.log(`    - Part ${index + 1}: IMAGE`);
          console.log(`      MIME Type: ${part.inlineData.mimeType}`);
          console.log(`      Data Length: ${part.inlineData.data?.length || 0} chars (base64)`);
        }
      });
      
      console.log(`\n✅ SUCCESS: Image generation model is working!`);
      console.log(`   - Text parts: ${textParts}`);
      console.log(`   - Image parts: ${imageParts}`);
      
      if (imageParts === 0) {
        console.log('\n⚠️  WARNING: No image was generated. Model may have returned text only.');
        console.log('    This could mean:');
        console.log('    1. The model interpreted the request as text-only');
        console.log('    2. Try a more explicit prompt like "create an image of..."');
      }
    }

  } catch (error) {
    if (error.message?.includes('404')) {
      console.error('\n❌ ERROR: Model not found (404)');
      console.error('   gemini-2.5-flash-image is not available in your project/region');
      console.error('\n   Possible solutions:');
      console.error('   1. Check Model Garden in Google Cloud Console');
      console.error('   2. Verify the model is enabled for your project');
      console.error('   3. Try a different region (currently using: ${location})');
    } else if (error.message?.includes('403')) {
      console.error('\n❌ ERROR: Permission denied (403)');
      console.error('   You may not have access to this model');
    } else {
      console.error('\n❌ ERROR:', error.message);
      console.error('\nFull error:', error);
    }
    process.exit(1);
  }
}

testImageGeneration();
