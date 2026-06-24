export class TokenEstimator {
  private tokensEstimatedToday = 0;
  private costSavedToday = 0;
  private costPerMToken = 0.01; // $0.01 per million tokens (input) - adjust for your model

  estimateTokens(content: string): number {
    // Rough approximation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  estimateTokenSavings(original: number, compressed: number): { tokens: number; cost: string } {
    const tokensSaved = original - compressed;
    const costSaved = (tokensSaved / 1_000_000) * this.costPerMToken;

    this.tokensEstimatedToday += tokensSaved;
    this.costSavedToday += costSaved;

    return {
      tokens: tokensSaved,
      cost: costSaved.toFixed(4),
    };
  }

  getTodayStats(): { tokens: number; cost: string } {
    return {
      tokens: this.tokensEstimatedToday,
      cost: this.costSavedToday.toFixed(2),
    };
  }

  resetStats(): void {
    this.tokensEstimatedToday = 0;
    this.costSavedToday = 0;
  }
}
