import * as vscode from 'vscode';
import { RepoAnalyzer } from './analyzer/repoAnalyzer';
import { Compressor } from './compression/compressor';
import { TokenEstimator } from './tokens/tokenEstimator';
import { ContextBuilder } from './context/contextBuilder';
import { ArjunTreeProvider } from './ui/treeProvider';
import { StatsPanel } from './ui/statsPanel';
import { IntegrationManager } from './integrations/integrationManager';

let analyzer: RepoAnalyzer;
let compressor: Compressor;
let tokenEstimator: TokenEstimator;
let contextBuilder: ContextBuilder;
let statsPanel: StatsPanel | undefined;
let integrations: IntegrationManager;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Arjun activated');

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage('Arjun requires an open folder');
    return;
  }

  // Initialize core engines
  analyzer = new RepoAnalyzer(workspaceFolder.uri.fsPath);
  compressor = new Compressor();
  tokenEstimator = new TokenEstimator();
  contextBuilder = new ContextBuilder(analyzer, compressor, tokenEstimator, workspaceFolder.uri.fsPath);
  integrations = new IntegrationManager();
  await integrations.initialize();

  // Initialize UI
  const treeProvider = new ArjunTreeProvider(analyzer);
  vscode.window.registerTreeDataProvider('arjun.files', treeProvider);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('arjun.analyzeRepo', async () => {
      vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Analyzing repository...' },
        async () => {
          await analyzer.analyze();
          treeProvider.refresh();
          vscode.window.showInformationMessage('Repository analysis complete');
        }
      );
    }),

    vscode.commands.registerCommand('arjun.showContext', async () => {
      vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Building optimized context...' },
        async () => {
          const editor = vscode.window.activeTextEditor;
          const prompt = editor?.document.getText() || '';
          const context = await contextBuilder.buildOptimized(prompt, 4096);

          if (!statsPanel) {
            statsPanel = new StatsPanel();
          }
          statsPanel.show(context);
        }
      );
    }),

    vscode.commands.registerCommand('arjun.compressFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const compressed = await compressor.compressCode(editor.document.getText(), editor.document.languageId);
      vscode.window.showInformationMessage(
        `Compressed: ${compressed.original} → ${compressed.compressed} tokens (${Math.round(100 - (compressed.compressed / compressed.original) * 100)}% reduction)`
      );
    }),

    vscode.commands.registerCommand('arjun.compressLogs', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const compressed = await compressor.compressLogs(editor.document.getText());
      vscode.window.showInformationMessage(
        `Compressed logs: ${compressed.original} → ${compressed.compressed} tokens (${Math.round(100 - (compressed.compressed / compressed.original) * 100)}% reduction)`
      );
    }),

    vscode.commands.registerCommand('arjun.askKiro', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const prompt = await vscode.window.showInputBox({
        placeHolder: 'Ask a question about your code...',
        prompt: 'Your question for Kiro with optimized context:',
      });

      if (!prompt) return;

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Asking Kiro...' },
        async () => {
          const context = await contextBuilder.buildOptimized(prompt, 4096);
          const response = await integrations.askKiro(context.copyableOutput, prompt);
          showResponsePanel('Kiro Response', response);
        }
      );
    }),

    vscode.commands.registerCommand('arjun.askClaude', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const prompt = await vscode.window.showInputBox({
        placeHolder: 'Ask a question about your code...',
        prompt: 'Your question for Claude with optimized context:',
      });

      if (!prompt) return;

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Asking Claude...' },
        async () => {
          const context = await contextBuilder.buildOptimized(prompt, 4096);
          const response = await integrations.askClaude(context.copyableOutput, prompt);
          showResponsePanel('Claude Response', response);
        }
      );
    })
  );

  // Auto-analyze on activation
  await analyzer.analyze();
  treeProvider.refresh();
}

function showResponsePanel(title: string, response: string): void {
  const panel = vscode.window.createWebviewPanel('arjunResponse', title, vscode.ViewColumn.Two, {
    enableScripts: true,
  });

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1f2937; background: #f9fafb; }
        .container { max-width: 800px; margin: 0 auto; }
        .response { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; word-wrap: break-word; line-height: 1.6; }
        .header { margin-bottom: 20px; font-size: 1.2em; font-weight: 600; color: #111827; }
        button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 10px; }
        button:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">${title}</div>
        <div class="response">${response.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <button onclick="navigator.clipboard.writeText(\`${response.replace(/`/g, '\\`')}\`); alert('Copied!')">Copy Response</button>
      </div>
    </body>
    </html>
  `;
}

export function deactivate() {
  console.log('Arjun deactivated');
}
