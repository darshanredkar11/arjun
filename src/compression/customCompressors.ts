export interface CompressionResult {
  original: number;
  compressed: number;
  ratio: number;
  content: string;
}

export class ProtobufCompressor {
  compress(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    const lines = content.split('\n').filter((line) => line.trim());

    // Extract only message definitions, field definitions, and service definitions
    const important: string[] = [];
    let inMessage = false;
    let inService = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('message ')) {
        important.push(trimmed);
        inMessage = true;
      } else if (trimmed.startsWith('service ')) {
        important.push(trimmed);
        inService = true;
      } else if (trimmed.startsWith('rpc ')) {
        important.push(trimmed);
      } else if (trimmed.match(/^\w+\s+\w+\s*=/)) {
        // Field definition
        important.push(trimmed.replace(/\s+;/, ';'));
      } else if (trimmed === '}') {
        inMessage = false;
        inService = false;
      } else if ((inMessage || inService) && !trimmed.startsWith('//')) {
        // Keep field definitions inside message/service
        if (trimmed.match(/^\w+\s+\w+/) && !trimmed.startsWith('option')) {
          important.push(trimmed);
        }
      }
    }

    const compressed = important.join('\n');
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

export class GraphQLCompressor {
  compress(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    // Remove comments
    let compressed = content.replace(/#.*$/gm, '');

    // Keep only type definitions, field definitions, and query/mutation structures
    const lines = compressed
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('"""'));

    const important: string[] = [];
    let inType = false;

    for (const line of lines) {
      if (line.startsWith('type ') || line.startsWith('interface ') || line.startsWith('input ')) {
        important.push(line);
        inType = true;
      } else if (line.startsWith('schema ') || line.startsWith('directive ')) {
        important.push(line);
      } else if (line.startsWith('enum ')) {
        important.push(line);
        inType = true;
      } else if (line === '}') {
        inType = false;
      } else if (inType && line && !line.startsWith('@')) {
        // Keep field definitions
        important.push(line.replace(/\s*{.*}/, '').trim());
      }
    }

    compressed = important.join('\n');
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

export class SqlCompressor {
  compress(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    // Remove SQL comments
    let compressed = content.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Normalize whitespace
    compressed = compressed
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
      .join(' ');

    // Collapse multiple spaces
    compressed = compressed.replace(/\s+/g, ' ');

    // Remove redundant keywords
    compressed = compressed.replace(/DISTINCT\s+/gi, '');

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

export class XmlCompressor {
  compress(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    // Remove XML comments
    let compressed = content.replace(/<!--[\s\S]*?-->/g, '');

    // Remove whitespace between tags
    compressed = compressed.replace(/>\s+</g, '><');

    // Remove indentation
    compressed = compressed.replace(/^\s+/gm, '').replace(/\n/g, '');

    // Collapse multiple spaces in attributes
    compressed = compressed.replace(/\s+/g, ' ');

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

export class CsvCompressor {
  compress(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    const lines = content.split('\n');
    if (lines.length < 2) {
      return { original, compressed: original, ratio: 1, content };
    }

    // Keep header and first/last rows, sample middle rows
    const header = [lines[0]];
    const sampleSize = Math.min(10, Math.ceil(lines.length / 2));
    const step = Math.max(1, Math.floor((lines.length - 2) / sampleSize));

    const sampled: string[] = [header[0]];
    for (let i = 1; i < lines.length - 1; i += step) {
      sampled.push(lines[i]);
    }
    if (lines.length > 1) {
      sampled.push(lines[lines.length - 1]);
    }

    const compressed = sampled.filter((l) => l.trim()).join('\n');
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

export class YamlCompressor {
  compress(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    // Remove comments
    let compressed = content.replace(/#.*$/gm, '');

    // Keep only keys and important values (first 50 lines usually covers schema)
    const lines = compressed.split('\n').slice(0, 50);

    compressed = lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        // Keep structural lines
        if (trimmed.match(/^[a-z_][a-z0-9_-]*:/i)) {
          return trimmed;
        }
        return '';
      })
      .filter((l) => l)
      .join('\n');

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

export class DiffCompressor {
  compress(content: string): CompressionResult {
    const original = this.estimateTokens(content);

    // Keep only changed lines summary
    const lines = content.split('\n');
    const additions = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++'));
    const deletions = lines.filter((l) => l.startsWith('-') && !l.startsWith('---'));
    const context = lines.filter((l) => l.startsWith('@@'));

    // Summarize
    const summary = [
      ...context,
      `Additions: ${additions.length}`,
      ...additions.slice(0, 5),
      `Deletions: ${deletions.length}`,
      ...deletions.slice(0, 5),
    ].join('\n');

    const compressedTokens = this.estimateTokens(summary);

    return {
      original,
      compressed: compressedTokens,
      ratio: compressedTokens / original,
      content: summary,
    };
  }

  private estimateTokens(content: string): number {
    return Math.ceil(content.length / 4);
  }
}
