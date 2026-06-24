# Arjun - Smart Context for Kiro

Arjun is a VSCode extension that reduces token consumption when using Kiro and other AI coding assistants. It intelligently analyzes your repository and provides compressed, ranked context to maximize efficiency.

## Features

⚡ **Intelligent File Ranking** - Uses PageRank-like algorithms (from Aider) to identify the most relevant files for your context

🗜️ **Smart Compression** - Removes comments, docstrings, and normalizes content while preserving structure

📊 **Token Tracking** - Displays real-time token savings and estimated cost reduction

🔍 **Repository Analysis** - Builds a dependency graph and symbol index for your codebase

📋 **One-Click Export** - Copy optimized context directly to Kiro

## Quick Start

1. Open a folder in VSCode
2. Click the Arjun icon (⚡) in the sidebar
3. Run "Arjun: Analyze Repository" to build the context map
4. Run "Arjun: Build Optimized Context" to generate compressed context
5. Click "Copy Context to Clipboard" and paste into Kiro

## Commands

- **Arjun: Analyze Repository** - Scan and index your codebase
- **Arjun: Build Optimized Context** - Generate token-optimized context for your current prompt
- **Arjun: Compress Current File** - Show compression stats for the active file
- **Arjun: Compress Logs** - Compress error logs with deduplication

## How It Works

### 1. Repository Intelligence
Arjun builds a dependency graph of your codebase by:
- Extracting symbols (classes, functions, constants)
- Detecting imports and references
- Building file importance scores using PageRank
- Caching results for fast repeated access

### 2. Smart Compression
- **Code**: Removes comments, docstrings, normalizes whitespace
- **Logs**: Groups similar errors, tracks occurrences
- **JSON**: Removes null values, empty structures
- **General**: Adaptive sizing based on content type

### 3. Token Budgeting
- Respects your context window limit
- Prioritizes high-rank files
- Compresses intelligently to fit more into budget
- Displays real-time savings

## Architecture

- **Analyzer**: Builds repository map using symbol extraction
- **Compressor**: Format-aware compression (code, logs, JSON)
- **Token Estimator**: Tracks tokens saved and cost reduction
- **Context Builder**: Orchestrates ranking, compression, and budgeting

## Technologies

Built with:
- Aider's PageRank ranking algorithm (Apache 2.0)
- Tree-Sitter-inspired symbol extraction
- Headroom's compression patterns
- VSCode WebView for stats display

## Performance

Typical savings:
- **Code files**: 40-70% token reduction
- **Logs**: 80-95% reduction with deduplication
- **JSON**: 30-50% reduction with structure preservation

## License

Apache 2.0 - Reuses battle-tested code from Aider and Headroom projects
