import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 加载环境变量
config();

// 直接调用 OpenRouter API 来支持 modalities 参数
async function callOpenRouterAPI(payload: any): Promise<any> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost:3000",
      "X-Title": "Image Generation App"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// 创建输出目录
const outputDir = "./generated-images";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 将 base64 数据保存为图片文件
function saveBase64Image(base64Data: string, filename: string): string {
  // 提取 base64 数据（去掉 data:image/png;base64, 前缀）
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image format");
  }

  const imageType = matches[1];
  const base64Content = matches[2];

  // 创建文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fullFilename = `${filename}_${timestamp}.${imageType}`;
  const filepath = path.join(outputDir, fullFilename);

  // 保存图片
  const buffer = Buffer.from(base64Content, 'base64');
  fs.writeFileSync(filepath, buffer);

  console.log(`📸 图片已保存到: ${filepath}`);
  return filepath;
}

async function generateImage(prompt: string): Promise<void> {
  try {
    console.log(`🎨 正在为提示词生成图像: "${prompt}"`);

    // 使用支持图像生成的模型
    const payload = {
      model: "google/gemini-3-pro-image-preview",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      modalities: ["image", "text"], // 启用图像和文本模态
      stream: false
      // 可选：配置图像生成参数
      // image_config: {
      //   aspect_ratio: "16:9" // 可选的宽高比
      // }
    };

    const result = await callOpenRouterAPI(payload);

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];
      const message = choice.message;

      console.log("📝 模型回复内容:", message.content || "无文本内容");

      // 检查响应中的内容格式，寻找图像数据
      let hasImages = false;

      // 检查 message 是否包含 images 属性（可能类型定义不完整）
      if ((message as any).images && (message as any).images.length > 0) {
        hasImages = true;
        console.log(`\n✅ 成功生成 ${(message as any).images.length} 张图片:`);

        (message as any).images.forEach((image: any, index: number) => {
          if (image.image_url && image.image_url.url) {
            const imageUrl = image.image_url.url;

            if (imageUrl.startsWith('data:')) {
              // Base64 编码的图片
              try {
                saveBase64Image(imageUrl, `generated_image_${index + 1}`);
                console.log(`   图片 ${index + 1}: Base64 图片已保存 (${imageUrl.length} 字符)`);
              } catch (error) {
                console.error(`   ❌ 保存图片 ${index + 1} 失败:`, error);
              }
            } else {
              // HTTP 图片链接
              console.log(`   图片 ${index + 1}: ${imageUrl}`);
              console.log(`   💡 您可以通过上述链接下载图片`);
            }
          } else {
            console.log(`   图片 ${index + 1}: 格式不支持`, JSON.stringify(image, null, 2));
          }
        });
      }

      // 如果没有直接的 images 属性，尝试从内容中提取图像数据
      if (!hasImages && message.content) {
        let contentText = "";
        if (typeof message.content === 'string') {
          contentText = message.content;
        } else if (Array.isArray(message.content)) {
          // 处理内容数组，寻找图像数据
          for (const item of message.content) {
            if ((item as any).type === 'text') {
              contentText += (item as any).text + '\n';
            } else if ((item as any).type === 'image_url') {
              hasImages = true;
              const imageUrl = (item as any).image_url?.url;
              if (imageUrl) {
                console.log(`\n✅ 在内容中找到图像数据:`);
                if (imageUrl.startsWith('data:')) {
                  try {
                    saveBase64Image(imageUrl, `generated_image_content`);
                    console.log(`   内容图像: Base64 图片已保存`);
                  } catch (error) {
                    console.error(`   ❌ 保存内容图像失败:`, error);
                  }
                } else {
                  console.log(`   内容图像: ${imageUrl}`);
                }
              }
            }
          }
        }

        // 在文本内容中搜索 base64 图像
        const base64Regex = /data:image\/\w+;base64,[A-Za-z0-9+/=]+/g;
        const base64Images = contentText.match(base64Regex);

        if (base64Images && base64Images.length > 0) {
          hasImages = true;
          console.log(`\n✅ 在文本中找到 ${base64Images.length} 个 base64 图像:`);
          base64Images.forEach((img, index) => {
            try {
              saveBase64Image(img, `text_extracted_image_${index + 1}`);
              console.log(`   文本图像 ${index + 1}: Base64 图片已保存`);
            } catch (error) {
              console.error(`   ❌ 保存文本图像 ${index + 1} 失败:`, error);
            }
          });
        }
      }

      if (!hasImages) {
        console.log("\n⚠️  未找到生成的图像数据");
        console.log("💡 可能的原因:");
        console.log("   1. 该模型可能不支持图像生成，或需要特定的请求格式");
        console.log("   2. 提示词可能需要明确要求生成图像");
        console.log("   3. 可能需要不同的 API 端点或参数");
        console.log("   4. SDK 类型定义可能不完整，实际图像数据可能存在于响应中");

        // 显示完整的响应结构用于调试
        console.log("\n🔍 完整选择项结构:", JSON.stringify(choice, null, 2));
      }
    } else {
      console.log("❌ API 响应中没有选择项");
    }

    // 显示令牌使用情况
    if (result.usage) {
      console.log(`\n📊 API 使用统计:`);
      console.log(`   输入令牌: ${result.usage.promptTokens || result.usage.prompt_tokens || 0}`);
      console.log(`   输出令牌: ${result.usage.completionTokens || result.usage.completion_tokens || 0}`);
      console.log(`   总令牌: ${result.usage.totalTokens || result.usage.total_tokens || 0}`);
    } else {
      console.log(`\n⚠️  未找到 usage 信息`);
    }

  } catch (error) {
    console.error("❌ 图像生成错误:", error);
    if (error instanceof Error) {
      console.error("错误详情:", error.message);
      console.error("错误堆栈:", error.stack);
    }
  }
}

// 示例用法 - 您可以通过命令行参数传入任何提示词
const prompt = process.argv[2] || "Generate a beautiful sunset over mountains with vibrant colors";
generateImage(prompt);