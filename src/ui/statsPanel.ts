import * as vscode from 'vscode';

export class StatsPanel {
  private panel: vscode.WebviewPanel | undefined;

  constructor() {}

  show(context: any): void {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel('arjunStats', 'Arjun Context', vscode.ViewColumn.Beside, {
        enableScripts: true,
        retainContextWhenHidden: true,
      });

      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }

    this.panel.webview.html = this.getHtmlContent(context);
    this.panel.reveal();
  }

  private getHtmlContent(context: any): string {
    const { tokenReport, stats, copyableOutput, topFiles } = context;

    const reduction = tokenReport.reduction || 0;
    const savedColor = reduction > 50 ? '#059669' : reduction > 30 ? '#d97706' : '#dc2626';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { box-sizing: border-box; margin: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 24px;
            color: #1a1a2e;
            background: #f8f9fb;
            line-height: 1.5;
          }
          .card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          }
          .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }
          .icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #fff;
            flex-shrink: 0;
          }
          h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            letter-spacing: -0.02em;
          }
          .header-sub {
            color: #6b7280;
            font-size: 13px;
            margin-top: 2px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .stat-box {
            border-left: 4px solid ${savedColor};
            padding: 16px;
            border-radius: 8px;
            background: #f9fafb;
          }
          .stat-label {
            color: #6b7280;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          .stat-value {
            color: ${savedColor};
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 1.1;
            margin-bottom: 2px;
          }
          .stat-secondary {
            color: #9ca3af;
            font-size: 12px;
          }
          .files-section {
            margin-top: 4px;
          }
          .files-section h3 {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .file-item {
            background: #f9fafb;
            padding: 10px 12px;
            margin-bottom: 6px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #f3f4f6;
          }
          .file-name {
            color: #4f46e5;
            font-size: 12px;
            font-weight: 500;
            font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace;
          }
          .file-rank {
            color: #9ca3af;
            font-size: 11px;
            font-weight: 500;
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 12px;
          }
          .action-button {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            width: 100%;
            transition: opacity 0.15s, transform 0.1s;
          }
          .action-button:hover {
            opacity: 0.9;
          }
          .action-button:active {
            transform: scale(0.98);
          }
          .code-block {
            background: #f8f9fb;
            border: 1px solid #e5e7eb;
            padding: 16px;
            margin-top: 16px;
            border-radius: 10px;
            font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Courier New', monospace;
            font-size: 12px;
            color: #374151;
            max-height: 240px;
            overflow-y: auto;
            line-height: 1.6;
          }
          .code-block pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
          }
          .badge {
            display: inline-block;
            background: #eef2ff;
            color: #4f46e5;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 10px;
            border-radius: 12px;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="icon">⚡</div>
          <div>
            <h1>Arjun Context</h1>
            <div class="header-sub">Smart context selection &amp; compression</div>
          </div>
        </div>

        <div class="card">
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Token Reduction</div>
              <div class="stat-value">${reduction}%</div>
              <div class="stat-secondary">${tokenReport.original} → ${tokenReport.compressed} tokens</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Estimated Savings</div>
              <div class="stat-value">${(stats.tokensSaved || 0).toLocaleString()}</div>
              <div class="stat-secondary">~$${stats.costSaved || '0.00'} saved</div>
            </div>
          </div>
        </div>

        ${
          topFiles && topFiles.length > 0
            ? `
          <div class="card">
            <div class="files-section">
              <h3>Relevant Files</h3>
              ${topFiles
                .slice(0, 5)
                .map(
                  (f: any) => `
              <div class="file-item">
                <span class="file-name">${f.path}</span>
                <span class="file-rank">${f.rank.toFixed(2)}</span>
              </div>
            `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <button class="action-button" onclick="copyContext()">Copy Context to Clipboard</button>

        <div class="code-block" id="context-output" style="display: none;">
          <pre>${escapeHtml(copyableOutput)}</pre>
        </div>

        <script>
          function copyContext() {
            const text = \`${copyableOutput.replace(/`/g, '\\`')}\`;
            navigator.clipboard.writeText(text).then(() => {
              alert('Context copied to clipboard!');
            });
          }

          function escapeHtml(text) {
            const map = {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
          }
        </script>
      </body>
      </html>
    `;
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
