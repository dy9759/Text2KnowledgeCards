# Text2KnowledgeCard 项目深度分析报告

## 项目概述
创建一个Text2KnowledgeCard模型，将文字内容转换为手绘黑板报风格的知识卡片图像。

## 核心功能分析
- **输入**: 文字描述（用户提示词）
- **输出**: 图像（读书笔记、知识卡片、新闻总结）
- **风格**: 手绘黑板报，教师教学风格
- **特点**: 图表化、易于理解的表达方式

## 技术栈选型

### 前端技术栈
- **React 18 + TypeScript**: 现代化开发体验，类型安全
- **Vite**: 快速构建工具，开发体验优秀
- **Tailwind CSS**: 实用优先的CSS框架，快速样式开发
- **React Query**: 数据获取和缓存，异步状态管理
- **Zustand**: 轻量级状态管理，避免过度复杂化
- **React Router**: 路由管理，支持多页面应用
- **Framer Motion**: 动画效果，提升用户体验

### 后端技术栈
- **Node.js + Express.js**: 轻量级API服务，易于部署
- **TypeScript**: 前后端统一类型系统
- **Prisma**: 现代化ORM，类型安全的数据库操作
- **Redis**: 缓存和会话管理，提升性能
- **Bull Queue**: 任务队列管理，处理生成请求
- **Winston**: 结构化日志管理

### API集成
- **OpenRouter SDK**: @openrouter/sdk
- **目标模型**: google/gemini-3-pro-image-preview
- **多模态支持**: modalities: ["image", "text"]
- **API密钥**: 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

## 系统架构设计

### 整体架构
- **架构模式**: 前后端分离 + 微服务思维
- **数据流**: 用户输入 → 提示词处理 → API调用 → 结果返回 → 展示存储
- **状态管理**: 前端状态管理 + 后端持久化存储

### 核心组件
1. **前端组件**:
   - InputArea: 用户输入区域
   - PreviewArea: 图像预览和展示
   - CardGallery: 生成历史画廊
   - Settings: 用户配置和偏好设置

2. **后端服务**:
   - API Gateway: 请求路由和认证
   - Generation Service: OpenRouter API集成
   - Template Service: 提示词模板管理
   - Cache Service: 缓存管理

## 提示词工程策略

### 核心提示词模板
```
你是一位经验丰富的教师，擅长将复杂信息转化为清晰易懂的黑板报风格信息图。
请根据以下[用户输入]，创建一个手绘风格的知识卡片：

[用户输入内容]

要求：
- 黑板背景，粉笔字体效果
- 结构化布局，包含标题、要点、图解
- 教师风格，条理清晰，逻辑性强
- 适合学生理解的简化表达
- 手绘图表和示意图，增强理解
```

### 模板分类
1. **读书笔记模板**: 适用于书籍内容总结
2. **新闻总结模板**: 适用于时事新闻分析
3. **知识点模板**: 适用于概念解释和教学
4. **自定义模板**: 用户自定义风格和格式

## 数据库设计

### 核心表结构
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  api_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 生成历史表
CREATE TABLE generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  template_used VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 模板表
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prompt_template TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API设计

### 核心端点
1. **POST /api/generate**: 生成知识卡片
   - 输入: `{ prompt: string, type: string, template?: string }`
   - 输出: `{ imageUrl: string, generationId: string }`

2. **GET /api/history**: 获取生成历史
   - 查询参数: `?page=1&limit=20&type=all`
   - 输出: `{ generations: Array[], total: number }`

3. **GET /api/templates**: 获取可用模板
   - 输出: `{ templates: Array[] }`

4. **POST /api/feedback**: 用户反馈
   - 输入: `{ generationId: string, rating: number, comment?: string }`

## 开发里程碑

### 第一阶段：MVP核心功能 (2-3周)
- [x] 基础前端界面搭建
- [x] OpenRouter API集成
- [x] 基础提示词模板
- [x] 简单错误处理

### 第二阶段：用户体验优化 (2-3周)
- [ ] 生成历史管理
- [ ] 多种内容类型模板
- [ ] 图片下载和分享功能
- [ ] 进度指示和加载状态优化

### 第三阶段：高级功能扩展 (3-4周)
- [ ] 用户系统和身份验证
- [ ] 高级模板自定义功能
- [ ] 批量生成和处理
- [ ] 社交分享集成

### 第四阶段：部署和监控 (1-2周)
- [ ] 生产环境部署配置
- [ ] 监控、日志和错误追踪
- [ ] 性能优化和压力测试
- [ ] 用户反馈收集和分析

## 风险评估和缓解策略

### 技术风险
1. **API依赖风险**: 准备多个模型作为备选方案
2. **性能瓶颈**: 实现请求队列和缓存机制
3. **成本控制**: 实施使用量限制和监控

### 产品风险
1. **质量控制**: 建立用户反馈机制和持续迭代
2. **用户接受度**: 充分的用户测试和体验优化
3. **竞争差异化**: 专注于独特的手绘教学风格

## 部署架构

### 前端部署
- **平台**: Vercel 或 Netlify
- **优势**: 自动部署、全球CDN、HTTPS支持
- **配置**: 环境变量管理、构建优化

### 后端部署
- **平台**: Railway、Heroku 或 AWS ECS
- **数据库**: 托管PostgreSQL (如Supabase)
- **缓存**: Redis Cloud 或 AWS ElastiCache
- **监控**: Sentry + 自定义监控面板

## 成功指标

### 技术指标
- API响应时间 < 10秒
- 系统可用性 > 99%
- 错误率 < 1%

### 产品指标
- 用户转化率 > 15%
- 日活跃用户增长
- 用户满意度评分 > 4.0/5.0
- 分享率 > 10%