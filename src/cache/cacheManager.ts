import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface CachedTag {
  filePath: string;
  hash: string;
  symbols: string[];
  refs: string[];
  mtime: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

export class CacheManager {
  private db: Database.Database;
  private stats: CacheStats = { hits: 0, misses: 0, hitRate: 0 };

  constructor(workspaceRoot: string) {
    const dbPath = path.join(workspaceRoot, '.arjun', 'cache.db');
    const dir = path.dirname(dbPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_cache (
        filePath TEXT UNIQUE NOT NULL,
        hash TEXT NOT NULL,
        symbols TEXT NOT NULL,
        refs TEXT NOT NULL,
        mtime INTEGER NOT NULL,
        createdAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS token_metrics (
        date TEXT NOT NULL,
        tokensOriginal INTEGER NOT NULL,
        tokensCompressed INTEGER NOT NULL,
        fileCount INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_file_path ON file_cache(filePath);
    `);
  }

  getFileCache(filePath: string, mtime: number): CachedTag | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM file_cache WHERE filePath = ? LIMIT 1');
      const row = stmt.get(filePath) as any;

      if (!row) {
        this.stats.misses++;
        return null;
      }

      // Check if file hasn't changed
      if (row.mtime === mtime) {
        this.stats.hits++;
        this.updateHitRate();
        return {
          filePath: row.filePath,
          hash: row.hash,
          symbols: JSON.parse(row.symbols),
          refs: JSON.parse(row.refs),
          mtime: row.mtime,
          createdAt: row.createdAt,
        };
      }

      // File changed, invalidate cache
      this.invalidateFile(filePath);
      this.stats.misses++;
      return null;
    } catch (error) {
      return null;
    }
  }

  setFileCache(filePath: string, mtime: number, symbols: string[], refs: string[]): void {
    try {
      const hash = this.hashContent(JSON.stringify({ symbols, refs }));
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO file_cache (filePath, hash, symbols, refs, mtime, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        filePath,
        hash,
        JSON.stringify(symbols),
        JSON.stringify(refs),
        mtime,
        Date.now()
      );
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  getContextCache(contentHash: string): { original: number; compressed: string } | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM context_cache WHERE hash = ? LIMIT 1');
      const row = stmt.get(contentHash) as any;

      if (row) {
        this.stats.hits++;
        this.updateHitRate();
        return { original: row.original, compressed: row.compressedVersion };
      }

      this.stats.misses++;
      return null;
    } catch {
      return null;
    }
  }

  setContextCache(contentHash: string, original: number, compressed: string): void {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO context_cache (hash, compressedVersion, original, compressed, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(contentHash, compressed, original, compressed.length, Date.now());
    } catch (error) {
      console.error('Context cache write error:', error);
    }
  }

  recordMetrics(tokensOriginal: number, tokensCompressed: number, fileCount: number): void {
    try {
      const date = new Date().toISOString().split('T')[0];
      const stmt = this.db.prepare(`
        INSERT INTO token_metrics (date, tokensOriginal, tokensCompressed, fileCount)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(date, tokensOriginal, tokensCompressed, fileCount);
    } catch (error) {
      console.error('Metrics write error:', error);
    }
  }

  getMetrics(days: number = 7): any {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const stmt = this.db.prepare(`
        SELECT
          SUM(tokensOriginal) as totalOriginal,
          SUM(tokensCompressed) as totalCompressed,
          COUNT(*) as days
        FROM token_metrics
        WHERE date >= ?
      `);

      return stmt.get(cutoffDate.toISOString().split('T')[0]);
    } catch {
      return null;
    }
  }

  invalidateFile(filePath: string): void {
    try {
      const stmt = this.db.prepare('DELETE FROM file_cache WHERE filePath = ?');
      stmt.run(filePath);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  clear(): void {
    try {
      this.db.exec('DELETE FROM file_cache; DELETE FROM context_cache; DELETE FROM research_cache;');
      console.log('Cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private hashContent(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  close(): void {
    try {
      this.db.close();
    } catch (error) {
      console.error('Cache close error:', error);
    }
  }
}
