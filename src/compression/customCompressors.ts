export interface CompressionResult {
  original: number;
  compressed: number;
  ratio: number;
  content: string;
}

// Table-driven: 7 formats, 1 class. Lean & clean.
export class FormatCompressor {
  compress(format: string, content: string): CompressionResult {
    const original = this.estimateTokens(content);
    let compressed = content;

    if (format === 'protobuf') {
      const lines = content.split('\n').filter((l) => l.trim());
      const important: string[] = [];
      let inBlock = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^(message|service|rpc)\s+/)) {
          important.push(trimmed);
          inBlock = true;
        } else if (trimmed === '}') {
          inBlock = false;
        } else if (inBlock && trimmed.match(/^\w+\s+\w+/)) {
          important.push(trimmed);
        }
      }
      compressed = important.join('\n');
    } else if (format === 'graphql') {
      compressed = content.replace(/#.*$/gm, '');
      const lines = compressed.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('"""'));
      const important: string[] = [];
      let inType = false;
      for (const line of lines) {
        if (line.match(/^(type|interface|input|enum|schema|directive)\s+/)) {
          important.push(line);
          inType = !line.startsWith('schema') && !line.startsWith('directive');
        } else if (line === '}') {
          inType = false;
        } else if (inType && line && !line.startsWith('@')) {
          important.push(line.replace(/\s*{.*}/, '').trim());
        }
      }
      compressed = important.join('\n');
    } else if (format === 'sql') {
      compressed = content
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l)
        .join(' ')
        .replace(/\s+/g, ' ')
        .replace(/DISTINCT\s+/gi, '');
    } else if (format === 'csv') {
      const lines = content.split('\n');
      if (lines.length >= 2) {
        const sampleSize = Math.min(10, Math.ceil(lines.length / 2));
        const step = Math.max(1, Math.floor((lines.length - 2) / sampleSize));
        const sampled = [lines[0]];
        for (let i = 1; i < lines.length - 1; i += step) sampled.push(lines[i]);
        if (lines.length > 1) sampled.push(lines[lines.length - 1]);
        compressed = sampled.filter((l) => l.trim()).join('\n');
      }
    } else if (format === 'xml') {
      compressed = content
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/^\s+/gm, '')
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ');
    } else if (format === 'yaml') {
      compressed = content
        .replace(/#.*$/gm, '')
        .split('\n')
        .slice(0, 50)
        .map((line) => {
          const trimmed = line.trim();
          return trimmed.match(/^[a-z_][a-z0-9_-]*:/i) ? trimmed : '';
        })
        .filter((l) => l)
        .join('\n');
    } else if (format === 'diff') {
      const lines = content.split('\n');
      const adds = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).slice(0, 5);
      const dels = lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).slice(0, 5);
      const ctx = lines.filter((l) => l.startsWith('@@'));
      compressed = [...ctx, `Additions: ${adds.length}`, ...adds, `Deletions: ${dels.length}`, ...dels].join('\n');
    }

    const compressedTokens = this.estimateTokens(compressed);
    return {
      original,
      compressed: compressedTokens,
      ratio: compressedTokens / original,
      content: compressed,
    };
  }

  private estimateTokens(content: string): number {
    return Math.ceil(content.length / 4);
  }
}
