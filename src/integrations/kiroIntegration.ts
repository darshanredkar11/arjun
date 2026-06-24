import * as vscode from 'vscode';

export interface KiroConfig {
  apiKey: string;
  endpoint: string;
  model: string;
}

export class KiroIntegration {
  private config: KiroConfig | null = null;

  async initialize(): Promise<void> {
    const apiKey = await vscode.workspace
      .getConfiguration('arjun')
      .get<string>('kiro.apiKey');
    const endpoint = await vscode.workspace
      .getConfiguration('arjun')
      .get<string>('kiro.endpoint') || 'https://kiro.sh/api';

    if (apiKey) {
      this.config = {
        apiKey,
        endpoint,
        model: 'kiro-latest',
      };
    }
  }

  async sendContextWithPrompt(context: string, userPrompt: string): Promise<string> {
    if (!this.config) {
      throw new Error('Kiro not configured. Set ARJUN_KIRO_KEY in settings.');
    }

    try {
      const response = await fetch(`${this.config.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: `You are a code assistant with the following project context:\n\n${context}`,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Kiro API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      return data.choices?.[0]?.message?.content || 'No response from Kiro';
    } catch (error) {
      throw new Error(`Failed to send context to Kiro: ${error}`);
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }
}
