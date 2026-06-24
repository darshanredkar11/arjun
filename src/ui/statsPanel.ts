import * as vscode from 'vscode';

export class StatsPanel {
  private panel: vscode.WebviewPanel | undefined;

  constructor(private storageUri: string) {}

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
    const savedColor = reduction > 50 ? '#4caf50' : reduction > 30 ? '#ff9800' : '#f44336';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            color: #e0e0e0;
            background: #1e1e1e;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          .icon {
            font-size: 28px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
            color: #fff;
          }
          .stat-box {
            background: #252526;
            border-left: 4px solid ${savedColor};
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
          }
          .stat-label {
            color: #999;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .stat-value {
            color: ${savedColor};
            font-size: 24px;
            font-weight: bold;
          }
          .stat-secondary {
            color: #ccc;
            font-size: 12px;
            margin-top: 5px;
          }
          .files-section {
            margin-top: 20px;
          }
          .file-item {
            background: #252526;
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .file-name {
            color: #ce9178;
            font-size: 12px;
          }
          .file-rank {
            color: #9cdcfe;
            font-size: 12px;
          }
          .action-button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 15px;
            font-size: 14px;
          }
          .action-button:hover {
            background: #005a9e;
          }
          .code-block {
            background: #1e1e1e;
            border: 1px solid #3e3e42;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #ce9178;
            max-height: 200px;
            overflow-y: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="icon">⚡</span>
          <h1>Arjun Context</h1>
        </div>

        <div class="stat-box">
          <div class="stat-label">Token Reduction</div>
          <div class="stat-value">${reduction}%</div>
          <div class="stat-secondary">
            ${tokenReport.original} → ${tokenReport.compressed} tokens
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-label">Estimated Savings</div>
          <div class="stat-value">${stats.tokensSaved.toLocaleString()} tokens</div>
          <div class="stat-secondary">~$${stats.costSaved}</div>
        </div>

        ${
          topFiles && topFiles.length > 0
            ? `
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
