# Arjun Deployment Guide

## Quick Deploy for Team

### Option 1: Install from VSIX (Recommended for immediate use)

1. **Build the extension**
```bash
npm run esbuild
npm install -g @vscode/vsce
vsce package
```

2. **Install in VSCode**
```bash
code --install-extension arjun-0.1.0.vsix
```

3. **Restart VSCode**

4. **Verify installation**
   - Look for ⚡ icon in Activity Bar
   - Run Command Palette (Cmd+Shift+P): "Arjun: Analyze Repository"

---

### Option 2: Development Mode (For testing)

1. **Clone/open this repo**
```bash
cd /Users/darshanredkar/darshan/arjun
```

2. **Install dependencies**
```bash
npm install
```

3. **Launch development extension**
```bash
npm run dev
```

This opens a new VSCode window with Arjun loaded.

---

## Using Arjun with Kiro

### Workflow

1. **Open your project folder in VSCode**

2. **Click the Arjun icon (⚡) in the left sidebar**

3. **Run "Arjun: Analyze Repository"**
   - Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
   - Type "Arjun: Analyze Repository"
   - Watch the progress notification

4. **See ranked files in the sidebar**
   - Arjun shows your top 10 most relevant files
   - Click any file to jump to it in the editor

5. **Build context for your query**
   - Go to Kiro
   - Prepare your question/prompt
   - In VSCode, run "Arjun: Build Optimized Context"
   - A panel opens showing:
     - Token reduction percentage
     - Files included
     - Compressed code snippets

6. **Copy and paste into Kiro**
   - Click "Copy Context to Clipboard"
   - Paste into Kiro chat
   - Ask your question
   - Benefit from reduced token consumption!

### Example: Using with Kiro

**Your Kiro prompt:**
```
I'm trying to add a new authentication method. 
Here's my project context:

[PASTE ARJUN OUTPUT HERE]

How should I implement this?
```

---

## Commands Reference

| Command | Shortcut | What It Does |
|---------|----------|--------------|
| Arjun: Analyze Repository | Cmd+Shift+P → type "analyze" | Scans and indexes your codebase |
| Arjun: Build Optimized Context | Cmd+Shift+P → type "optimize" | Generates compressed context |
| Arjun: Compress Current File | Cmd+Shift+P → type "compress file" | Shows compression stats for active file |
| Arjun: Compress Logs | Cmd+Shift+P → type "compress logs" | Deduplicates and compresses error logs |

---

## Understanding the Stats

### Token Reduction
```
67% ← The percentage of tokens saved
1,245 → 410 tokens ← Before and after counts
```

**Interpretation**: Original content was ~1,245 tokens, compressed to 410. That's 67% smaller.

### Relevant Files
```
1. src/auth/JWTService.ts (rank: 8.45)
2. src/auth/AuthController.ts (rank: 7.12)
3. src/config/index.ts (rank: 6.89)
```

**What the rank means**: Files with higher rank are more central to your codebase. The algorithm considers:
- How many files import/reference it
- How many symbols (classes, functions) it defines
- File size (smaller is easier to include)

### Estimated Savings
```
Tokens Saved: 835,000
Estimated Cost Saved: $12.53
```

**How it's calculated**: 
- Headroom assumptions: ~0.01/1M input tokens (adjust for your API)
- Cost = tokens_saved × (cost_per_token)

---

## Troubleshooting

### Extension doesn't appear in sidebar
- Restart VSCode: Cmd+Q, then reopen
- Check Extensions tab for errors
- Reinstall: `code --uninstall-extension arjun && code --install-extension arjun-0.1.0.vsix`

### "No active editor" error
- Make sure you have a file open in the editor
- Switch to a code file (not git diff, etc.)

### Tree view shows no files
1. Run "Arjun: Analyze Repository" first
2. Wait for "Repository analysis complete" notification
3. Folder must contain supported file types

### Compression stats seem off
- Token count is estimated (4 chars ≈ 1 token)
- Use a tokenizer in Kiro for exact counts
- Reports are for comparison, not absolute truth

---

## For the Team: Testing Checklist

- [ ] Open a real project folder
- [ ] Run "Analyze Repository" - completes within 5 seconds
- [ ] Tree view shows ranked files (check top 3 make sense)
- [ ] Run "Build Optimized Context" with an open editor
- [ ] Copy output to Kiro and verify it's formatted correctly
- [ ] Check compression ratio (aim for 40-70% for code)
- [ ] Try different prompt lengths (short/long/complex)
- [ ] Test with Python, TypeScript, Java projects
- [ ] Measure actual token savings in Kiro (compare with/without)
- [ ] Verify no Kiro functionality is broken

---

## Feedback Loop

After using with your team, track:
1. **Actual token savings** - Compare Kiro API usage with/without Arjun
2. **Usability** - Is the UI clear? Commands discoverable?
3. **Accuracy** - Do ranked files match what you'd pick manually?
4. **Performance** - How long to analyze large repos?
5. **Requests** - Missing language support? Better compression?

Update [FEEDBACK.md](./FEEDBACK.md) with findings.

---

## Next: Beyond MVP

Once the team validates the MVP, consider:

1. **Tree-Sitter integration** - More accurate symbol extraction
2. **SQLite caching** - Persistent tags for faster reanalysis
3. **Git integration** - Analyze only changed files
4. **Model-specific optimization** - Tailor compression for Kiro's tokenizer
5. **Diff-only mode** - For iterative edits
6. **Custom compressors** - Format-specific strategies

See [ARCHITECTURE.md](./ARCHITECTURE.md#future-enhancements) for details.

---

## Support

**For issues, questions, or feedback**: 
- File in the project repo
- Include: OS, VSCode version, project type, error message
- Attach: Screenshot of the error

**For Kiro integration questions**:
- Verify context format matches Kiro expectations
- Test copying/pasting works correctly
- Check token counts in Kiro API logs
