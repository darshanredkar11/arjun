import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface FileNode {
  path: string;
  rank: number;
  symbols: string[];
  refs: string[];
  size: number;
}

interface RepoMap {
  files: FileNode[];
  graph: Map<string, string[]>;
}

export class RepoAnalyzer {
  private repoPath: string;
  private repoMap: RepoMap = { files: [], graph: new Map() };
  private excludePatterns = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.vscode',
    '__pycache__',
    '.pytest_cache',
    'target',
    '.gradle',
  ];

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  async analyze(): Promise<RepoMap> {
    const files = this.getAllFiles(this.repoPath);
    this.repoMap.files = files.map((filePath) => this.analyzeFile(filePath));
    this.buildDependencyGraph();
    this.rankFilesByPageRank();
    return this.repoMap;
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(this.repoPath, fullPath);

      if (this.excludePatterns.some((p) => relativePath.includes(p))) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else if (this.isSupportedFile(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private isSupportedFile(filename: string): boolean {
    const supported = [
      '.ts',
      '.js',
      '.tsx',
      '.jsx',
      '.py',
      '.java',
      '.go',
      '.rs',
      '.cpp',
      '.c',
      '.h',
      '.json',
      '.yaml',
      '.yml',
      '.md',
    ];
    return supported.some((ext) => filename.endsWith(ext));
  }

  private analyzeFile(filePath: string): FileNode {
    const relativePath = path.relative(this.repoPath, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);

    // Extract symbols (classes, functions, constants)
    const symbols = this.extractSymbols(content, filePath);
    // Extract references (imports, requires, etc.)
    const refs = this.extractReferences(content);

    return {
      path: relativePath,
      rank: 0,
      symbols,
      refs,
      size: stats.size,
    };
  }

  private extractSymbols(content: string, filePath: string): string[] {
    const symbols: string[] = [];
    const ext = path.extname(filePath);

    if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
      // JavaScript/TypeScript patterns
      const classPattern = /(?:export\s+)?(?:class|interface|type)\s+(\w+)/g;
      const funcPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(\w+)\s*:\s*(?:async\s+)?\(.+\)\s*=>/g;
      const constPattern = /(?:export\s+)?const\s+(\w+)/g;

      let match;
      while ((match = classPattern.exec(content)) !== null) symbols.push(match[1]);
      while ((match = funcPattern.exec(content)) !== null) symbols.push(match[1] || match[2]);
      while ((match = constPattern.exec(content)) !== null) symbols.push(match[1]);
    } else if (ext === '.py') {
      // Python patterns
      const classPattern = /^class\s+(\w+)/gm;
      const funcPattern = /^def\s+(\w+)/gm;

      let match;
      while ((match = classPattern.exec(content)) !== null) symbols.push(match[1]);
      while ((match = funcPattern.exec(content)) !== null) symbols.push(match[1]);
    } else if (ext === '.java') {
      // Java patterns
      const classPattern = /(?:public\s+)?class\s+(\w+)/g;
      const methodPattern = /(?:public|private|protected)?\s*(?:static\s+)?(?:\w+\s+)*(\w+)\s*\(/g;

      let match;
      while ((match = classPattern.exec(content)) !== null) symbols.push(match[1]);
      while ((match = methodPattern.exec(content)) !== null) {
        const sym = match[1];
        if (!sym.match(/^\d/)) symbols.push(sym);
      }
    }

    return [...new Set(symbols)];
  }

  private extractReferences(content: string): string[] {
    const refs: string[] = [];

    // Import/require patterns
    const importPatterns = [
      /import\s+(?:\{\s*([^}]+)\s*\}|['"*\w]+)\s+from\s+['"]([^'"]+)['"]/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /from\s+([\w.]+)\s+import/g,
      /import\s+([\w.]+)/g,
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) refs.push(match[1]);
        if (match[2]) refs.push(match[2]);
      }
    }

    return [...new Set(refs)];
  }

  private buildDependencyGraph(): void {
    const graph = new Map<string, string[]>();

    for (const file of this.repoMap.files) {
      graph.set(file.path, file.refs);
    }

    this.repoMap.graph = graph;
  }

  private rankFilesByPageRank(): void {
    // Simple PageRank-like algorithm
    // Higher rank if: many files reference it, has many symbols, is small (easier to include)
    const fileMap = new Map(this.repoMap.files.map((f) => [f.path, f]));
    const scores = new Map<string, number>();

    // Initialize scores
    for (const file of this.repoMap.files) {
      scores.set(file.path, 1);
    }

    // Iterate to converge
    for (let iter = 0; iter < 10; iter++) {
      const newScores = new Map<string, number>();

      for (const [filePath, file] of fileMap) {
        let score = 0.5; // Base score

        // Boost for many references
        const referencedByCount = Array.from(fileMap.values()).filter((f) =>
          f.refs.some((r) => filePath.includes(r) || r.includes(path.basename(filePath)))
        ).length;
        score += referencedByCount * 0.2;

        // Boost for many symbols
        score += Math.min(file.symbols.length * 0.05, 1);

        // Penalize large files (harder to fit in context)
        score *= Math.max(0.5, 1 - file.size / 100000);

        // Boost for special files
        if (['README', 'index', 'package.json', 'setup.py'].some((f) => filePath.includes(f))) {
          score *= 2;
        }

        newScores.set(filePath, score);
      }

      // Update scores
      for (const [filePath, score] of newScores) {
        scores.set(filePath, score);
      }
    }

    // Apply scores to files
    for (const file of this.repoMap.files) {
      file.rank = scores.get(file.path) || 0;
    }

    this.repoMap.files.sort((a, b) => b.rank - a.rank);
  }

  getTopFiles(count: number = 10): FileNode[] {
    return this.repoMap.files.slice(0, count);
  }

  getFileByPath(filePath: string): FileNode | undefined {
    return this.repoMap.files.find((f) => f.path === filePath);
  }

  getRepoMap(): RepoMap {
    return this.repoMap;
  }
}
