import * as vscode from 'vscode';

export interface ClaudeConfig {
  apiKey: string;
  model: string;
}

export class ClaudeIntegration {
  private config: ClaudeConfig | null = null;

  async initialize(): Promise<void> {
    const apiKey = await vscode.workspace
      .getConfiguration('arjun')
      .get<string>('claude.apiKey');

    if (apiKey) {
      this.config = {
        apiKey,
        model: 'claude-opus-4-8',
      };
    }
  }

  async sendContextWithPrompt(context: string, userPrompt: string): Promise<string> {
    if (!this.config) {
      throw new Error('Claude not configured. Set ARJUN_CLAUDE_KEY in settings.');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 2048,
          system: `You are a code assistant with the following project context:\n\n${context}`,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      return data.content?.[0]?.text || 'No response from Claude';
    } catch (error) {
      throw new Error(`Failed to send context to Claude: ${error}`);
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }
}
