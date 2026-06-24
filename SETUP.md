# Arjun Setup & Development Guide

## Prerequisites

- Node.js 16+
- npm 7+
- VSCode 1.80+

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Extension
```bash
npm run esbuild
```

### 3. Launch Development Extension
```bash
npm run dev
```

This opens VSCode with Arjun loaded.

### 4. Test Commands

In the launched VSCode window:
1. Open a folder (e.g., this repo)
2. Click the Arjun icon (⚡) in the Activity Bar
3. Run "Arjun: Analyze Repository" (Cmd+Shift+P)
4. Run "Arjun: Build Optimized Context"

## Development

### Watch Mode
```bash
npm run watch
```

Rebuilds on every file change.

### File Structure
```
src/
├── analyzer/           # Repository analysis
│   └── repoAnalyzer.ts # File ranking, symbol extraction
├── compression/        # Content compression
│   └── compressor.ts   # Code, log, JSON compression
├── context/            # Context orchestration
│   └── contextBuilder.ts # Combines analysis + compression
├── tokens/             # Token estimation
│   └── tokenEstimator.ts
├── ui/                 # VSCode UI
│   ├── treeProvider.ts # File tree in sidebar
│   └── statsPanel.ts   # Token stats webview
└── extension.ts        # Main extension entry
```

### Common Tasks

**Debug RepoAnalyzer output**:
```typescript
const analyzer = new RepoAnalyzer(folderPath);
await analyzer.analyze();
console.log(analyzer.getTopFiles(5));
```

**Test compression**:
```typescript
const compressor = new Compressor();
const result = compressor.compressCode(code, 'typescript');
console.log(`${result.original} → ${result.compressed} tokens`);
```

## Publishing

### Package Extension
```bash
npm install -g @vscode/vsce
vsce package
```

Creates `arjun-0.1.0.vsix`

### Install Locally
```bash
code --install-extension arjun-0.1.0.vsix
```

## Configuration

Edit `package.json` to customize:
- Extension name, description, version
- Commands
- UI (views, icons)
- Activation events

## Troubleshooting

**Extension not activating?**
- Check "Extensions" sidebar for errors
- Enable debug output: `Developer: Toggle Developer Tools`

**Tree view shows no files?**
- Run "Arjun: Analyze Repository" first
- Check folder has supported file types

**Build fails?**
- Ensure Node.js 16+ is installed
- Delete `node_modules/` and retry: `npm install && npm run esbuild`

## Next Steps

1. **Test with real Kiro** - Use generated context in Kiro conversations
2. **Gather feedback** - Track token reduction in practice
3. **Performance optimization** - Profile with large repos
4. **Enhanced symbol extraction** - Integrate Tree-Sitter for accuracy
5. **Caching** - Add SQLite for persistent tag storage

## Contributing

Focus areas for the team:
- [ ] Test with different project types
- [ ] Measure actual token savings vs. estimates
- [ ] Add language-specific compressors
- [ ] Performance optimization for 100k+ file repos
- [ ] Integration feedback from Kiro users
