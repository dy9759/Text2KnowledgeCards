/**
 * Direct Chalkboard Image Generator
 *
 * Generates ONLY images using Nano Banana Pro (google/gemini-3-pro-image-preview)
 * Skips text generation to save credits for the high-quality image model
 */

import { config } from 'dotenv';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_KEY = process.env.OPENROUTER_API_KEY;
const OUTPUT_DIR = join(__dirname, 'output');

// Nano Banana Pro model (as specified by user)
const NANO_BANANA_PRO_MODEL = 'google/gemini-3-pro-image-preview';

/**
 * Ensure output directory exists
 */
function ensureOutputDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Extract base64 image from various response formats
 */
function extractBase64Image(response: any): string | null {
  try {
    const choice = response.choices?.[0];
    if (!choice) return null;

    const message = choice.message;

    // Method 1: message.images array with nested image_url.url
    if (message?.images && message.images.length > 0) {
      const imageData = message.images[0];

      // Check for direct url property
      if (imageData.url?.startsWith('data:image/')) {
        return imageData.url;
      }

      // Check for nested image_url.url property
      if (imageData.image_url?.url?.startsWith('data:image/')) {
        return imageData.image_url.url;
      }
    }

    // Method 2: Inline image in content
    if (message?.content) {
      const content = message.content;

      // Check for base64 image pattern
      const base64Regex = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/gi;
      const matches = content.match(base64Regex);

      if (matches && matches[0]) {
        return matches[0];
      }

      // Check for image_url format
      const imageUrlMatch = content.match(/"image_url":\s*{\s*"url":\s*"(data:image\/[^"]+)"/i);
      if (imageUrlMatch && imageUrlMatch[1]) {
        return imageUrlMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error extracting image:', error);
    return null;
  }
}

/**
 * Save base64 image to file
 */
async function saveBase64Image(base64Data: string, filename: string): Promise<string> {
  try {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image data');
    }

    const imageType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, 'base64');

    const imagePath = join(OUTPUT_DIR, 'images', filename);

    ensureOutputDir(dirname(imagePath));

    // Write image file
    const writeStream = createWriteStream(imagePath);
    writeStream.write(buffer);
    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log(`   ✅ Image saved: ${filename}`);
        resolve(imagePath);
      });
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error(`   ❌ Error saving image: ${error}`);
    throw error;
  }
}

/**
 * Generate chalkboard-style image using Nano Banana Pro
 */
async function generateChalkboardImage(content: string): Promise<{ content: string; imagePaths: string[] }> {
  if (!API_KEY) {
    throw new Error('❌ OPENROUTER_API_KEY not found in environment variables');
  }

  console.log('🎨 Generating Chalkboard Image with Nano Banana Pro...');
  console.log(`   Model: ${NANO_BANANA_PRO_MODEL}`);

  // Create a simple prompt for direct image generation
  const imagePrompt = `Create a professional chalkboard-style infographic with the following content:

${content}

Requirements:
- Draw with colored chalk on a blackboard background
- Use different chalk colors: white, yellow, blue, red, green
- Include simple chalk drawings or diagrams where appropriate
- Make it clear, educational, and visually appealing
- Ensure text is readable and well-organized
- Style: educational chalkboard infographic`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:3000',
        'X-Title': 'Chalkboard Image Generator',
      },
      body: JSON.stringify({
        model: NANO_BANANA_PRO_MODEL,
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        // Generate both image and text for better quality
        modalities: ['image', 'text'],
        max_tokens: 2000, // Increased for better image quality
        temperature: 0.8,
        response_format: {
          type: 'text' // Allow mixed response
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);

      if (response.status === 402) {
        throw new Error('Insufficient credits for Nano Banana Pro. Please add credits at https://openrouter.ai/settings/keys');
      } else if (response.status === 404) {
        throw new Error(`Model ${NANO_BANANA_PRO_MODEL} not found or not available`);
      } else {
        throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    }

    const responseData = await response.json();

    // Extract usage information
    if (responseData.usage) {
      console.log(`   📊 Tokens used: ${responseData.usage.total_tokens} (${responseData.usage.prompt_tokens} prompt + ${responseData.usage.completion_tokens} completion)`);
    }

    // Extract and save image
    const base64Image = extractBase64Image(responseData);
    const imagePaths: string[] = [];

    if (base64Image) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const imageFilename = `chalkboard_direct_${timestamp}.png`;
      const imagePath = await saveBase64Image(base64Image, imageFilename);
      imagePaths.push(imagePath);
    } else {
      console.log('   ⚠️ No image found in response');
    }

    // Generate simple text content as fallback
    const textContent = responseData.choices?.[0]?.message?.content || 'Chalkboard image generated successfully';

    return {
      content: textContent,
      imagePaths
    };
  } catch (error) {
    console.error('❌ Error generating image:', error);
    throw error;
  }
}

/**
 * Create HTML preview page
 */
function createHTMLPreview(content: string, imagePaths: string[], timestamp: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Direct Chalkboard Image - ${timestamp}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1e1e1e, #2d2d2d);
      color: #e0e0e0;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }
    .header h1 {
      margin: 0;
      color: #fff;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .header .subtitle {
      margin-top: 10px;
      color: #4caf50;
      font-size: 1.2em;
    }
    .image-section {
      margin-bottom: 40px;
    }
    .image-container {
      text-align: center;
      background: #000;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 3px solid #444;
    }
    .chalkboard-image {
      max-width: 100%;
      height: auto;
      border-radius: 5px;
      display: block;
      margin: 0 auto;
    }
    .info {
      background: rgba(255, 255, 255, 0.05);
      padding: 20px;
      border-radius: 10px;
      margin-top: 20px;
      font-size: 0.9em;
      color: #ccc;
      text-align: center;
    }
    .model-info {
      background: linear-gradient(135deg, #1a237e, #283593);
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .no-images {
      text-align: center;
      padding: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      color: #f44336;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Direct Chalkboard Image</h1>
      <div class="subtitle">Generated with Nano Banana Pro</div>
      <div class="info">Generated on: ${new Date(timestamp).toLocaleString()}</div>
    </div>

    <div class="model-info">
      Model: ${NANO_BANANA_PRO_MODEL} (Google Gemini 3 Pro Image Preview - "Nano Banana Pro")
    </div>

    <div class="image-section">
      <h2>Generated Image</h2>
      ${imagePaths.length > 0 ? `
        <div class="image-container">
          <img src="../images/${imagePaths[0].split('/').pop()}"
               alt="Chalkboard Image"
               class="chalkboard-image">
        </div>
      ` : `
        <div class="no-images">
          <h3>⚠️ No Images Generated</h3>
          <p>The API response didn't contain any image data. Check console for details.</p>
        </div>
      `}
    </div>

    ${content ? `
      <div class="image-section">
        <h2>Generated Text (if any)</h2>
        <div class="info">
          <pre>${content}</pre>
        </div>
      </div>
    ` : ''}
  </div>
</body>
</html>`;

  const htmlPath = join(OUTPUT_DIR, 'preview', 'index.html');
  ensureOutputDir(dirname(htmlPath));

  const writeStream = createWriteStream(htmlPath);
  writeStream.write(html);
  writeStream.end();

  console.log(`   📄 HTML preview created: index.html`);
}

/**
 * Main function to generate direct chalkboard image
 */
async function main() {
  console.log('🚀 Starting Direct Chalkboard Image Generator');
  console.log('==============================================\n');

  const timestamp = new Date().toISOString().slice(0, 19);
  console.log(`⏰ Timestamp: ${timestamp}`);

  // Default content to generate
  const defaultContent = `
• 机器学习 = Machine Learning
  - 让计算机从数据中学习
  - 发现模式和规律

• 深度学习 = Deep Learning
  - 使用神经网络
  - 模拟人脑学习过程

• AI = Artificial Intelligence
  - 让机器像人一样思考
  - 解决复杂问题`;

  try {
    // Generate image using Nano Banana Pro
    const { content, imagePaths } = await generateChalkboardImage(defaultContent);

    // Create HTML preview
    createHTMLPreview(content, imagePaths, timestamp);

    console.log('\n✨ Direct image generation complete!');
    console.log(`📁 Check output directory for: ${imagePaths.length} image(s) and preview`);

    if (imagePaths.length === 0) {
      console.log('\n⚠️ Note: No images were generated. This could be due to:');
      console.log('   - Insufficient credits for Nano Banana Pro model');
      console.log('   - Model unavailability');
      console.log('   - API response format changes');
      console.log('\n💡 Solution: Add credits at https://openrouter.ai/settings/keys');
    }

  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}