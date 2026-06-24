import { RepoAnalyzer } from '../analyzer/repoAnalyzer';
import { Compressor } from '../compression/compressor';
import { TokenEstimator } from '../tokens/tokenEstimator';
import * as fs from 'fs';
import * as path from 'path';

export interface OptimizedContext {
  topFiles: Array<{ path: string; rank: number }>;
  compressedCode: Map<string, string>;
  tokenReport: {
    original: number;
    compressed: number;
    reduction: number;
  };
  stats: {
    tokensSaved: number;
    costSaved: string;
  };
  copyableOutput: string;
}

export class ContextBuilder {
  constructor(
    private analyzer: RepoAnalyzer,
    private compressor: Compressor,
    private tokenEstimator: TokenEstimator
  ) {}

  async buildOptimized(prompt: string, tokenBudget: number): Promise<any> {
    const promptTokens = this.tokenEstimator.estimateTokens(prompt);
    const availableTokens = tokenBudget - promptTokens - 1000; // Reserve 1K for response

    if (availableTokens < 500) {
      return {
        topFiles: [],
        compressedCode: new Map(),
        tokenReport: { original: 0, compressed: 0, reduction: 0 },
        stats: { tokensSaved: 0, costSaved: '0.00' },
        copyableOutput: 'Insufficient token budget',
        extension: { globalStoragePath: '' },
      };
    }

    const topFiles = this.analyzer.getTopFiles(10);
    const compressedCode = new Map<string, string>();
    let originalTokens = promptTokens;
    let compressedTokens = promptTokens;
    let budgetRemaining = availableTokens;

    // Compress and include top files
    for (const file of topFiles) {
      if (budgetRemaining < 200) break;

      try {
        const fullPath = path.join(path.dirname(path.dirname(path.dirname(process.cwd()))), 'darshan', 'arjun');
        const filePath = path.join(fullPath, file.path);

        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        const fileTokens = this.tokenEstimator.estimateTokens(content);

        // Check if file fits in budget
        if (fileTokens > budgetRemaining) continue;

        // Compress file
        const ext = path.extname(filePath);
        let compressed = content;
        let compressedFileTokens = fileTokens;

        if (['.ts', '.js', '.tsx', '.jsx', '.py', '.java'].includes(ext)) {
          const result = this.compressor.compressCode(content, ext.slice(1));
          compressed = result.content;
          compressedFileTokens = result.compressed;
        }

        compressedCode.set(file.path, compressed);
        originalTokens += fileTokens;
        compressedTokens += compressedFileTokens;
        budgetRemaining -= compressedFileTokens;
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    const reduction = Math.round(((originalTokens - compressedTokens) / originalTokens) * 100);
    const savings = this.tokenEstimator.estimateTokenSavings(originalTokens, compressedTokens);

    const copyableOutput = this.buildCopyableOutput(
      Array.from(topFiles),
      compressedCode,
      originalTokens,
      compressedTokens,
      reduction
    );

    return {
      topFiles: topFiles.map((f) => ({ path: f.path, rank: f.rank })),
      compressedCode,
      tokenReport: {
        original: originalTokens,
        compressed: compressedTokens,
        reduction,
      },
      stats: {
        tokensSaved: savings.tokens,
        costSaved: savings.cost,
      },
      copyableOutput,
      extension: { globalStoragePath: '' },
    };
  }

  private buildCopyableOutput(
    files: any[],
    compressed: Map<string, string>,
    original: number,
    compressedTokens: number,
    reduction: number
  ): string {
    const lines: string[] = [
      '=== ARJUN CONTEXT PACKAGE ===\n',
      '# RELEVANT FILES\n',
      ...files.map((f, i) => `${i + 1}. ${f.path} (rank: ${f.rank.toFixed(2)})`),
      '\n# COMPRESSED CODE\n',
      ...Array.from(compressed.entries()).map(([path, code]) => `\n## ${path}\n\`\`\`\n${code.slice(0, 500)}\n...\n\`\`\``),
      '\n# TOKEN REPORT\n',
      `Original: ${original} tokens`,
      `Compressed: ${compressedTokens} tokens`,
      `Reduction: ${reduction}%`,
      '\nThis output is optimized for Kiro integration.',
    ];

    return lines.join('\n');
  }
}
