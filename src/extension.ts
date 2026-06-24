import * as vscode from 'vscode';
import { RepoAnalyzer } from './analyzer/repoAnalyzer';
import { Compressor } from './compression/compressor';
import { TokenEstimator } from './tokens/tokenEstimator';
import { ContextBuilder } from './context/contextBuilder';
import { ArjunTreeProvider } from './ui/treeProvider';
import { StatsPanel } from './ui/statsPanel';

let analyzer: RepoAnalyzer;
let compressor: Compressor;
let tokenEstimator: TokenEstimator;
let contextBuilder: ContextBuilder;
let statsPanel: StatsPanel | undefined;

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
            statsPanel = new StatsPanel(context.extension.globalStoragePath);
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
    })
  );

  // Auto-analyze on activation
  await analyzer.analyze();
  treeProvider.refresh();
}

export function deactivate() {
  console.log('Arjun deactivated');
}
