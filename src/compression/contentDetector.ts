export type ContentType =
  | 'code'
  | 'logs'
  | 'json'
  | 'csv'
  | 'protobuf'
  | 'graphql'
  | 'sql'
  | 'markdown'
  | 'diff'
  | 'xml'
  | 'yaml'
  | 'text';

export interface DetectionResult {
  type: ContentType;
  confidence: number;
  format?: string;
}

export class ContentDetector {
  detect(content: string, filename?: string): DetectionResult {
    // First, use filename extension if available
    if (filename) {
      const ext = this.getExtension(filename).toLowerCase();
      const typeByExt = this.detectByExtension(ext);
      if (typeByExt) {
        return { type: typeByExt, confidence: 0.95, format: ext };
      }
    }

    // Then, analyze content patterns
    return this.detectByContent(content);
  }

  private detectByExtension(ext: string): ContentType | null {
    const map: { [key: string]: ContentType } = {
      'log': 'logs',
      'json': 'json',
      'csv': 'csv',
      'proto': 'protobuf',
      'graphql': 'graphql',
      'gql': 'graphql',
      'sql': 'sql',
      'md': 'markdown',
      'diff': 'diff',
      'patch': 'diff',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'ts': 'code',
      'js': 'code',
      'py': 'code',
      'java': 'code',
      'go': 'code',
      'rs': 'code',
      'cpp': 'code',
      'c': 'code',
      'h': 'code',
    };

    return map[ext] || null;
  }

  private detectByContent(content: string): DetectionResult {
    const trimmed = content.trim();
    const lines = content.split('\n');

    // JSON detection
    if (this.isJson(trimmed)) {
      return { type: 'json', confidence: 0.98 };
    }

    // Protobuf detection
    if (this.isProtobuf(trimmed)) {
      return { type: 'protobuf', confidence: 0.90 };
    }

    // GraphQL detection
    if (this.isGraphQL(trimmed)) {
      return { type: 'graphql', confidence: 0.85 };
    }

    // Log detection
    if (this.isLogs(lines)) {
      return { type: 'logs', confidence: 0.88 };
    }

    // Diff detection
    if (this.isDiff(lines)) {
      return { type: 'diff', confidence: 0.92 };
    }

    // SQL detection
    if (this.isSql(trimmed)) {
      return { type: 'sql', confidence: 0.80 };
    }

    // CSV detection
    if (this.isCsv(trimmed)) {
      return { type: 'csv', confidence: 0.75 };
    }

    // XML detection
    if (this.isXml(trimmed)) {
      return { type: 'xml', confidence: 0.92 };
    }

    // YAML detection
    if (this.isYaml(trimmed)) {
      return { type: 'yaml', confidence: 0.80 };
    }

    // Markdown detection
    if (this.isMarkdown(lines)) {
      return { type: 'markdown', confidence: 0.75 };
    }

    // Code detection (heuristic)
    if (this.appearsToBecode(trimmed)) {
      return { type: 'code', confidence: 0.60 };
    }

    return { type: 'text', confidence: 0.50 };
  }

  private isJson(content: string): boolean {
    if (!content.startsWith('{') && !content.startsWith('[')) {
      return false;
    }

    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  private isProtobuf(content: string): boolean {
    const keywords = ['syntax', 'message', 'service', 'rpc', 'proto3', 'proto2'];
    const keywordMatches = keywords.filter((kw) => content.includes(kw)).length;
    return keywordMatches >= 2;
  }

  private isGraphQL(content: string): boolean {
    const patterns = [
      /\bquery\s+\w+\s*\{/,
      /\bmutation\s+\w+\s*\{/,
      /\btype\s+\w+\s*\{/,
      /\bschema\s*\{/,
      /\binterface\s+\w+\s*\{/,
    ];

    return patterns.some((p) => p.test(content));
  }

  private isLogs(lines: string[]): boolean {
    const logPatterns = [
      /^\[\w+\]/,
      /\d{4}-\d{2}-\d{2}/,
      /ERROR|WARN|INFO|DEBUG|FATAL/i,
      /Exception|Error|Traceback/,
    ];

    const matchingLines = lines
      .slice(0, Math.min(10, lines.length))
      .filter((line) => logPatterns.some((p) => p.test(line))).length;

    return matchingLines >= 3;
  }

  private isDiff(lines: string[]): boolean {
    const diffPatterns = [/^@@\s+-\d+/, /^---\s+/, /^===\s+/, /^\+\+\+\s+/, /^diff\s+--git/];

    const matchingLines = lines
      .slice(0, Math.min(5, lines.length))
      .filter((line) => diffPatterns.some((p) => p.test(line))).length;

    return matchingLines >= 2;
  }

  private isSql(content: string): boolean {
    const keywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'JOIN', 'CREATE TABLE'];
    const upperContent = content.toUpperCase();
    const keywordMatches = keywords.filter((kw) => upperContent.includes(kw)).length;
    return keywordMatches >= 2;
  }

  private isCsv(content: string): boolean {
    const lines = content.split('\n');
    if (lines.length < 2) return false;

    const firstLine = lines[0].split(',').length;
    const secondLine = lines[1].split(',').length;

    // Check if consistent column count
    return firstLine === secondLine && firstLine > 2 && firstLine < 50;
  }

  private isXml(content: string): boolean {
    return /<[a-z][a-z0-9]*[^>]*>.*<\/[a-z][a-z0-9]*>/is.test(content.trim());
  }

  private isYaml(content: string): boolean {
    const lines = content.split('\n').slice(0, 10);
    const yamlIndicators = lines.filter((line) => /^\s+[a-z_][a-z0-9_]*:\s+/i.test(line)).length;
    return yamlIndicators >= 3;
  }

  private isMarkdown(lines: string[]): boolean {
    const mdPatterns = [/^#+\s+/, /^\*\*.*\*\*/, /^\[.*\]\(.*\)/, /^-\s+/, /^\d+\.\s+/];

    const matchingLines = lines
      .slice(0, Math.min(20, lines.length))
      .filter((line) => mdPatterns.some((p) => p.test(line))).length;

    return matchingLines >= 3;
  }

  private appearsToBecode(content: string): boolean {
    const codeIndicators = [
      /\{[^}]*\}/,
      /\([^)]*\)/,
      /function|class|def|interface|type|const|var|let/i,
      /import|require|export|package|namespace/i,
      /=>|->|::|\/\//,
    ];

    const matches = codeIndicators.filter((p) => p.test(content)).length;
    return matches >= 2;
  }

  private getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }
}
