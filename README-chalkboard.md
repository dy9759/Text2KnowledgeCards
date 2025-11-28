# Chalkboard Infographic Generator

A specialized tool for creating educational infographics with a black chalkboard aesthetic using colored chalk drawings in the "nano banana pro" style.

## Features

- **Black Chalkboard Background**: All images use a classic black chalkboard background
- **Colored Chalk Style**: All text and visual elements are drawn in colored chalk (no realistic illustrations)
- **Minimalistic Design**: Simple cartoon elements, icons, and portraits
- **Horizontal Layout**: 16:9 aspect ratio optimized for presentations and screens
- **Educational Focus**: Emphasizes keywords and core concepts with ample whitespace
- **Nano Banana Pro Style**: Cute, simple, and educational drawing aesthetic

## Installation

1. Ensure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in `.env`:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

## Usage

### Quick Start

```bash
# Direct content input
node generate-chalkboard.js "First principles thinking method"

# From file
node generate-chalkboard.js --file content.txt

# With custom style
node generate-chalkboard.js "Your content" --style "cute and colorful" --colors "white, yellow, pink, blue"

# Test example
node generate-chalkboard.js --test

# Interactive mode
node generate-chalkboard.js --interactive
```

### Advanced Usage

For more control, use the TypeScript version directly:

```bash
npx ts-node chalkboard-infographic-generator.ts "Your content" "Your guidance"
```

### Options

- `--style <description>`: Customize the drawing style (default: "minimalistic educational style")
- `--colors <colors>`: Specify chalk colors (default: "white, yellow, blue, green")
- `--file <path>`: Read content from a file
- `--test`: Run with built-in test content
- `--interactive`: Enter content interactively

## Output Structure

The generator creates a timestamped output directory containing:

```
output/chalkboard_YYYY-MM-DDTHH-MM-SS/
├── content/
│   └── chalkboard_content.md    # Generated content structure
├── images/
│   └── chalkboard_infographic_1.png  # Generated chalkboard image
└── preview/
    └── index.html               # HTML preview with chalkboard theme
```

## Style Guidelines

### Default Style Characteristics

1. **Background**: Always black chalkboard
2. **Text**: Colored chalk with multiple colors available
3. **Images**: Simple chalk drawings only (no photos or realistic illustrations)
4. **Layout**: Horizontal 16:9 with clean organization
5. **Elements**:
   - Minimalistic cartoon characters
   - Simple icons and symbols
   - Decorative chalk borders and arrows
   - Portrait sketches for famous figures

### "Nano Banana Pro" Style

- Cute and approachable
- Educational and friendly
- Simplified forms
- Clear and readable
- Engaging for students

## Examples

### Test Input
```
第一性原理是一种思维模型，通过将复杂问题拆解为最基本的"事实"或"真理"，然后从这些基本事实出发重新构建解决方案。

简单来说，就是"不看别人怎么做，只看事物的本质是什么"。

这种思维方式最早由古希腊哲学家亚里士多德提出，近年来因为特斯拉创始人埃隆·马斯克的大力推崇而在商业和科技界广为人知。
```

### Generated Output
- Black chalkboard background
- Title in colorful chalk
- Key points with chalk bullet points
- Simple cartoon portrait of Aristotle and Musk
- Chalk arrows and decorative elements
- Clean, educational layout

## API Integration

The system uses OpenRouter API with:
- **Content Generation**: `google/gemini-3-pro-preview`
- **Image Generation**: `google/gemini-3-pro-image-preview`

## Tips for Best Results

1. **Keep Content Focused**: Provide clear, concise information
2. **Specify Audience**: Mention if content is for beginners, students, or professionals
3. **Language**: The system maintains the original language unless specified otherwise
4. **Visual Elements**: The system automatically detects when to add:
   - Comparison charts
   - Flow diagrams
   - Example illustrations
   - Portrait sketches

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your `.env` file contains a valid `OPENROUTER_API_KEY`
2. **No Images Generated**: Check API quotas and try again
3. **Style Not Applied**: Ensure prompt includes "chalkboard style" and "nano banana pro"

### Debug Mode

For detailed logging, run with:
```bash
DEBUG=1 node generate-chalkboard.js "Your content"
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this tool for educational and commercial purposes.