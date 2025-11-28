import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
config();

// ==================== API Functions ====================

async function callOpenRouterAPI(payload: any): Promise<any> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost:3000",
      "X-Title": "Chalkboard Infographic Generator"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// ==================== File Management Functions ====================

function createOutputDirectories(baseDir: string) {
  const dirs = [
    path.join(baseDir, "content"),
    path.join(baseDir, "images"),
    path.join(baseDir, "preview")
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return dirs;
}

function saveMarkdownContent(content: string, filepath: string): string {
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`📝 Content saved to: ${filepath}`);
  return filepath;
}

function saveBase64Image(base64Data: string, filepath: string): string {
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image format");
  }

  const imageType = matches[1];
  const base64Content = matches[2];
  const finalFilepath = `${filepath}.${imageType}`;

  const buffer = Buffer.from(base64Content, 'base64');
  fs.writeFileSync(finalFilepath, buffer);

  console.log(`📸 Image saved to: ${finalFilepath}`);
  return finalFilepath;
}

// ==================== Content Generation Functions ====================

const CHALKBOARD_INFOGRAPHIC_PROMPT = `You are a world-class educational designer specializing in chalkboard-style infographics. You create engaging, clear, and memorable learning materials using a black chalkboard aesthetic with colored chalk drawings.

Your task is to analyze the provided [Source Content] and [User Guidance], then generate structured infographic content that will be used to create a chalkboard-style educational infographic.

Key Style Requirements:
- Black chalkboard background for all content
- Colored chalk style for ALL text and images (no realistic illustrations)
- Minimalistic cartoon elements, icons, and simple portraits
- Ample whitespace for clarity
- Horizontal layout (16:9 aspect ratio)
- Emphasize keywords and core concepts
- Use "nano banana pro" drawing style

Content Structure:
1. Main Title - Clear and attention-grabbing
2. Key Themes - 3-5 main points
3. Essential Points - Core information with minimal text
4. Visual Elements - Simple icons, arrows, and diagrams
5. Famous Figures - Simple cartoon portraits when relevant

IMPORTANT: Unless specifically requested by the user, maintain the original language of the input content.

Design Guidelines to Extract:
- Any specific style requests from user prompt
- Color preferences (though chalk style is mandatory)
- Layout preferences
- Special elements requested

Output Format: Markdown with clear sections`;

async function generateChalkboardContent(sourceContent: string, userPrompt: string): Promise<string> {
  console.log(`📋 Generating chalkboard infographic content...`);

  const payload = {
    model: "google/gemini-3-pro-preview",
    messages: [
      {
        role: "system",
        content: CHALKBOARD_INFOGRAPHIC_PROMPT
      },
      {
        role: "user",
        content: `[Source Content]
${sourceContent}

[User Guidance]
${userPrompt}`
      }
    ],
    stream: false
  };

  const result = await callOpenRouterAPI(payload);

  if (result.choices && result.choices.length > 0) {
    const choice = result.choices[0];
    const message = choice.message;

    if (message.content) {
      console.log(`✅ Successfully generated chalkboard content (${message.content.length} characters)`);
      return message.content;
    }
  }

  throw new Error("Failed to generate chalkboard content");
}

// ==================== Image Prompt Conversion ====================

function convertToChalkboardImagePrompt(infographicContent: string): string[] {
  console.log(`🔄 Converting content to chalkboard image prompts...`);

  // Extract main title
  const mainTitleMatch = infographicContent.match(/^#+ (.+)$/m);
  const mainTitle = mainTitleMatch ? mainTitleMatch[1] : "Knowledge Card";

  // Extract key sections and concepts
  const sections = infographicContent.split(/\n---\n/);
  const keyConcepts: string[] = [];
  const visualElements: string[] = [];

  sections.forEach((section) => {
    if (section.trim() && !section.includes("设计师指南") && !section.includes("Design Guidelines")) {
      const titleMatch = section.match(/^#+ (.+)$/m);
      const sectionTitle = titleMatch ? titleMatch[1] : '';

      const content = section.replace(/^#.+$/gm, '').trim();

      if (sectionTitle) {
        keyConcepts.push(`Section: ${sectionTitle}`);
      }

      // Extract important concepts (medium length sentences)
      const sentences = content.split(/[。！？\n]/).filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 10 && trimmed.length < 80 &&
               !trimmed.includes('请') && !trimmed.includes('设计') &&
               !trimmed.includes('建议');
      });
      keyConcepts.push(...sentences.slice(0, 2));

      // Extract visual hints
      if (content.includes("对比") || content.includes("vs")) {
        visualElements.push("comparison chart");
      }
      if (content.includes("步骤") || content.includes("流程")) {
        visualElements.push("flow diagram");
      }
      if (content.includes("案例") || content.includes("示例")) {
        visualElements.push("example illustration");
      }
    }
  });

  // Create chalkboard-style image prompt
  const chalkboardPrompt = `Create a horizontal 16:9 educational infographic with a black chalkboard background using colored chalk style.

Topic: "${mainTitle}"

Content to Include:
${keyConcepts.slice(0, 8).map((concept, i) => `${i + 1}. ${concept}`).join('\n')}

Visual Style Requirements:
- Black chalkboard background (essential)
- ALL text and drawings in colored chalk style only
- No realistic illustrations - only chalk drawings
- Minimalistic cartoon elements and simple icons
- Use multiple chalk colors: white, yellow, blue, green, red, pink
- Include simple portrait sketches if people are mentioned
- Add decorative chalk elements: borders, arrows, underlines
- Use "nano banana pro" drawing style - cute, simple, educational

Layout:
- Horizontal 16:9 format
- Clean, organized sections with ample whitespace
- Clear hierarchy with title, subtitles, and bullet points
- Use chalk-drawn icons and simple diagrams
- Include arrows and connecting lines where appropriate

Text Style:
- Clear, readable chalk font
- Keywords highlighted with different colors
- Minimal text - focus on key points only
- Use uppercase for emphasis

Remember: Everything must look like it was drawn with colored chalk on a blackboard!`;

  console.log(`✅ Chalkboard prompt generated with ${keyConcepts.length} key concepts`);
  return [chalkboardPrompt];
}

// ==================== Image Generation ====================

async function generateChalkboardImages(imagePrompts: string[], outputDir: string): Promise<string[]> {
  console.log(`🎨 Generating ${imagePrompts.length} chalkboard images...`);

  const generatedImages: string[] = [];

  for (let i = 0; i < imagePrompts.length; i++) {
    const prompt = imagePrompts[i];
    const startTime = Date.now();

    try {
      console.log(`📸 Generating chalkboard image ${i + 1}/${imagePrompts.length}...`);

      const payload = {
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"],
        stream: false
      };

      const result = await callOpenRouterAPI(payload);

      if (result.choices && result.choices.length > 0) {
        const choice = result.choices[0];
        const message = choice.message;

        let hasImages = false;

        // Check for images in response
        if ((message as any).images && (message as any).images.length > 0) {
          hasImages = true;
          const imageData = (message as any).images[0];

          if (imageData.image_url && imageData.image_url.url) {
            const imageUrl = imageData.image_url.url;

            if (imageUrl.startsWith('data:')) {
              const imagePath = path.join(outputDir, `chalkboard_infographic_${i + 1}`);
              const savedPath = saveBase64Image(imageUrl, imagePath);
              generatedImages.push(savedPath);
            }
          }
        }

        // Check base64 in content
        if (!hasImages && message.content) {
          const base64Regex = /data:image\/\w+;base64,[A-Za-z0-9+/=]+/g;
          const base64Images = message.content.match(base64Regex);

          if (base64Images && base64Images.length > 0) {
            hasImages = true;
            const imagePath = path.join(outputDir, `chalkboard_infographic_${i + 1}`);
            const savedPath = saveBase64Image(base64Images[0], imagePath);
            generatedImages.push(savedPath);
          }
        }

        if (!hasImages) {
          console.log(`⚠️ Image ${i + 1} not generated successfully`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to generate image ${i + 1}:`, error);
    }
  }

  console.log(`✅ Successfully generated ${generatedImages.length} chalkboard images`);
  return generatedImages;
}

// ==================== HTML Preview Generation ====================

function generateChalkboardHTMLPreview(content: string, images: string[], outputPath: string): void {
  console.log(`🌐 Generating chalkboard HTML preview...`);

  const relativeImages = images.map(img => {
    const filename = path.basename(img);
    return `./images/${filename}`;
  });

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chalkboard Infographic Preview</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');

        body {
            font-family: 'Kalam', cursive;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
            color: #f0f0f0;
        }

        .container {
            background: #1a1a1a;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            border: 2px solid #444;
        }

        h1 {
            color: #fff;
            text-align: center;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin-bottom: 30px;
        }

        h1::before {
            content: "✨ ";
        }

        h1::after {
            content: " ✨";
        }

        .content-section {
            background: #0a0a0a;
            margin-bottom: 30px;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #333;
            position: relative;
        }

        .content-section::before {
            content: "";
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            background: linear-gradient(45deg, #444, #222);
            z-index: -1;
            border-radius: 10px;
        }

        .image-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }

        .image-item {
            background: #0a0a0a;
            border: 2px solid #444;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            position: relative;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .image-item::before {
            content: "📌";
            position: absolute;
            top: -10px;
            left: 20px;
            font-size: 24px;
        }

        .image-item img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            border: 3px solid #555;
        }

        .image-item h3 {
            color: #ffd700;
            margin: 15px 0 10px 0;
            font-size: 1.3em;
        }

        pre {
            white-space: pre-wrap;
            font-family: 'Kalam', cursive;
            color: #fff;
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
            font-size: 14px;
            line-height: 1.8;
        }

        .timestamp {
            text-align: center;
            color: #888;
            margin-top: 30px;
            padding: 15px;
            background: #0a0a0a;
            border-radius: 8px;
            border: 1px dashed #444;
        }

        .chalk-effect {
            position: relative;
        }

        .chalk-effect::after {
            content: "";
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #fff, transparent);
            opacity: 0.3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Chalkboard Infographic Generator</h1>

        <div class="content-section">
            <h2 style="color: #00ff00;">📝 Generated Content</h2>
            <div class="chalk-effect">
                <pre>${content}</pre>
            </div>
        </div>

        <div class="content-section">
            <h2 style="color: #ffff00;">🖼️ Generated Chalkboard Images (${images.length})</h2>
            <div class="image-gallery">
                ${relativeImages.map((img, index) => `
                    <div class="image-item">
                        <h3>Chalkboard Image ${index + 1}</h3>
                        <img src="${img}" alt="Chalkboard infographic ${index + 1}" />
                        <p style="color: #888; font-size: 12px; margin-top: 10px;">${path.basename(img)}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="timestamp">
            Generated on: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`📄 Chalkboard HTML preview saved to: ${outputPath}`);
}

// ==================== Main Function ====================

async function generateChalkboardInfographic(sourceContent: string, userPrompt: string, _options: any = {}): Promise<void> {
  const startTime = Date.now();

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseDir = path.join("./output", `chalkboard_${timestamp}`);

    console.log(`🚀 Starting chalkboard infographic generation...`);
    console.log(`📁 Output directory: ${baseDir}`);

    // Create output directories
    const [contentDir, imageDir, previewDir] = createOutputDirectories(baseDir);

    // Step 1: Generate content
    console.log(`📋 Generating chalkboard infographic content...`);
    const infographicContent = await generateChalkboardContent(sourceContent, userPrompt);

    // Save content
    const contentPath = path.join(contentDir, "chalkboard_content.md");
    saveMarkdownContent(infographicContent, contentPath);

    // Step 2: Convert to image prompts
    console.log(`🔄 Converting content to chalkboard image prompts...`);
    const imagePrompts = convertToChalkboardImagePrompt(infographicContent);

    // Step 3: Generate images
    console.log(`🎨 Generating chalkboard images...`);
    const generatedImages = await generateChalkboardImages(imagePrompts, imageDir);

    // Step 4: Generate HTML preview
    console.log(`🌐 Generating HTML preview...`);
    const previewPath = path.join(previewDir, "index.html");
    generateChalkboardHTMLPreview(infographicContent, generatedImages, previewPath);

    // Show results
    const totalDuration = (Date.now() - startTime) / 1000;
    console.log(`\n🎉 Chalkboard infographic generation complete!`);
    console.log(`=`.repeat(60));
    console.log(`📁 Output directory: ${baseDir}`);
    console.log(`📝 Content file: ${contentPath}`);
    console.log(`🖼️ Images generated: ${generatedImages.length}`);
    console.log(`🌐 Preview file: ${previewPath}`);
    console.log(`⏱️ Total time: ${totalDuration.toFixed(2)} seconds`);
    console.log(`💡 Open ${previewPath} in your browser to view results`);
    console.log(`=`.repeat(60));

  } catch (error) {
    console.error("❌ Chalkboard infographic generation failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}

// ==================== CLI Interface ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🎨 Chalkboard Infographic Generator

Usage:
  node chalkboard-infographic.ts "<source content>" "<user guidance>"
  node chalkboard-infographic.ts --source-file <file> "<user guidance>"
  node chalkboard-infographic.ts --test

Features:
- Black chalkboard background with colored chalk style
- Minimalistic cartoon elements and icons
- Horizontal 16:9 layout
- "nano banana pro" drawing style
- Simplified information with ample whitespace

Examples:
  node chalkboard-infographic.ts "First principles thinking" "Create educational infographic for beginners"
  node chalkboard-infographic.ts --source-file input.txt "Make it colorful and engaging"
  node chalkboard-infographic.ts --test
    `);
    process.exit(1);
  }

  if (args[0] === "--test") {
    const testSource = `第一性原理 (First Principles) 是一种通过将复杂问题拆解为最基本的"事实"或"真理"，然后从这些基本事实出发重新构建解决方案的思维模型。

简单来说，就是"不看别人怎么做，只看事物的本质是什么"。

核心特点：
- 回归事物最基本的物理或逻辑事实
- 从零开始推导，不受现有方案限制
- 容易产生颠覆性创新（从 0 到 1）
- 需要深度思考，认知负担较高

经典案例：SpaceX 的电池成本
马斯克发现电池的原材料成本只有 $80/kWh，而市场价是 $600/kWh。通过第一性原理思考，他重构了制造流程，大幅降低了成本。`;

    const testPrompt = "Create an educational infographic for students, use colorful chalk style";

    console.log("🧪 Running test case...");
    await generateChalkboardInfographic(testSource, testPrompt);
    return;
  }

  if (args[0] === "--source-file" && args[1]) {
    const filePath = args[1];
    const userPrompt = args[2] || "Create a professional chalkboard infographic";

    try {
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
      }

      const sourceContent = fs.readFileSync(filePath, 'utf8');
      await generateChalkboardInfographic(sourceContent, userPrompt);
    } catch (error) {
      console.error(`❌ Failed to read file:`, error);
      process.exit(1);
    }
    return;
  }

  if (args.length >= 2) {
    const sourceContent = args[0];
    const userPrompt = args[1];
    await generateChalkboardInfographic(sourceContent, userPrompt);
    return;
  }

  console.log("❌ Invalid arguments, use --help for usage information");
  process.exit(1);
}

// Run main function
main().catch(console.error);