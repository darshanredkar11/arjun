import * as vscode from 'vscode';
import { RepoAnalyzer } from '../analyzer/repoAnalyzer';

export class ArjunTreeProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<
    FileItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private analyzer: RepoAnalyzer) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon('file');
    item.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [vscode.Uri.file(element.filePath)],
    };
    item.description = `rank: ${element.rank.toFixed(2)}`;
    return item;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const topFiles = this.analyzer.getTopFiles(10);
    const items = topFiles.map((file) => ({
      label: file.path.split('/').pop() || file.path,
      filePath: file.path,
      rank: file.rank,
    }));

    return Promise.resolve(items);
  }
}

interface FileItem {
  label: string;
  filePath: string;
  rank: number;
}
