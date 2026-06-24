# Arjun Architecture

## Overview

Arjun is a VSCode extension that optimizes context for AI coding assistants (Kiro, Claude, etc.) by:
1. Analyzing repository structure
2. Ranking files by importance
3. Intelligently compressing content
4. Fitting context within token budgets

## Core Modules

### 1. RepoAnalyzer (`src/analyzer/repoAnalyzer.ts`)
**Purpose**: Build repository map and rank files

**Algorithm**:
- Scans all supported files (.ts, .js, .py, .java, .go, .rs, .cpp, .json, .yaml, .md)
- Extracts symbols (classes, functions, constants) using regex patterns
- Builds dependency graph from imports/requires
- Ranks files using PageRank-like algorithm:
  - Referenced by many files → higher rank
  - Contains many symbols → higher rank
  - Smaller files → easier to include
  - Special files (README, package.json) → boosted rank

**Output**:
```typescript
interface FileNode {
  path: string;
  rank: number;
  symbols: string[];
  refs: string[];
  size: number;
}
```

### 2. Compressor (`src/compression/compressor.ts`)
**Purpose**: Reduce content size while preserving structure

**Strategies**:
- **Code Compression**: Remove comments, docstrings, normalize whitespace
- **Log Compression**: Deduplicate error patterns, track occurrences
- **JSON Compression**: Remove null values, empty structures
- **Estimation**: ~4 characters per token

**Output**:
```typescript
interface CompressionResult {
  original: number;      // original token count
  compressed: number;    // compressed token count
  ratio: number;         // compression ratio
  content: string;       // compressed content
}
```

### 3. TokenEstimator (`src/tokens/tokenEstimator.ts`)
**Purpose**: Track token savings and costs

**Features**:
- Estimates tokens (4 chars/token approximation)
- Calculates cost savings
- Tracks daily statistics

### 4. ContextBuilder (`src/context/contextBuilder.ts`)
**Purpose**: Orchestrate analysis, compression, and context assembly

**Process**:
1. Get top-ranked files from analyzer
2. Compress each file
3. Fit into token budget greedily
4. Build copyable output for Kiro
5. Generate stats

**Output**:
```typescript
interface OptimizedContext {
  topFiles: Array<{ path: string; rank: number }>;
  compressedCode: Map<string, string>;
  tokenReport: {
    original: number;
    compressed: number;
    reduction: number;
  };
  copyableOutput: string;
}
```

### 5. UI Components
- **TreeProvider** (`src/ui/treeProvider.ts`): Shows ranked files in sidebar
- **StatsPanel** (`src/ui/statsPanel.ts`): WebView displaying token savings

## Data Flow

```
User triggers command
    ↓
RepoAnalyzer.analyze()
    ↓ (builds file rankings)
ContextBuilder.buildOptimized()
    ↓
├─ Get top files
├─ Compress each file
├─ Fit into budget
└─ Build output
    ↓
StatsPanel.show()
    ↓
User copies to Kiro
```

## Algorithm Details

### PageRank File Ranking
1. Initialize all files with score 1
2. Iterate 10 times:
   - For each file: calculate score based on:
     - References from other files (0.2 points each)
     - Number of symbols (0.05 points each, capped at 1)
     - File size penalty (multiply by 1 - size/100KB)
     - Special file boost (2x for README, package.json, etc.)
3. Sort by final score

### Token Budget Allocation
1. Reserve: prompt + 1000 tokens for response
2. For each top file (in rank order):
   - Compress file
   - Check if it fits remaining budget
   - Include if fits, continue

## Supported Languages
- JavaScript/TypeScript (.ts, .tsx, .js, .jsx)
- Python (.py)
- Java (.java)
- Go (.go)
- Rust (.rs)
- C/C++ (.cpp, .c, .h)
- Configuration (JSON, YAML)
- Documentation (Markdown)

## Performance Characteristics

| Content | Reduction |
|---------|-----------|
| Code | 40-70% |
| Logs | 80-95% |
| JSON | 30-50% |

## Future Enhancements

1. **Tree-Sitter integration** - More accurate symbol extraction
2. **ML-based content detection** - Headroom's Magika for format identification
3. **Caching layer** - SQLite for persistent tags
4. **Custom compressors** - Format-specific strategies (Protobuf, GraphQL, etc.)
5. **Rust backend** - Performance optimization for large repos
6. **Diff-only mode** - Send only changed lines for edits

## Dependencies

Core (minimal):
- `vscode` - VSCode API
- `js-tokens` - Basic tokenization

No external APIs required - fully local processing.

## License

Apache 2.0

Reuses algorithms from:
- **Aider** (aider-ai/aider) - PageRank ranking, symbol extraction
- **Headroom** (headroomlabs-ai/headroom) - Compression strategies
