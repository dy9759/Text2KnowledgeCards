# 🎨 粉笔画信息图生成器 - 快速开始指南

## ✅ 正确的命令格式

由于你的项目使用 ES 模块，请使用 `.mjs` 扩展名：

```bash
# ✅ 正确 - 使用 .mjs 文件
node generate-chalkboard.mjs "你的内容"

# ❌ 错误 - 不要使用 .js 文件
node generate-chalkboard.js "你的内容"  # 这会导致 require 错误
```

## 🚀 快速测试

```bash
# 运行内置测试
node generate-chalkboard.mjs --test

# 使用示例文件
node generate-chalkboard.mjs --file examples/first-principles.txt
```

## 📝 实际使用案例

### 1. 简单文本输入
```bash
# 英文内容
node generate-chalkboard.mjs "The water cycle: evaporation, condensation, precipitation"

# 中文内容
node generate-chalkboard.mjs "光合作用是植物将光能转化为化学能的过程"
```

### 2. 自定义风格和颜色
```bash
# 注意：参数要在一行内，用引号包围
node generate-chalkboard.mjs "你的内容" --style "cute educational style" --colors "white, yellow, pink, blue"

# 科学图表风格
node generate-chalkboard.mjs "Your scientific content" --style "scientific diagram style"
```

### 3. 从文件读取
```bash
node generate-chalkboard.mjs --file examples/first-principles.txt --style "professional educational"
```

### 4. 交互模式
```bash
node generate-chalkboard.mjs --interactive
# 然后粘贴内容，按 Ctrl+D 结束
```

## 🔧 高级用法

### 批量生成多个文件
```bash
# 创建脚本文件 batch-generate.mjs
import fs from 'fs';

const files = fs.readdirSync('examples').filter(f => f.endsWith('.txt'));

for (const file of files) {
  const content = fs.readFileSync(`examples/${file}`, 'utf8');
  console.log(`Generating for: ${file}`);
  // 使用 execSync 或 spawn 调用生成器
}
```

### 使用 TypeScript 直接调用
```bash
npx ts-node chalkboard-infographic-generator.ts "内容" "用户提示"
```

## 📁 输出位置

生成的内容保存在：
```
output/chalkboard_2025-XX-XX/
├── content/chalkboard_content.md      # 文字内容
├── images/chalkboard_infographic_1.jpeg  # 粉笔画图片
└── preview/index.html                  # 预览页面
```

## 🎯 最佳实践

1. **保持内容简洁**：专注于核心概念
2. **指定受众**：说明是给学生、初学者还是专业人士
3. **使用描述性风格提示**：
   - "cute educational style for students"
   - "professional corporate training style"
   - "scientific diagram style"
4. **语言保持**：系统默认保持输入内容的语言

## ❌ 常见错误

```bash
# 错误1：忘记引号
node generate-chalkboard.mjs The water cycle  # ❌

# 正确：加引号
node generate-chalkboard.mjs "The water cycle"  # ✅

# 错误2：参数换行
node generate-chalkboard.mjs "content"
--style "cute"  # ❌

# 正确：单行命令
node generate-chalkboard.mjs "content" --style "cute"  # ✅

# 错误3：使用 .js 文件
node generate-chalkboard.js "content"  # ❌ require 错误

# 正确：使用 .mjs 文件
node generate-chalkboard.mjs "content"  # ✅
```

## 💡 提示

- 首次运行可能需要安装 TypeScript 和 ts-node
- 确保你的 `.env` 文件有正确的 `OPENROUTER_API_KEY`
- 生成时间通常为 30-60 秒

## 🔍 查看结果

生成完成后，打开 HTML 文件查看：
```bash
open output/chalkboard_*/preview/index.html
```

现在你可以开始创建漂亮的粉笔画风格教育信息图了！