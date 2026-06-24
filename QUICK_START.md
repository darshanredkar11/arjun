# Arjun Quick Start Guide

Get Arjun running in 5 minutes.

## Step 1: Install Dependencies (30 seconds)

```bash
cd /Users/darshanredkar/darshan/arjun
npm install
```

## Step 2: Build Extension (10 seconds)

```bash
npm run esbuild
```

You should see: `dist/extension.js 24.8kb`

## Step 3: Install in VSCode (30 seconds)

```bash
# Install the packaging tool
npm install -g @vscode/vsce

# Package the extension
vsce package

# Install it
code --install-extension arjun-0.1.0.vsix
```

## Step 4: Launch VSCode (automatic)

VSCode restarts automatically with Arjun installed.

## Step 5: Test It Works (2 minutes)

1. **Open a folder** (any project with code files)
   - File → Open Folder
   - Select a project with .ts, .py, .java, or similar files

2. **Look for the ⚡ icon** in the left sidebar
   - Click it to open Arjun

3. **Run first command**
   - Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
   - Type: "arjun analyze"
   - Hit Enter
   - Watch the progress notification

4. **See results**
   - Arjun sidebar should show your top 10 files
   - Click any file to jump to it

5. **Build optimized context**
   - Press Cmd+Shift+P again
   - Type: "arjun optimize"
   - Hit Enter
   - A panel opens showing:
     - Percentage reduction (target: 40-70%)
     - Your relevant files
     - "Copy Context to Clipboard" button

6. **Copy context**
   - Click the copy button
   - Context is in your clipboard
   - Paste into Kiro!

---

## That's It! 🎉

You now have Arjun running. Here's what each part does:

| Part | What It Does |
|------|--------------|
| **⚡ Icon** | Arjun sidebar - shows ranked files |
| **"Analyze Repository"** | Scans your code, builds file rankings |
| **"Build Optimized Context"** | Compresses code, fits into token budget |
| **Copy Button** | Puts formatted context in clipboard |
| **Kiro Integration** | Paste context, ask questions, save tokens |

---

## Next Steps

### For using with Kiro:
1. Ask a coding question in Kiro
2. In VSCode, run "Arjun: Build Optimized Context"
3. Copy and paste the context into Kiro
4. Continue the conversation

### For understanding how it works:
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for team setup
- Check [TEST_SCENARIOS.md](./TEST_SCENARIOS.md) to validate

### For troubleshooting:
- Extension not showing? → Restart VSCode
- No files in tree? → Run "Analyze Repository" first
- Compression not working? → Try a different file type
- See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more help

---

## Typical Workflow

```
┌─────────────────────────────────────────┐
│  You're using Kiro, need code context   │
└─────────────────────────────┬───────────┘
                              │
         ┌────────────────────▼──────────────────┐
         │  Open project folder in VSCode         │
         │  Click Arjun (⚡) icon                 │
         │  Run "Analyze Repository"              │
         └────────────────────┬──────────────────┘
                              │
         ┌────────────────────▼──────────────────┐
         │  Arjun shows top 10 files              │
         │  (ranked by importance)                │
         └────────────────────┬──────────────────┘
                              │
         ┌────────────────────▼──────────────────┐
         │  Run "Build Optimized Context"         │
         │  (with your cursor in an editor)       │
         └────────────────────┬──────────────────┘
                              │
         ┌────────────────────▼──────────────────┐
         │  Stats panel shows:                    │
         │  - 67% token reduction                 │
         │  - Top files listed                    │
         │  - "Copy" button ready                 │
         └────────────────────┬──────────────────┘
                              │
         ┌────────────────────▼──────────────────┐
         │  Click "Copy Context to Clipboard"     │
         │  Context is now in your clipboard      │
         └────────────────────┬──────────────────┘
                              │
         ┌────────────────────▼──────────────────┐
         │  Switch to Kiro                        │
         │  Paste context into chat               │
         │  Ask your coding question              │
         │  Get answer with full context!         │
         └────────────────────┬──────────────────┘
                              │
              Result: 40-70% fewer tokens used!
```

---

## Commands Reference

| Command | What to type in Cmd+Shift+P |
|---------|-----|
| Analyze your repo | `arjun analyze` |
| Build context for Kiro | `arjun optimize` |
| Compress current file | `arjun compress file` |
| Compress error logs | `arjun compress logs` |

---

## Tips

**Tip 1**: Run "Analyze Repository" once when you open a new project. Results are fast on subsequent runs.

**Tip 2**: The token reduction percentage depends on your code style:
- Heavy comments? → Higher reduction (more to remove)
- Minimal code? → Lower reduction (less to compress)

**Tip 3**: Copy the full context output into Kiro's first message. Subsequent messages can be shorter since Kiro remembers the context.

**Tip 4**: You can compress logs (errors, traces, outputs) too. Just open the file and run "Compress Logs".

---

## Common Issues

**Problem**: Sidebar doesn't show files after clicking Arjun icon

**Solution**: Run "Arjun: Analyze Repository" first. The tree is empty until you analyze.

---

**Problem**: "No active editor" error when building context

**Solution**: Make sure you have a code file open (not git diff, not a settings panel). Click on any .ts/.py/.java file first.

---

**Problem**: Stats panel is blank

**Solution**: Reload VSCode (Cmd+R on Mac, Ctrl+R on Windows/Linux).

---

## Ready to Go!

You're all set. Start with any of your projects and watch your token usage drop. 

Questions? Check [DEPLOYMENT.md](./DEPLOYMENT.md) or file an issue in the repo.

Happy coding! ⚡
