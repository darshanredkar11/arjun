import * as path from 'path';

interface SymbolInfo {
  name: string;
  type: 'class' | 'function' | 'interface' | 'type' | 'constant' | 'method';
  line: number;
}

export class TreeSitterExtractor {
  // Fallback regex patterns for when tree-sitter isn't available
  private patterns: { [lang: string]: RegExp[] } = {
    typescript: [
      /(?:export\s+)?(?:class|interface|type)\s+(\w+)/g,
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
      /(?:export\s+)?const\s+(\w+)\s*[:=]/g,
      /(\w+)\s*:\s*(?:async\s+)?\(.+?\)\s*=>/g,
    ],
    javascript: [
      /(?:export\s+)?(?:class|interface)\s+(\w+)/g,
      /(?:export\s+)?function\s+(\w+)/g,
      /(?:export\s+)?const\s+(\w+)\s*[:=]/g,
      /(\w+)\s*:\s*\(.+?\)\s*=>/g,
    ],
    python: [
      /^class\s+(\w+)/gm,
      /^def\s+(\w+)/gm,
      /^async\s+def\s+(\w+)/gm,
    ],
    java: [
      /(?:public\s+)?(?:class|interface)\s+(\w+)/g,
      /(?:public|private|protected)?\s*(?:static\s+)?(?:void|String|\w+\[\]|\w+)\s+(\w+)\s*\(/g,
    ],
    go: [
      /^func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(/gm,
      /^type\s+(\w+)\s+struct/gm,
    ],
    rust: [
      /^(?:pub\s+)?fn\s+(\w+)/gm,
      /^(?:pub\s+)?struct\s+(\w+)/gm,
      /^(?:pub\s+)?trait\s+(\w+)/gm,
      /^impl.*\s+(\w+)/gm,
    ],
  };

  extractSymbols(content: string, filePath: string): SymbolInfo[] {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const lang = this.mapLanguage(ext);

    if (!lang) {
      return [];
    }

    // Try enhanced extraction
    const symbols: SymbolInfo[] = [];
    const lines = content.split('\n');

    // Use language-specific patterns
    if (lang === 'typescript' || lang === 'javascript') {
      symbols.push(...this.extractTypeScript(content, lines));
    } else if (lang === 'python') {
      symbols.push(...this.extractPython(content, lines));
    } else if (lang === 'java') {
      symbols.push(...this.extractJava(content, lines));
    } else if (lang === 'go') {
      symbols.push(...this.extractGo(content, lines));
    } else if (lang === 'rust') {
      symbols.push(...this.extractRust(content, lines));
    } else {
      symbols.push(...this.extractGeneric(content, lang));
    }

    return symbols;
  }

  private extractTypeScript(content: string, lines: string[]): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];
    const patterns = this.patterns.typescript;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Class/interface/type
      const classMatch = /(?:export\s+)?(?:class|interface|type|enum)\s+(\w+)/.exec(line);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          type: line.includes('class') ? 'class' : 'type',
          line: lineNum,
        });
      }

      // Function declaration
      const funcMatch = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/.exec(line);
      if (funcMatch) {
        symbols.push({ name: funcMatch[1], type: 'function', line: lineNum });
      }

      // Method (indented function inside class)
      if (line.match(/^\s{2,}(?:async\s+)?[\w]+\s*\(/)) {
        const methodMatch = /(\w+)\s*\(/.exec(line);
        if (methodMatch && methodMatch[1] !== 'function') {
          symbols.push({ name: methodMatch[1], type: 'method', line: lineNum });
        }
      }

      // Const assignment
      const constMatch = /(?:export\s+)?const\s+(\w+)/.exec(line);
      if (constMatch) {
        symbols.push({ name: constMatch[1], type: 'constant', line: lineNum });
      }

      // Arrow function
      const arrowMatch = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/. exec(line);
      if (arrowMatch) {
        symbols.push({ name: arrowMatch[1], type: 'function', line: lineNum });
      }
    }

    return symbols;
  }

  private extractPython(content: string, lines: string[]): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Class definition
      const classMatch = /^class\s+(\w+)/.exec(line);
      if (classMatch) {
        symbols.push({ name: classMatch[1], type: 'class', line: lineNum });
      }

      // Function definition
      const funcMatch = /^(?:async\s+)?def\s+(\w+)/.exec(line);
      if (funcMatch) {
        symbols.push({ name: funcMatch[1], type: 'function', line: lineNum });
      }

      // Method (indented def)
      const methodMatch = /^\s{4,}(?:async\s+)?def\s+(\w+)/.exec(line);
      if (methodMatch) {
        symbols.push({ name: methodMatch[1], type: 'method', line: lineNum });
      }
    }

    return symbols;
  }

  private extractJava(content: string, lines: string[]): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Class
      const classMatch = /(?:public\s+|private\s+)?class\s+(\w+)/.exec(line);
      if (classMatch) {
        symbols.push({ name: classMatch[1], type: 'class', line: lineNum });
      }

      // Interface
      const interfaceMatch = /(?:public\s+)?interface\s+(\w+)/.exec(line);
      if (interfaceMatch) {
        symbols.push({ name: interfaceMatch[1], type: 'interface', line: lineNum });
      }

      // Method
      const methodMatch =
        /(?:public|private|protected)?\s*(?:static\s+)?(?:void|String|int|boolean|\w+\[\]|\w+)\s+(\w+)\s*\(/.exec(
          line
        );
      if (methodMatch) {
        symbols.push({ name: methodMatch[1], type: 'method', line: lineNum });
      }
    }

    return symbols;
  }

  private extractGo(content: string, lines: string[]): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Function
      const funcMatch = /^func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(/.exec(line);
      if (funcMatch) {
        symbols.push({ name: funcMatch[1], type: 'function', line: lineNum });
      }

      // Struct
      const structMatch = /^type\s+(\w+)\s+struct/.exec(line);
      if (structMatch) {
        symbols.push({ name: structMatch[1], type: 'class', line: lineNum });
      }

      // Interface
      const interfaceMatch = /^type\s+(\w+)\s+interface/.exec(line);
      if (interfaceMatch) {
        symbols.push({ name: interfaceMatch[1], type: 'interface', line: lineNum });
      }
    }

    return symbols;
  }

  private extractRust(content: string, lines: string[]): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Function
      const funcMatch = /^(?:pub\s+)?fn\s+(\w+)/.exec(line);
      if (funcMatch) {
        symbols.push({ name: funcMatch[1], type: 'function', line: lineNum });
      }

      // Struct
      const structMatch = /^(?:pub\s+)?struct\s+(\w+)/.exec(line);
      if (structMatch) {
        symbols.push({ name: structMatch[1], type: 'class', line: lineNum });
      }

      // Trait
      const traitMatch = /^(?:pub\s+)?trait\s+(\w+)/.exec(line);
      if (traitMatch) {
        symbols.push({ name: traitMatch[1], type: 'interface', line: lineNum });
      }

      // Impl
      const implMatch = /^impl.*<.*>\s+(\w+)/.exec(line);
      if (implMatch) {
        symbols.push({ name: implMatch[1], type: 'class', line: lineNum });
      }
    }

    return symbols;
  }

  private extractGeneric(content: string, lang: string): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];
    const patterns = this.patterns[lang];

    if (!patterns) {
      return [];
    }

    const lines = content.split('\n');
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      for (const pattern of patterns) {
        const regex = new RegExp(pattern.source, 'g');
        let match;
        while ((match = regex.exec(line)) !== null) {
          symbols.push({
            name: match[1],
            type: 'function',
            line: lineNum,
          });
        }
      }
    }

    return symbols;
  }

  private mapLanguage(ext: string): string | null {
    const map: { [key: string]: string } = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      java: 'java',
      go: 'go',
      rs: 'rust',
      cpp: 'cpp',
      c: 'c',
    };

    return map[ext] || null;
  }

  // Extract references/imports
  extractReferences(content: string, filePath: string): string[] {
    const refs: string[] = [];
    const ext = path.extname(filePath).toLowerCase().slice(1);

    // TypeScript/JavaScript imports
    if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
      const importPatterns = [
        /import\s+(?:\{\s*([^}]+)\s*\}|(?:\*\s+as\s+)?(\w+))\s+from\s+['"]([^'"]+)['"]/g,
        /import\s+([^;]+)\s+from\s+['"]([^'"]+)['"]/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      ];

      for (const pattern of importPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1]) refs.push(match[1]);
          if (match[2]) refs.push(match[2]);
          if (match[3]) refs.push(match[3]);
        }
      }
    }

    // Python imports
    if (ext === 'py') {
      const patterns = [
        /from\s+([\w.]+)\s+import/g,
        /import\s+([\w.,\s]+)/g,
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          refs.push(match[1]);
        }
      }
    }

    // Java imports
    if (ext === 'java') {
      const pattern = /import\s+([^;]+);/g;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        refs.push(match[1]);
      }
    }

    // Go imports
    if (ext === 'go') {
      const pattern = /import\s+(?:"([^"]+)"|[\(\s]+([\w/".-]+))/g;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) refs.push(match[1]);
        if (match[2]) refs.push(match[2]);
      }
    }

    return [...new Set(refs)];
  }
}
