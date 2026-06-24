import { ContentDetector, ContentType } from './contentDetector';
import {
  ProtobufCompressor,
  GraphQLCompressor,
  SqlCompressor,
  XmlCompressor,
  CsvCompressor,
  YamlCompressor,
  DiffCompressor,
} from './customCompressors';

interface CompressionResult {
  original: number;
  compressed: number;
  ratio: number;
  content: string;
}

export class Compressor {
  private detector = new ContentDetector();
  private protobufCompressor = new ProtobufCompressor();
  private graphqlCompressor = new GraphQLCompressor();
  private sqlCompressor = new SqlCompressor();
  private xmlCompressor = new XmlCompressor();
  private csvCompressor = new CsvCompressor();
  private yamlCompressor = new YamlCompressor();
  private diffCompressor = new DiffCompressor();

  compressContent(content: string, filename?: string): CompressionResult {
    const detection = this.detector.detect(content, filename);

    switch (detection.type) {
      case 'protobuf':
        return this.protobufCompressor.compress(content);
      case 'graphql':
        return this.graphqlCompressor.compress(content);
      case 'sql':
        return this.sqlCompressor.compress(content);
      case 'xml':
        return this.xmlCompressor.compress(content);
      case 'csv':
        return this.csvCompressor.compress(content);
      case 'yaml':
        return this.yamlCompressor.compress(content);
      case 'diff':
        return this.diffCompressor.compress(content);
      case 'logs':
        return this.compressLogs(content);
      case 'json':
        return this.compressJson(content);
      default:
        return this.compressCode(content, filename || 'unknown');
    }
  }

  compressCode(content: string, language: string): CompressionResult {
    const original = this.estimateTokens(content);

    let compressed = content;

    // Remove comments
    compressed = this.removeComments(compressed, language);

    // Remove empty lines
    compressed = compressed.split('\n').filter((line) => line.trim()).join('\n');

    // Remove docstrings
    compressed = this.removeDocstrings(compressed, language);

    // Collapse whitespace
    compressed = compressed.replace(/\s+/g, ' ').trim();

    const compressedTokens = this.estimateTokens(compressed);

    return {
      original,
      compressed: compressedTokens,
      ratio: compressedTokens / original,
      content: compressed,
    };
  }

  compressLogs(content: string): CompressionResult {
    const lines = content.split('\n');
    const original = this.estimateTokens(content);

    // Classify and deduplicate logs
    const errorPatterns = new Map<string, number>();
    const warnings = new Map<string, number>();
    const infos: string[] = [];

    for (const line of lines) {
      if (line.includes('ERROR') || line.includes('FATAL')) {
        const key = this.normalizeLogLine(line);
        errorPatterns.set(key, (errorPatterns.get(key) || 0) + 1);
      } else if (line.includes('WARN')) {
        const key = this.normalizeLogLine(line);
        warnings.set(key, (warnings.get(key) || 0) + 1);
      } else if (line.includes('INFO') || line.includes('DEBUG')) {
        infos.push(line);
      }
    }

    // Build compressed log summary
    const compressed = [
      ...Array.from(errorPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern, count]) => `[ERROR] ${pattern} (${count} occurrences)`),
      ...Array.from(warnings.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([pattern, count]) => `[WARN] ${pattern} (${count} occurrences)`),
      ...infos.slice(0, 10),
    ].join('\n');

    const compressedTokens = this.estimateTokens(compressed);

    return {
      original,
      compressed: compressedTokens,
      ratio: compressedTokens / original,
      content: compressed,
    };
  }

  compressJson(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    try {
      const obj = JSON.parse(content);
      const cleaned = this.cleanJson(obj);
      const compressed = JSON.stringify(cleaned);
      const compressedTokens = this.estimateTokens(compressed);

      return {
        original,
        compressed: compressedTokens,
        ratio: compressedTokens / original,
        content: compressed,
      };
    } catch {
      return { original, compressed: original, ratio: 1, content };
    }
  }

  private removeComments(content: string, language: string): string {
    if (['javascript', 'typescript', 'java', 'go', 'rust', 'cpp', 'c'].includes(language)) {
      // Remove single-line comments
      content = content.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    } else if (language === 'python') {
      // Remove Python comments
      content = content.replace(/#.*$/gm, '');
    }

    return content;
  }

  private removeDocstrings(content: string, language: string): string {
    if (['javascript', 'typescript'].includes(language)) {
      // Remove JSDoc comments
      content = content.replace(/\/\*\*[\s\S]*?\*\//g, '');
    } else if (language === 'python') {
      // Remove docstrings
      content = content.replace(/'''[\s\S]*?'''/g, '');
      content = content.replace(/"""[\s\S]*?"""/g, '');
    }

    return content;
  }

  private normalizeLogLine(line: string): string {
    // Replace numbers, paths, timestamps with placeholders
    return line
      .replace(/\d+/g, '#')
      .replace(/\/[\w/.-]+/g, 'PATH')
      .replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/g, 'TIMESTAMP')
      .slice(0, 80);
  }

  private cleanJson(obj: any): any {
    if (obj === null || obj === undefined) return undefined;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj
        .filter((item) => item !== null && item !== undefined && item !== '')
        .map((item) => this.cleanJson(item));
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined || value === '') continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (typeof value === 'object' && Object.keys(value).length === 0) continue;

      cleaned[key] = this.cleanJson(value);
    }

    return cleaned;
  }

  private estimateTokens(content: string): number {
    // Rough approximation: ~4 characters per token on average
    return Math.ceil(content.length / 4);
  }
}
