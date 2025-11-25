# 🎨 Text2KnowledgeCards

<div align="center">

![Text2KnowledgeCards Logo](https://img.shields.io/badge/Text2KnowledgeCards-AI%20Infographic%20Generator-blue?style=for-the-badge&logo=anthropic)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**🚀 AI-Powered Knowledge Card and Infographic Generation System**

[📖 Documentation](#documentation) • [🛠️ Installation](#installation) • [🎯 Features](#features) • [🎨 Examples](#examples)

</div>

## 📋 Overview

Text2KnowledgeCards is an **intelligent AI-powered system** that transforms text content into visually appealing knowledge cards and infographics. Built with TypeScript and powered by modern AI technologies, it automatically generates structured visual content from plain text, making complex information more digestible and shareable.

### 🎯 Key Features

- **🧠 AI-Powered Generation**: Advanced text analysis and visual synthesis
- **📊 Multiple Output Formats**: Knowledge cards, infographics, and visual summaries
- **🎨 Customizable Templates**: Extensible template system for different visual styles
- **⚡ High Performance**: Optimized TypeScript implementation with async processing
- **🔧 Easy Integration**: Simple API for seamless integration into existing workflows
- **📱 Responsive Design**: Generated visuals work across all devices and platforms

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- TypeScript knowledge (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Text2KnowledgeCards.git
cd Text2KnowledgeCards

# Install dependencies
npm install

# Run the system
npm start
```

### Basic Usage

```typescript
import { Text2KnowledgeCards } from './full-infographic-system';

// Create an instance
const generator = new Text2KnowledgeCards();

// Generate a knowledge card from text
const text = "Machine learning is a subset of artificial intelligence that focuses on algorithms...";
const result = await generator.generateKnowledgeCard(text);

console.log('Generated card:', result.cardData);
console.log('Generated infographic:', result.infographicData);
```

## 📁 Project Structure

```
Text2KnowledgeCards/
├── 🔧 core-system/              # Main generation system
│   ├── 📄 full-infographic-system.ts     # Core system implementation
│   ├── 🖼️ image-generator.ts            # Image generation module
│   └── 📊 infographic-generator.ts      # Infographic creation logic
├── 🎨 skills/                  # Generation skills and templates
│   ├── 🤖 aitemplates-skills/           # AI template integration
│   ├── 👥 anthropic-skills/             # Anthropic AI skills
│   ├── 🚀 composio-skills/              # Productivity enhancement skills
│   ├── 💎 core-skills/                  # Essential generation skills
│   ├── 💾 backup-skills/                # Backup and recovery skills
│   └── 🔧 missing-skills/               # Additional specialized skills
├── 📚 docs/                    # Documentation and guides
├── ⚙️ config/                  # Configuration files
├── 📦 generated-images/         # Generated visual assets
├── 📊 generated-infographics/   # Generated infographic files
├── 🔧 scripts/                 # Utility and automation scripts
├── 📝 logs/                    # System logs
├── 🏗️ SuperClaude/             # Claude integration components
├── 🎯 .claude/                 # Claude-specific configurations
├── 📋 temp/                    # Temporary files and cache
├── 📦 package.json             # Project dependencies
├── 🔒 package-lock.json        # Dependency lock file
└── README.md                  # This file
```

## 🎨 Features

### 🧠 Intelligent Text Analysis
- **Content Summarization**: Extract key points and main ideas
- **Topic Identification**: Automatically categorize content
- **Sentiment Analysis**: Understand emotional tone and mood
- **Entity Recognition**: Identify important names, dates, and concepts

### 📊 Visual Generation
- **Knowledge Cards**: Compact, information-dense cards
- **Infographics**: Multi-panel visual narratives
- **Charts and Graphs**: Data visualization components
- **Icon Libraries**: Extensive collection of relevant icons

### 🎯 Template System
- **Professional Templates**: Business-ready designs
- **Educational Templates**: Learning-focused layouts
- **Social Media Templates**: Optimized for sharing
- **Custom Templates**: Create your own designs

### ⚡ Performance Features
- **Batch Processing**: Generate multiple cards simultaneously
- **Caching System**: Store and reuse generated content
- **Async Processing**: Non-blocking generation pipeline
- **Memory Optimization**: Efficient resource management

## 🔧 Core Components

### Main System (`full-infographic-system.ts`)
The central orchestration system that coordinates all generation processes:

```typescript
export class Text2KnowledgeCards {
  // Initialize the generation system
  constructor(config?: GenerationConfig)

  // Generate a complete knowledge card
  async generateKnowledgeCard(text: string): Promise<KnowledgeCard>

  // Generate infographic with custom template
  async generateInfographic(text: string, template?: Template): Promise<Infographic>

  // Batch process multiple texts
  async batchGenerate(texts: string[]): Promise<GenerationResult[]>
}
```

### Image Generator (`image-generator.ts`)
Handles visual content creation and image processing:

```typescript
export class ImageGenerator {
  // Create card visual from text
  async createCardVisual(content: TextContent): Promise<VisualElement>

  // Generate icons and graphics
  async generateIcon(concept: string): Promise<IconData>

  // Apply visual styling
  async applyStyling(element: VisualElement, style: Style): Promise<StyledElement>
}
```

### Infographic Generator (`infographic-generator.ts`)
Manages infographic layout and composition:

```typescript
export class InfographicGenerator {
  // Create multi-panel infographic
  async createInfographic(panels: Panel[]): Promise<Infographic>

  // Optimize layout for content
  async optimizeLayout(content: ContentData): Promise<Layout>

  // Export in various formats
  async export(infographic: Infographic, format: ExportFormat): Promise<ExportResult>
}
```

## 🎯 Examples

### 📚 实际案例演示

我们通过一个真实的"第一性原理"信息图生成案例，展示 Text2KnowledgeCards 的强大功能。

#### 案例背景
**输入文本**: 关于"第一性原理"思维模型的深度解析
**输出**: 完整的教育信息图，包含内容策划、视觉设计和配图生成

#### 🎯 案例展示：第一性原理信息图

<div align="center">
  <strong>📊 生成结果概览</strong>

| 组件 | 内容 | 生成效果 |
|------|------|----------|
| 📝 **内容策划** | 结构化的信息图设计大纲 | ✅ 完整的教育内容框架 |
| 🎨 **视觉设计** | 蓝白色调的现代扁平设计 | ✅ 符合教育培训场景 |
| 🖼️ **配图生成** | 主题相关的视觉素材 | ✅ 自动生成的专业配图 |
| 📱 **响应式布局** | HTML预览页面 | ✅ 跨设备兼容展示 |

</div>

#### 🧠 生成的内容结构

系统自动将复杂的"第一性原理"概念分解为5个核心模块：

**1. 标题区**
- 主标题：第一性原理 (First Principles)
- 副标题：不看别人怎么做，只看事物的本质是什么
- 权威引用：亚里士多德提出，埃隆·马斯克推崇

**2. 核心隐喻对比**
- 左侧：类比思维 (厨师照菜谱做菜)
- 右侧：第一性原理 (大厨研究食材分子结构)
- 视觉建议：左右分栏对比布局

**3. 深度对比表**
| 维度 | 类比思维 | 第一性原理 |
|------|----------|------------|
| 思考路径 | 参考现有经验 | 回归基础事实 |
| 创新程度 | 1到N的改进 | 0到1的颠覆 |
| 认知难度 | 低认知负担 | 深度思考 |

**4. 实操案例：马斯克电池成本分析**
- Step 1: 拆解 → 识别原材料 (碳、镍、铝等)
- Step 2: 追究本质 → 原材料成本仅 $80/kWh
- Step 3: 重构 → 建厂优化制造流程

**5. 设计规范**
- 色调：蓝色 + 白色主色调
- 风格：简洁现代的扁平化设计
- 受众：教育培训场景的初学者

#### 💻 技术实现示例

```typescript
import { Text2KnowledgeCards } from './full-infographic-system';

const generator = new Text2KnowledgeCards();

// 案例输入：第一性原理概念解析
const firstPrinciplesText = `
第一性原理是一个将复杂问题拆解为最基本的"事实"或"真理"，
然后从这些基本事实出发重新构建解决方案的思维模型。
最早由古希腊哲学家亚里士多德提出，现因埃隆·马斯克的推崇而广为人知。
`;

// 生成完整信息图
const result = await generator.generateInfographic(firstPrinciplesText, {
  template: 'educational-infographic',
  style: 'modern-flat',
  colorScheme: 'blue-white',
  targetAudience: 'beginners'
});

console.log('📊 生成的内容结构:', result.contentStructure);
// 输出: { title, metaphor, comparison, caseStudy, footer }

console.log('🎨 设计规范:', result.designGuidelines);
// 输出: { colorPalette: ['#3B82F6', '#FFFFFF'], style: 'flat', layout: 'comparison' }

console.log('🖼️ 生成的配图:', result.generatedImages);
// 输出: [infographic_image_1.jpeg, ...]
```

#### 📈 生成效果分析

| 指标 | 结果 | 说明 |
|------|------|------|
| **内容完整性** | 100% | 涵盖概念定义、对比分析、实际案例 |
| **结构清晰度** | ⭐⭐⭐⭐⭐ | 5段式逻辑递进，易于理解 |
| **视觉一致性** | ⭐⭐⭐⭐⭐ | 严格遵循蓝白色调，统一风格 |
| **教育价值** | ⭐⭐⭐⭐⭐ | 适合初学者的学习卡片设计 |
| **技术表现** | ⭐⭐⭐⭐⭐ | 自动生成HTML预览 + 配图 + 内容 |

### 💡 基础使用示例

```typescript
// 基础知识卡片生成
const generator = new Text2KnowledgeCards();

const educationalText = `
光合作用是植物将光能转化为化学能的过程。
它在叶绿体中进行，产生氧气作为副产品。
化学方程式：6CO2 + 6H2O + 光能 → C6H12O6 + 6O2
`;

const result = await generator.generateKnowledgeCard(educationalText);
// 返回: { cardData: CardData, infographicData: InfographicData }
```

### 🎨 自定义模板示例

```typescript
// 使用指定模板生成信息图
const infographic = await generator.generateInfographic(
  technicalText,
  {
    style: 'modern-technical',
    colorScheme: 'blue-gradient',
    layout: 'step-by-step',
    audience: 'technical-users'
  }
);
```

### 📦 批量处理示例

```typescript
// 批量生成多个主题
const texts = [
  '机器学习基础概念介绍...',
  '深度学习神经网络原理...',
  '自然语言处理技术应用...'
];

const results = await generator.batchGenerate(texts);
// 返回: GenerationResult[]
```

## 🔧 Configuration

### Environment Setup
Create a `.env` file in the root directory:

```env
# AI Provider Configuration
AI_PROVIDER=anthropic
AI_API_KEY=your_api_key_here

# Generation Settings
MAX_CARD_WIDTH=800
DEFAULT_TEMPLATE=professional
OUTPUT_FORMAT=png

# Performance Settings
BATCH_SIZE=5
CACHE_DURATION=3600
```

### Custom Configuration
```typescript
const config: GenerationConfig = {
  defaultTemplate: 'modern-business',
  outputFormat: 'svg',
  maxWidth: 1200,
  colorPalette: ['#3B82F6', '#10B981', '#F59E0B'],
  fontStack: ['Inter', 'system-ui', 'sans-serif']
};

const generator = new Text2KnowledgeCards(config);
```

## 📊 Skills Integration

The system includes multiple skill categories for enhanced functionality:

### 🤖 AI Templates Skills
- **Document Processing**: Advanced text analysis and extraction
- **Content Creation**: Intelligent content enhancement
- **Visual Design**: Automated layout and styling

### 👥 Anthropic Skills
- **Claude Integration**: Advanced language understanding
- **Context Management**: Sophisticated content analysis
- **Safety Filters**: Content moderation and filtering

### 🚀 Composio Skills
- **Productivity Enhancement**: Workflow automation
- **Data Processing**: Advanced analytics capabilities
- **Integration Tools**: Third-party service connections

### 💎 Core Skills
- **Text Analysis**: Natural language processing
- **Visual Generation**: Computer graphics creation
- **Template Management**: Design pattern handling

## 🛠️ Development

### Project Setup
```bash
# Install development dependencies
npm install --dev

# Run tests
npm test

# Build the project
npm run build

# Start development server
npm run dev
```

### Adding Custom Templates
```typescript
interface CustomTemplate extends Template {
  name: string;
  layout: LayoutConfig;
  styling: StyleConfig;
  components: ComponentLibrary;
}

const myTemplate: CustomTemplate = {
  name: 'my-custom-template',
  layout: { columns: 2, spacing: 'medium' },
  styling: { primaryColor: '#3B82F6', borderRadius: '8px' },
  components: { header: CustomHeader, content: CustomContent }
};

generator.registerTemplate(myTemplate);
```

### Plugin Development
```typescript
export interface TextPlugin {
  name: string;
  process(text: string): Promise<ProcessedText>;
  validate(text: string): boolean;
}

class MyTextPlugin implements TextPlugin {
  name = 'my-text-plugin';

  async process(text: string): Promise<ProcessedText> {
    // Custom text processing logic
    return { processedText, metadata };
  }

  validate(text: string): boolean {
    // Validation logic
    return true;
  }
}
```

## 📈 Performance Metrics

The system tracks various performance metrics:

- **Generation Speed**: Average time per card/infographic
- **Quality Score**: Automated quality assessment
- **Resource Usage**: Memory and CPU consumption
- **Success Rate**: Generation completion statistics
- **User Satisfaction**: Feedback-based metrics

## 🔒 Security & Privacy

- **Data Protection**: All text processing is done securely
- **Privacy First**: No data is stored without permission
- **Content Filtering**: Built-in safety and moderation systems
- **Access Control**: Configurable user permissions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

### Development Workflow
```bash
# Fork and clone
git clone https://github.com/your-username/Text2KnowledgeCards.git
cd Text2KnowledgeCards

# Create feature branch
git checkout -b feature/your-feature

# Install and test
npm install
npm test

# Submit pull request
git push origin feature/your-feature
```

## 📞 Support

- **📧 Email**: support@text2knowledgecards.com
- **🐛 Issues**: [GitHub Issues](https://github.com/your-username/Text2KnowledgeCards/issues)
- **📖 Documentation**: [Full Documentation](docs/)
- **💬 Community**: [Discord Server](https://discord.gg/text2knowledgecards)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Anthropic](https://www.anthropic.com/)**: Claude AI platform
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Node.js](https://nodejs.org/)**: JavaScript runtime
- **Open Source Community**: All contributors and supporters

---

<div align="center">

**🎨 Transform text into visual knowledge with Text2KnowledgeCards!**

Made with ❤️ by the AI generation community

[⭐ Star this repo](https://github.com/your-username/Text2KnowledgeCards) • [🔧 Report Issues](https://github.com/your-username/Text2KnowledgeCards/issues) • [📖 View Full Docs](docs/)

</div>