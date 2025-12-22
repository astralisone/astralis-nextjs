---
description: How to use Repomix to pack the repository for AI context
---

### Usage

To pack your entire repository:
```bash
repomix
```

To pack a specific directory:
```bash
repomix path/to/directory
```

To pack specific files or directories using glob patterns:
```bash
repomix --include "src/**/*.ts,**/*.md"
```

To exclude specific files or directories:
```bash
repomix --ignore "**/*.log,tmp/"
```

To pack a remote repository:
```bash
# Using shorthand format
npx repomix --remote yamadashy/repomix

# Using full URL (supports branches and specific paths)
npx repomix --remote https://github.com/yamadashy/repomix
npx repomix --remote https://github.com/yamadashy/repomix/tree/main

# Using commit's URL
npx repomix --remote https://github.com/yamadashy/repomix/commit/836abcd7335137228ad77feb28655d85712680f1
```

To initialize a new configuration file (`repomix.config.json`):
```bash
repomix --init
```

Once you have generated the packed file, you can use it with Generative AI tools like Claude, ChatGPT, and Gemini.

### Docker Usage

You can also run Repomix using Docker 🐳

Basic usage (current directory):
```bash
docker run -v .:/app -it --rm ghcr.io/yamadashy/repomix
```

To pack a specific directory:
```bash
docker run -v .:/app -it --rm ghcr.io/yamadashy/repomix path/to/directory
```

Process a remote repository and output to a output directory:
```bash
docker run -v ./output:/app -it --rm ghcr.io/yamadashy/repomix --remote https://github.com/yamadashy/repomix
```

### Output Formats

Choose your preferred output format:
```bash
# XML format (default)
repomix --style xml

# Markdown format
repomix --style markdown

# JSON format
repomix --style json

# Plain text format
repomix --style plain
```

### Customization

Create a `repomix.config.json` for persistent settings:
```json
{
  "output": {
    "style": "markdown",
    "filePath": "custom-output.md",
    "removeComments": true,
    "showLineNumbers": true,
    "topFilesLength": 10
  },
  "ignore": {
    "customPatterns": ["*.test.ts", "docs/**"]
  }
}
```

### Power Users Guide

Repomix offers powerful features for advanced use cases:
- **MCP Server** - Model Context Protocol integration for AI assistants
- **GitHub Actions** - Automate codebase packing in CI/CD workflows
- **Code Compression** - Tree-sitter based intelligent compression (~70% token reduction)
- **Using as Library** - Integrate Repomix into your Node.js applications
- **Custom Instructions** - Add custom prompts and instructions to outputs
- **Security Features** - Built-in Secretlint integration and safety checks
- **Best Practices** - Optimize your AI workflows with proven strategies
