import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 加载环境变量
config();

// ==================== API 调用函数 ====================

async function callOpenRouterAPI(payload: any): Promise<any> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost:3000",
      "X-Title": "Full Infographic System"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// ==================== 文件管理函数 ====================

// 创建输出目录结构
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

// 保存内容到 Markdown 文件
function saveMarkdownContent(content: string, filepath: string): string {
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`📝 内容已保存到: ${filepath}`);
  return filepath;
}

// 将 base64 数据保存为图片文件
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

  console.log(`📸 图片已保存到: ${finalFilepath}`);
  return finalFilepath;
}

// ==================== 内容生成函数 ====================

// 信息图内容生成的系统提示词
const INFOGRAPHIC_SYSTEM_PROMPT = `你是一位世界级的教学设计师。你是一位擅长制作清晰、简洁且引人入胜的学习材料的大师。你也是一位视觉设计专家，懂得如何利用视觉元素将复杂的概念以通俗易懂的方式传达出来。同时，你还是讲故事的大师，懂得如何运用故事让学习过程更令人难忘且充满趣味。

你的任务是分析提供的【源背景信息】和【用户引导提示】，并生成一份结构化的信息图表内容。该内容将告知专业信息图设计师需要传达哪些信息，以便受众能清晰理解源背景信息。

这份内容将在下一步传递给专业信息图设计师，他们将依据此内容制作高质量的信息图。设计师无法访问【源背景信息】，因此请确保内容表述充分。 信息图必须使用 [中文]。

你还需要分析提供的【用户引导提示】，从中提取仅与设计相关的指令（风格、布局、颜色等），并将其放入末尾专门的设计指南部分。

工作流程

第 1 步：分析源文档。通读整篇文档并深入理解其内容。

第 2 步：创建高层级大纲。大纲应包含标题和所有主要学习目标列表。

第 3 步：充实大纲内容。为每个学习目标创建一个章节。每个章节都应包含概念解释和实操教程的组合。

关键规则

规则 1：输出格式为 Markdown。所有生成的内容必须严格遵守 Markdown 格式。

规则 2：语气和口吻。语气应如同专家培训师：知识渊博、充满鼓励且清晰明了。

规则 3：无新增信息。不要添加任何源文档中不存在的新信息。

规则 4：源数据处理。源文档中的所有数据必须逐字复制。不要进行总结或改写。`;

async function generateInfographicContent(sourceContent: string, userPrompt: string): Promise<string> {
  console.log(`📋 正在生成信息图内容...`);

  const payload = {
    model: "google/gemini-3-pro-preview",
    messages: [
      {
        role: "system",
        content: INFOGRAPHIC_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: `【源背景信息】
${sourceContent}

【用户引导提示】
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
      console.log(`✅ 成功生成信息图内容 (${message.content.length} 字符)`);
      return message.content;
    }
  }

  throw new Error("未能生成信息图内容");
}

// ==================== Prompt 转换函数 ====================

// 将信息图内容转换为单张图片生成提示词
function convertContentToImagePrompt(infographicContent: string): string[] {
  console.log(`🔄 正在分析内容并生成综合图片提示词...`);

  // 提取整个文档的关键信息
  const sections = infographicContent.split(/\n---\n/);

  // 提取主标题
  const mainTitleMatch = infographicContent.match(/^#+ (.+)$/m);
  const mainTitle = mainTitleMatch ? mainTitleMatch[1] : "信息图";

  // 收集所有关键概念和内容
  const keyConcepts: string[] = [];
  const visualElements: string[] = [];
  const importantDefinitions: string[] = [];

  sections.forEach((section, index) => {
    if (section.trim() && !section.includes("设计师指南") && !section.includes("Design Guidelines")) {
      // 提取章节标题
      const titleMatch = section.match(/^#+ (.+)$/m);
      const sectionTitle = titleMatch ? titleMatch[1] : '';

      // 提取关键内容（保留重要格式）
      const content = section.replace(/^#.+$/gm, '').trim();

      if (sectionTitle) {
        keyConcepts.push(`【章节】${sectionTitle}`);
      }

      // 提取定义和重要概念（使用引号标记的内容）
      const quotedContent = content.match(/"([^"]+)"/g) || [];
      importantDefinitions.push(...quotedContent.map(q => q.replace(/"/g, '')));

      // 提取冒号后的重要说明
      const importantStatements = content.match(/[:：]\s*([^\n。！？]{10,60})/g) || [];
      importantDefinitions.push(...importantStatements.map(s => s.replace(/^[：:]\s*/, '')));

      // 提取重要概念（中等长度句子）
      const sentences = content.split(/[。！？\n]/).filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 10 && trimmed.length < 80 &&
               !trimmed.includes('请') && !trimmed.includes('设计') &&
               !trimmed.includes('建议') && !trimmed.includes('注意');
      });
      keyConcepts.push(...sentences.slice(0, 3)); // 每章节最多3个概念

      // 提取视觉元素提示
      if (content.includes("对比") || content.includes("vs") || content.includes("表格") || content.includes("区别")) {
        visualElements.push("对比图表");
      }
      if (content.includes("步骤") || content.includes("流程") || content.includes("过程") || content.includes("阶段")) {
        visualElements.push("流程图");
      }
      if (content.includes("案例") || content.includes("示例") || content.includes("实例") || content.includes("例子")) {
        visualElements.push("实例说明");
      }
      if (content.includes("数据") || content.includes("统计") || content.includes("数字")) {
        visualElements.push("数据图表");
      }
      if (content.includes("结构") || content.includes("组成") || content.includes("部分")) {
        visualElements.push("结构图");
      }
    }
  });

  // 将重要定义添加到概念列表开头
  if (importantDefinitions.length > 0) {
    keyConcepts.unshift(...importantDefinitions.map(def => `【定义】${def}`));
  }

  // 生成超级浓缩的单张图片提示词，确保所有信息完整呈现
  const ultraComprehensivePrompt = `请创建一张内容极其丰富的单页中文信息图，完整展示"${mainTitle}"的所有重要信息。这是一张高密度信息图，必须在有限空间内最大化信息传递效率。

=== 必须包含的核心内容 ===
${keyConcepts.slice(0, 12).map((concept, i) => `${i + 1}. ${concept}`).join('\n')}

=== 紧凑型布局要求 ===
- 使用智能网格布局，充分利用每一寸空间
- 信息密度最大化但保持可读性
- 采用多层级信息组织：标题→副标题→要点→细节
- 使用视觉分区和色块区分不同内容模块
- 文字大小采用层级化：大标题→中标题→小正文→注释

=== 高效视觉设计策略 ===
- 使用图标代替文字描述，节省空间
- 采用流程图、关系图、对比图等紧凑可视化形式
- 利用空白和负空间进行视觉呼吸和信息分隔
- 使用数字、颜色编码、符号标记增强信息识别
- 考虑采用折叠式或叠加式信息展示方法

=== 技术规格要求 ===
- 分辨率：高分辨率确保细节清晰
- 色彩：蓝色系主调，辅以对比色突出重点
- 字体：无衬线字体，多级字号确保层次分明
- 信息架构：自上而下、从左到右的自然阅读流
- 视觉引导：使用箭头、线条、色块引导视线

=== 质量保证要求 ===
- 确保所有核心概念都有视觉呈现
- 重要信息必须突出显示，不能被埋没
- 保持专业教育风格，同时信息丰富
- 文字清晰可读，即使信息密度高
- 整体布局紧凑但不杂乱

请生成一张真正内容完整、信息丰富的单页信息图，让观众一张图就能掌握主题的所有关键知识。目标是实现"一图胜千言"的效果。`;

  console.log(`✅ 超级浓缩提示词生成完成，包含 ${keyConcepts.length} 个核心概念`);

  return [ultraComprehensivePrompt]; // 只返回1个提示词
}

// ==================== 图片生成函数 ====================

async function generateImages(imagePrompts: string[], outputDir: string): Promise<string[]> {
  console.log(`🎨 正在生成 ${imagePrompts.length} 张图片...`);

  const generatedImages: string[] = [];
  const imageStartTimes: number[] = [];

  for (let i = 0; i < imagePrompts.length; i++) {
    const prompt = imagePrompts[i];
    const imageStartTime = Date.now();
    imageStartTimes.push(imageStartTime);

    try {
      console.log(`📸 开始生成第 ${i + 1}/${imagePrompts.length} 张图片...`);
      console.log(`⏰ 第 ${i + 1} 张开始时间: ${new Date(imageStartTime).toLocaleTimeString('zh-CN')}`);

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

      const apiStartTime = Date.now();
      const result = await callOpenRouterAPI(payload);
      const apiEndTime = Date.now();
      const apiDuration = apiEndTime - apiStartTime;

      console.log(`📡 API调用耗时: ${(apiDuration / 1000).toFixed(2)} 秒`);

      if (result.choices && result.choices.length > 0) {
        const choice = result.choices[0];
        const message = choice.message;

        // 检查图片数据
        let hasImages = false;

        // 检查 images 属性
        if ((message as any).images && (message as any).images.length > 0) {
          hasImages = true;
          const imageData = (message as any).images[0];

          if (imageData.image_url && imageData.image_url.url) {
            const imageUrl = imageData.image_url.url;

            if (imageUrl.startsWith('data:')) {
              const saveStartTime = Date.now();
              const imagePath = path.join(outputDir, `infographic_image_${i + 1}`);
              const savedPath = saveBase64Image(imageUrl, imagePath);
              const saveEndTime = Date.now();

              const totalImageTime = saveEndTime - imageStartTimes[i];
              console.log(`💾 第 ${i + 1} 张图片保存耗时: ${((saveEndTime - saveStartTime) / 1000).toFixed(2)} 秒`);
              console.log(`⏱️ 第 ${i + 1} 张总耗时: ${(totalImageTime / 1000).toFixed(2)} 秒`);

              generatedImages.push(savedPath);
            }
          }
        }

        // 如果没有找到图片，检查文本内容中的base64
        if (!hasImages && message.content) {
          const base64Regex = /data:image\/\w+;base64,[A-Za-z0-9+/=]+/g;
          const base64Images = message.content.match(base64Regex);

          if (base64Images && base64Images.length > 0) {
            hasImages = true;
            const saveStartTime = Date.now();
            const imagePath = path.join(outputDir, `infographic_image_${i + 1}`);
            const savedPath = saveBase64Image(base64Images[0], imagePath);
            const saveEndTime = Date.now();

            const totalImageTime = saveEndTime - imageStartTimes[i];
            console.log(`💾 第 ${i + 1} 张图片保存耗时: ${((saveEndTime - saveStartTime) / 1000).toFixed(2)} 秒`);
            console.log(`⏱️ 第 ${i + 1} 张总耗时: ${(totalImageTime / 1000).toFixed(2)} 秒`);

            generatedImages.push(savedPath);
          }
        }

        if (!hasImages) {
          const failTime = Date.now() - imageStartTimes[i];
          console.log(`⚠️ 第 ${i + 1} 张图片未生成成功，耗时: ${(failTime / 1000).toFixed(2)} 秒`);
        }
      }
    } catch (error) {
      const failTime = Date.now() - imageStartTimes[i];
      console.error(`❌ 第 ${i + 1} 张图片生成失败，耗时: ${(failTime / 1000).toFixed(2)} 秒`, error);
    }
  }

  console.log(`✅ 成功生成 ${generatedImages.length} 张图片 (共尝试 ${imagePrompts.length} 张)`);
  return generatedImages;
}

// ==================== HTML 预览生成函数 ====================

function generateHTMLPreview(content: string, images: string[], outputPath: string): void {
  console.log(`🌐 生成HTML预览...`);

  // 转换图片路径为相对路径
  const relativeImages = images.map(img => {
    const filename = path.basename(img);
    return `./images/${filename}`;
  });

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>信息图预览</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .content-section {
            margin-bottom: 30px;
        }
        .image-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .image-item {
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: #fafafa;
        }
        .image-item img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .image-item h3 {
            margin: 10px 0 5px 0;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        h1 {
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
            text-align: center;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 信息图生成结果</h1>

        <div class="content-section">
            <h2>📝 信息图设计内容</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #3498db;">
                <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${content}</pre>
            </div>
        </div>

        <div class="content-section">
            <h2>🖼️ 生成的配图 (${images.length} 张)</h2>
            <div class="image-gallery">
                ${relativeImages.map((img, index) => `
                    <div class="image-item">
                        <h3>图片 ${index + 1}</h3>
                        <img src="${img}" alt="信息图配图 ${index + 1}" />
                        <p><small>${path.basename(img)}</small></p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="timestamp">
            生成时间: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`📄 HTML预览已保存到: ${outputPath}`);
}

// ==================== 时间记录工具 ====================

interface TimeLog {
  step: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class TimeTracker {
  private logs: TimeLog[] = [];
  private overallStart: number;

  constructor() {
    this.overallStart = Date.now();
    this.log("系统初始化");
  }

  log(stepName: string): void {
    const currentTime = Date.now();

    // 结束上一步
    if (this.logs.length > 0 && !this.logs[this.logs.length - 1].endTime) {
      const lastLog = this.logs[this.logs.length - 1];
      lastLog.endTime = currentTime;
      lastLog.duration = lastLog.endTime - lastLog.startTime;
    }

    // 开始新步骤
    this.logs.push({
      step: stepName,
      startTime: currentTime
    });

    console.log(`⏱️  ${stepName} - 开始时间: ${new Date(currentTime).toLocaleTimeString('zh-CN')}`);
  }

  finish(): void {
    const currentTime = Date.now();

    // 结束最后一步
    if (this.logs.length > 0 && !this.logs[this.logs.length - 1].endTime) {
      const lastLog = this.logs[this.logs.length - 1];
      lastLog.endTime = currentTime;
      lastLog.duration = lastLog.endTime - lastLog.startTime;
    }

    const totalDuration = currentTime - this.overallStart;

    console.log(`\n` + "=".repeat(80));
    console.log(`⏰ 时间统计报告`);
    console.log("=".repeat(80));

    this.logs.forEach((log, index) => {
      if (log.duration) {
        const seconds = (log.duration / 1000).toFixed(2);
        const minutes = (log.duration / 60000).toFixed(2);
        console.log(`📊 步骤 ${index + 1}: ${log.step}`);
        console.log(`   ⏱️  耗时: ${seconds} 秒 (${minutes} 分钟)`);
        console.log(`   🕐 开始: ${new Date(log.startTime).toLocaleTimeString('zh-CN')}`);
        console.log(`   🏁 结束: ${new Date(log.endTime!).toLocaleTimeString('zh-CN')}`);
        console.log("");
      }
    });

    const totalSeconds = (totalDuration / 1000).toFixed(2);
    const totalMinutes = (totalDuration / 60000).toFixed(2);
    console.log(`🎯 总计耗时: ${totalSeconds} 秒 (${totalMinutes} 分钟)`);

    // 计算各步骤耗时占比
    console.log(`\n📈 耗时占比分析:`);
    this.logs.forEach((log) => {
      if (log.duration) {
        const percentage = ((log.duration / totalDuration) * 100).toFixed(1);
        console.log(`   ${log.step}: ${percentage}%`);
      }
    });

    console.log("=".repeat(80));
  }
}

// ==================== 主控制函数 ====================

async function generateFullInfographic(sourceContent: string, userPrompt: string, _options: any = {}): Promise<void> {
  const timeTracker = new TimeTracker();

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseDir = path.join("./output", `infographic_${timestamp}`);

    console.log(`🚀 开始生成完整信息图...`);
    console.log(`📁 输出目录: ${baseDir}`);

    // 创建输出目录
    timeTracker.log("创建输出目录结构");
    const [contentDir, imageDir, previewDir] = createOutputDirectories(baseDir);

    // 第1步：生成信息图内容
    timeTracker.log("第1步：生成信息图内容");
    console.log(`📋 正在分析内容并生成信息图设计方案...`);
    const infographicContent = await generateInfographicContent(sourceContent, userPrompt);
    console.log(`✅ 成功生成信息图内容 (${infographicContent.length} 字符)`);

    // 保存内容
    timeTracker.log("保存内容到文件");
    const contentPath = path.join(contentDir, "infographic_content.md");
    saveMarkdownContent(infographicContent, contentPath);

    // 第2步：转换为图片提示词
    timeTracker.log("第2步：分析内容并生成图片提示词");
    console.log(`🔄 正在分析内容结构，提取关键视觉元素...`);
    const imagePrompts = convertContentToImagePrompt(infographicContent);
    console.log(`✅ 成功生成 ${imagePrompts.length} 个图片提示词`);

    // 第3步：生成图片
    timeTracker.log("第3步：生成配图");
    console.log(`🎨 开始为 ${imagePrompts.length} 个提示词生成图片...`);
    const generatedImages = await generateImages(imagePrompts, imageDir);
    console.log(`✅ 成功生成 ${generatedImages.length} 张图片`);

    // 第4步：生成HTML预览
    timeTracker.log("第4步：生成HTML预览");
    console.log(`🌐 正在生成可视化预览页面...`);
    const previewPath = path.join(previewDir, "index.html");
    generateHTMLPreview(infographicContent, generatedImages, previewPath);
    console.log(`✅ HTML预览页面生成完成`);

    // 完成时间统计
    timeTracker.log("生成结果摘要");

    // 显示结果摘要
    console.log(`\n🎉 信息图生成完成！`);
    console.log(`=`.repeat(50));
    console.log(`📁 输出目录: ${baseDir}`);
    console.log(`📝 内容文件: ${contentPath}`);
    console.log(`🖼️ 图片数量: ${generatedImages.length} 张`);
    console.log(`🌐 预览文件: ${previewPath}`);
    console.log(`💡 在浏览器中打开 ${previewPath} 查看完整结果`);
    console.log(`=`.repeat(50));

    // 显示API使用统计
    console.log(`\n📊 完整工作流执行完毕`);

  } catch (error) {
    console.error("❌ 信息图生成失败:", error);
    if (error instanceof Error) {
      console.error("错误详情:", error.message);
    }
    throw error;
  } finally {
    // 生成完整的时间统计报告
    timeTracker.finish();
  }
}

// ==================== 命令行接口 ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🎨 完整信息图生成系统

使用方法:
  node full-infographic-system.ts "<源内容>" "<用户引导提示>"

选项:
  --test                    使用内置测试案例
  --source-file <文件路径>  从文件读取源内容
  --help                   显示帮助信息

示例:
  node full-infographic-system.ts "第一性原理是一种思维模型" "制作简洁现代的信息图"
  node full-infographic-system.ts --source-file input.txt "适合初学者"
  node full-infographic-system.ts --test
    `);
    process.exit(1);
  }

  if (args[0] === "--help" || args[0] === "-h") {
    console.log(`
🎨 完整信息图生成系统

这个系统可以自动将您的文本内容转换为完整的信息图，包括：
- 专业的信息图设计方案
- 对应的配图
- HTML预览页面

支持的模型:
- 内容生成: google/gemini-3-pro-preview
- 图片生成: google/gemini-3-pro-image-preview

需要的环境变量:
- OPENROUTER_API_KEY: OpenRouter API密钥
    `);
    return;
  }

  if (args[0] === "--test") {
    const testSourceContent = `**第一性原理 (First Principles)** 是一种通过将复杂问题拆解为最基本的"事实"或"真理"，然后从这些基本事实出发重新构建解决方案的思维模型。

简单来说，就是**"不看别人怎么做，只看事物的本质是什么"**。

这种思维方式最早由古希腊哲学家亚里士多德提出，近年来因为特斯拉创始人**埃隆·马斯克 (Elon Musk)** 的大力推崇而在商业和科技界广为人知。

### 核心区别：类比思维 vs. 第一性原理

| 特征 | 类比思维 (Analogy) | 第一性原理 (First Principles) |
| :--- | :--- | :--- |
| **思考方式** | **"照着做"**：参考已有的经验、历史或竞争对手的做法。 | **"拆开看"**：回归事物最基础的物理或逻辑事实，从零推导。 |
| **典型心态** | "别人都这么做，所以我也这么做。" | "这东西在物理学上最基本是由什么构成的？成本极限在哪里？" |
| **结果** | 通常产生微小的改进（从 1 到 N）。 | 容易产生颠覆性的创新（从 0 到 1）。 |
| **难度** | 认知负担低，速度快。 | 认知负担高，需要深度思考。 |

> **形象的比喻：**
> * **类比思维** 就像是一个**厨师 (Cook)**，他照着菜谱做菜。
> * **第一性原理** 就像是一个**大厨 (Chef)**，他了解每一种食材的化学结构，可以创造前所未有的新菜肴。

### 经典案例：SpaceX 的电池成本

**马斯克的第一性原理分析：**
1. **拆解 (Deconstruct)：** 电池到底是由什么组成的？碳、镍、铝、聚合物和一个密封罐。
2. **追究本质 (Identify Basic Truths)：** 在伦敦金属交易所买这些原材料，成本只有 $80/kWh。
3. **重构 (Reconstruct)：** 既然原材料便宜，说明中间环节效率太低。特斯拉建厂优化制造流程。

结果，特斯拉成功将电池成本降低了数倍，颠覆了整个汽车行业。`;

    const testUserPrompt = "请为初学者制作信息图，风格简洁现代，使用蓝色和白色为主色调，适合教育培训";

    console.log("🧪 使用测试案例运行...");
    await generateFullInfographic(testSourceContent, testUserPrompt);
    return;
  }

  if (args[0] === "--source-file" && args[1]) {
    const filePath = args[1];
    const userPrompt = args[2] || "请制作专业的信息图";

    try {
      if (!fs.existsSync(filePath)) {
        console.error(`❌ 文件不存在: ${filePath}`);
        process.exit(1);
      }

      const sourceContent = fs.readFileSync(filePath, 'utf8');
      await generateFullInfographic(sourceContent, userPrompt);
    } catch (error) {
      console.error(`❌ 读取文件失败:`, error);
      process.exit(1);
    }
    return;
  }

  // 直接参数模式
  if (args.length >= 2) {
    const sourceContent = args[0];
    const userPrompt = args[1];
    await generateFullInfographic(sourceContent, userPrompt);
    return;
  }

  console.log("❌ 参数错误，使用 --help 查看帮助信息");
  process.exit(1);
}

// 运行主函数
main().catch(console.error);