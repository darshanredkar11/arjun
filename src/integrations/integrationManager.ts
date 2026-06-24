import * as vscode from 'vscode';
import { KiroIntegration } from './kiroIntegration';
import { ClaudeIntegration } from './claudeIntegration';

export class IntegrationManager {
  private kiro: KiroIntegration;
  private claude: ClaudeIntegration;

  constructor() {
    this.kiro = new KiroIntegration();
    this.claude = new ClaudeIntegration();
  }

  async initialize(): Promise<void> {
    await this.kiro.initialize();
    await this.claude.initialize();
  }

  async askKiro(context: string, prompt: string): Promise<string> {
    if (!this.kiro.isConfigured()) {
      throw new Error('Kiro not configured. Go to Arjun settings to add API key.');
    }
    return this.kiro.sendContextWithPrompt(context, prompt);
  }

  async askClaude(context: string, prompt: string): Promise<string> {
    if (!this.claude.isConfigured()) {
      throw new Error('Claude not configured. Go to Arjun settings to add API key.');
    }
    return this.claude.sendContextWithPrompt(context, prompt);
  }

  isKiroConfigured(): boolean {
    return this.kiro.isConfigured();
  }

  isClaudeConfigured(): boolean {
    return this.claude.isConfigured();
  }

  getAvailableIntegrations(): string[] {
    const available: string[] = [];
    if (this.kiro.isConfigured()) available.push('Kiro');
    if (this.claude.isConfigured()) available.push('Claude');
    return available;
  }
}
