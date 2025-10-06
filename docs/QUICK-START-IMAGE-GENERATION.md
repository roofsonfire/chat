# Quick Start: Generate Images with Gemini

## ✅ Verified Working Model

**Model**: `gemini-2.5-flash-image`  
**Status**: Production ready in `us-central1`

## 🚀 Quick Test (30 seconds)

### 1. Start the server

```bash
npm run dev
```

### 2. Open browser

Navigate to: http://localhost:3000

### 3. Login

Use your credentials from `.env.local`

### 4. Select the model

Click the model selector dropdown and choose:  
**"Gemini 2.5 Flash (Image Gen) 🖼️"**

### 5. Generate an image

Try any of these prompts:

- `Generate a simple red heart`
- `Create a logo for a coffee shop`
- `Draw a futuristic city at sunset`

### 6. Watch the magic ✨

- Text response appears first
- Image generates (2-5 seconds)
- Hover over image to see download button

## 📋 Example Prompts

### Simple Objects

- "Generate a blue butterfly"
- "Create a golden trophy"
- "Draw a realistic apple"

### With Text

- "Create a welcome banner with the text 'Hello World'"
- "Design a movie poster titled 'ADVENTURE'"

### Scenes

- "A peaceful mountain landscape at sunrise"
- "A cozy coffee shop interior"
- "A futuristic cityscape with flying cars"

### Iterative Editing

1. "Generate a forest scene"
2. "Add a deer in the clearing"
3. "Make it nighttime with moonlight"

## 🐛 Troubleshooting

### No image generated?

- ✅ Check model selector shows: "Gemini 2.5 Flash (Image Gen) 🖼️"
- ✅ Look for console log: "🖼️ Generated image received"
- ✅ Wait 5-10 seconds (image generation takes time)

### Still not working?

Run the test script:

```bash
node test-gemini-image-gen.mjs
```

Expected output:

```
✅ SUCCESS! Model gemini-2.5-flash-image can generate images!
   Saved: test-gemini-2.5-flash-image-*.png (489KB)
```

## 📊 What To Expect

### Successful Generation

```
Console logs:
🖼️ Generated image received: {
  mimeType: 'image/png',
  dataLength: 652868,
  totalImages: 1
}
✅ Final message update: { textLength: 42, imageCount: 1 }

UI:
- Text explanation appears
- PNG image displays below text
- Hover shows download button
- Image is ~400px wide, responsive
```

### Backend Logs

```
[INFO] Processing validated chat request {
  modelId: 'gemini-2.5-flash-image',
  messageCount: 1
}
[INFO] Enqueuing image part from chunk 1 {
  mimeType: 'image/png',
  dataLength: 652868,
  totalImages: 1
}
[INFO] Stream completed successfully {
  totalChunks: 1,
  totalTextLength: 42,
  totalImages: 1
}
```

## 🎯 Pro Tips

1. **Be specific** - "A photorealistic red rose" works better than "a flower"
2. **Request explicitly** - Say "generate an image" or "create a picture"
3. **Text in images** - Mention text explicitly: "with the word 'HELLO'"
4. **Iterate** - Build on previous generations in the conversation
5. **Download** - Hover over images to save them locally

## ✅ Verification Checklist

- [ ] Model "Gemini 2.5 Flash (Image Gen) 🖼️" appears in selector
- [ ] Selecting model shows 🖼️ icon
- [ ] Prompt "Generate a red heart" produces both text and image
- [ ] Image displays in chat (not just spinner)
- [ ] Download button appears on hover
- [ ] Console shows "🖼️ Generated image received"
- [ ] Backend logs show "totalImages: 1"

## 📖 Full Documentation

For detailed architecture, type definitions, and advanced usage:

- **Verified Working**: `docs/GEMINI-IMAGE-GENERATION-VERIFIED.md`
- **Original Implementation**: `docs/IMAGE-GENERATION-COMPLETE.md`

---

**Ready to generate images?** 🎨  
Run `npm run dev` and start creating!
