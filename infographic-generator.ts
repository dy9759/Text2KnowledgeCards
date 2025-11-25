import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 加载环境变量
config();

// 直接调用 OpenRouter API 来支持 Gemini 3 Pro Preview
async function callOpenRouterAPI(payload: any): Promise<any> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost:3000",
      "X-Title": "Infographic Content Generator"
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
const outputDir = "./generated-infographics";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 保存内容到 Markdown 文件
function saveContentToFile(content: string, filename: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fullFilename = `${filename}_${timestamp}.md`;
  const filepath = path.join(outputDir, fullFilename);

  fs.writeFileSync(filepath, content, 'utf8');

  console.log(`📝 信息图内容已保存到: ${filepath}`);
  return filepath;
}

// 生成信息图内容的系统提示词
const SYSTEM_PROMPT = `你是一位世界级的教学设计师。你是一位擅长制作清晰、简洁且引人入胜的学习材料的大师。你也是一位视觉设计专家，懂得如何利用视觉元素将复杂的概念以通俗易懂的方式传达出来。同时，你还是讲故事的大师，懂得如何运用故事让学习过程更令人难忘且充满趣味。

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

规则 3：无新增信息。不要添加任何源文档中不存在的信息。

规则 4：源数据处理。源文档中的所有数据必须逐字复制。不要进行总结或改写。`;

async function generateInfographicContent(sourceContent: string, userPrompt: string): Promise<void> {
  try {
    console.log(`🎨 正在为源内容生成信息图内容...`);
    console.log(`📄 源内容长度: ${sourceContent.length} 字符`);

    const payload = {
      model: "google/gemini-3-pro-preview",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
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
        console.log("\n✅ 成功生成信息图内容!");

        // 生成文件名
        const filename = "infographic_content";

        // 保存内容到文件
        const filepath = saveContentToFile(message.content, filename);

        console.log(`\n📋 生成的内容预览:`);
        console.log("=".repeat(50));
        console.log(message.content.substring(0, 500) + (message.content.length > 500 ? "..." : ""));
        console.log("=".repeat(50));

      } else {
        console.log("❌ 响应中没有内容");
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
    console.error("❌ 信息图内容生成错误:", error);
    if (error instanceof Error) {
      console.error("错误详情:", error.message);
      console.error("错误堆栈:", error.stack);
    }
  }
}

// 示例用法 - 从命令行参数或文件读取内容
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 && args[0] !== "--test") {
    console.log(`
❌ 缺少必要参数

使用方法:
  node infographic-generator.ts "<源内容>" "<用户引导提示>"

示例:
  node infographic-generator.ts "第一性原理是一种思维模型..." "请为初学者制作信息图"

或者使用测试案例:
  node infographic-generator.ts --test
    `);
    process.exit(1);
  }

  // 测试案例
  if (args[0] === "--test") {
    const testSourceContent = `**第一性原理 (First Principles)** 是一种通过将复杂问题拆解为最基本的"事实"或"真理"，然后从这些基本事实出发重新构建解决方案的思维模型。

简单来说，就是**"不看别人怎么做，只看事物的本质是什么"**。

这种思维方式最早由古希腊哲学家亚里士多德提出，近年来因为特斯拉创始人**埃隆·马斯克 (Elon Musk)** 的大力推崇而在商业和科技界广为人知。

---

### 1. 核心区别：类比思维 vs. 第一性原理

为了理解它，我们需要将其与我们最常用的**"类比思维" (Reasoning by Analogy)** 做对比：

| 特征 | 类比思维 (Analogy) | 第一性原理 (First Principles) |
| :--- | :--- | :--- |
| **思考方式** | **"照着做"**：参考已有的经验、历史或竞争对手的做法。 | **"拆开看"**：回归事物最基础的物理或逻辑事实，从零推导。 |
| **典型心态** | "别人都这么做，所以我也这么做。" | "这东西在物理学上最基本是由什么构成的？成本极限在哪里？" |
| **结果** | 通常产生微小的改进（从 1 到 N）。 | 容易产生颠覆性的创新（从 0 到 1）。 |
| **难度** | 认知负担低，速度快。 | 认知负担高，需要深度思考。 |

> **形象的比喻：**
> * **类比思维** 就像是一个**厨师 (Cook)**，他照着菜谱做菜，虽然能做出好吃的饭，但他只能在原有基础上微调。
> * **第一性原理** 就像是一个**大厨 (Chef)**，他了解每一种食材的化学分子结构和热力学原理，因此他可以抛弃菜谱，创造出前所未有的新菜肴。

---

### 2. 经典案例：SpaceX 的电池成本

埃隆·马斯克在创立 SpaceX 和特斯拉时，是第一性原理的最佳践行者。

**问题：** 大家都认为电动车的电池太贵了，没法普及。
**类比思维的结论：** "电池组过去一直很贵（约 $600/kWh），未来也会这么贵，这是市场行情。"

**马斯克的第一性原理分析：**
1.  **拆解 (Deconstruct)：** 电池到底是由什么组成的？
    * 它是碳、镍、铝、聚合物和一个密封罐。
2.  **追究本质 (Identify Basic Truths)：** 如果我去伦敦金属交易所买这些原材料，需要多少钱？
    * 计算结果是：原材料成本只有 $80/kWh。
3.  **重构 (Reconstruct)：** 既然原材料这么便宜，为什么电池这么贵？
    * 说明中间环节（制造、整合、供应链）效率太低。
    * **结论：** 特斯拉必须自己建厂（Gigafactory），优化制造流程，直接把原材料变成电池。

结果，特斯拉成功将电池成本降低了数倍，颠覆了整个汽车行业。

---

### 3. 如何运用第一性原理？（三步法）

如果你想在工作或生活中使用这种思维，可以遵循以下三个步骤：

1.  **识别并打破假设 (Identify and Break Assumptions)**
    * 面对一个难题，先列出所有你认为"理所当然"的假设（例如："在这个行业，必须通过经销商销售"）。
    * 问自己："这真的是真理吗？还是只是大家都习惯这么做？"

2.  **拆解到基本事实 (Break Down to Basic Truths)**
    * 将问题像剥洋葱一样拆解，直到剩下的只有无法辩驳的事实（物理定律、基本成本、人性底层需求等）。

3.  **从零开始重构 (Reconstruct from Scratch)**
    * 利用这些基本事实，重新设计解决方案，不要管以前是怎么做的，只管现在的目标怎么用这些基本素材达成。

---

### 总结

第一性原理是一种**"看透本质，回归原点"**的智慧。它虽然消耗脑力，但在面对那些看似无解的复杂问题，或者需要进行颠覆性创新时，它是最强有力的武器。

**我可以为你做一个具体的练习：**

你可以告诉我一个你目前在工作或生活中遇到的**棘手难题**（比如"我想转行但觉得太晚了"或者"公司的获客成本太高"），我来试着帮你用**第一性原理**进行拆解和分析。`;

    const testUserPrompt = "请为初学者制作信息图，风格简洁现代，使用蓝色和白色为主色调";

    console.log("🧪 使用测试案例运行...");
    await generateInfographicContent(testSourceContent, testUserPrompt);
    return;
  }

  const sourceContent = args[0];
  const userPrompt = args[1];

  await generateInfographicContent(sourceContent, userPrompt);
}

// 运行主函数
main().catch(console.error);