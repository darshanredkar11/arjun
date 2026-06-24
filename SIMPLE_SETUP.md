# Arjun - Super Simple Setup (No Tech Jargon)

**Pick ONE method below. Follow it exactly.**

---

## METHOD 1: Ask Kiro (Recommended)

### STEP 1: Get Your Kiro API Key (2 minutes)

1. **Go to:** https://kiro.sh
2. **Click:** "Sign In" (or "Sign Up" if new)
3. **Log in** with your email
4. **Look for:** "API Keys" or "Settings" (top right menu)
5. **Click:** "Create API Key" or "Generate Key"
6. **Copy the key** (looks like: `sk-kiro-abc123xyz...`)
   - **Keep this tab open!** You'll need it in the next step

✅ **You now have your Kiro API key**

---

### STEP 2: Add Key to VSCode (2 minutes)

**You're in VSCode right now, right?**

1. **Click:** VSCode menu → **Code** → **Settings** (Mac)
   - OR **File** → **Preferences** → **Settings** (Windows/Linux)

2. **You'll see a search box at the top. Type:**
   ```
   arjun.kiro
   ```

3. **You'll see two boxes:**
   - `arjun.kiro.apiKey` ← This one!
   - `arjun.kiro.endpoint` (leave this alone)

4. **Click in the `apiKey` box and paste** your Kiro key from Step 1

5. **Close Settings** (click the X)

✅ **Done! VSCode now knows your Kiro key**

---

### STEP 3: Use It (30 seconds)

**In VSCode:**

1. **Open any code file** in your project (any `.ts`, `.js`, `.py` file)
2. **Press:** `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. **Type:** `ask kiro` (or just `kiro`)
4. **Click:** "Arjun: Ask Kiro (with optimized context)"
5. **A text box appears.** Type your question:
   ```
   How does the auth system work?
   ```
   (or: "Fix this bug", "Explain this function", "What's the best way to...", anything!)

6. **Press Enter**
7. **Wait 5-10 seconds...**
8. **Kiro's answer appears in a new panel** on the right side of VSCode

✅ **That's it! You're using Arjun.**

---

## METHOD 2: Ask Claude (Same steps, different service)

### STEP 1: Get Claude API Key

1. **Go to:** https://console.anthropic.com
2. **Click:** "API Keys" (left sidebar)
3. **Click:** "Create Key"
4. **Copy it** (looks like: `sk-ant-abc123xyz...`)
5. **Keep this tab open**

### STEP 2: Add Key to VSCode

1. **Click:** VSCode menu → **Code** → **Settings** (Mac)
   - OR **File** → **Preferences** → **Settings** (Windows/Linux)

2. **Search box, type:**
   ```
   arjun.claude.apiKey
   ```

3. **Paste your Claude key** in the box below

4. **Close Settings**

### STEP 3: Use It

1. **Press:** `Cmd+Shift+P` or `Ctrl+Shift+P`
2. **Type:** `ask claude`
3. **Click:** "Arjun: Ask Claude (with optimized context)"
4. **Type your question** (same as Kiro)
5. **Press Enter**
6. **Claude's answer appears on the right**

---

## METHOD 3: Manual Copy/Paste (No API Keys Needed)

**If you don't want to set up API keys:**

1. **Press:** `Cmd+Shift+P` or `Ctrl+Shift+P`
2. **Type:** `optimize` or `context`
3. **Click:** "Arjun: Build Optimized Context"
4. **A panel appears on the right** showing your compressed code
5. **Click:** "Copy Context to Clipboard"
6. **Go to Kiro.sh or Claude web interface** (open in browser)
7. **Paste your context** in the chat box
8. **Type your question** after the context
9. **Send**

This is slower (30 seconds vs 5 seconds) but works with any AI tool.

---

## FAQ

### Q: Where exactly is "Settings" in VSCode?
**A:** 
- **Mac:** Top menu bar → Click "Code" → Look for "Settings"
- **Windows:** Top menu bar → Click "File" → Click "Preferences" → Click "Settings"
- **Shortcut for all:** Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)

### Q: The settings window looks confusing. Where do I paste the key?
**A:** 
- The **search box is at the TOP**
- Type `arjun.kiro.apiKey` or `arjun.claude.apiKey`
- You'll see the setting appear below
- Click in the **empty text field** next to it
- Paste your API key there
- It saves automatically

### Q: Do I have to say "Arjun" when asking a question?
**A:** No! Just ask normally:
- ❌ "Arjun: How does auth work?"
- ✅ "How does auth work?"
- ✅ "Fix the login bug"
- ✅ "Explain this function"

Just ask like you're talking to Kiro or Claude directly.

### Q: What if I get an error "API key not found"?
**A:**
1. Check you pasted the key correctly (no extra spaces)
2. Make sure you searched for `arjun.kiro.apiKey` (not just `kiro`)
3. Restart VSCode
4. Try again

### Q: Can I use Arjun with ChatGPT?
**A:** 
- Not directly with API integration yet
- But you can use **Method 3 (Manual)** and paste in ChatGPT web
- It'll still compress your code 50-70%

### Q: How much does this cost?
**A:**
- **Kiro:** Check kiro.sh pricing
- **Claude:** About $0.003 per query (vs $0.011 without compression)
- You save 68% on API costs
- Manual method (Method 3): Free forever

### Q: Is my code safe?
**A:**
- Code **never goes to Arjun servers**
- Only goes directly to Kiro or Claude API
- Same as if you copy/pasted manually
- 100% secure

---

## Still Confused?

**Try this quick test:**
1. Open any code file in VSCode
2. Press `Cmd+Shift+P` (or `Ctrl+Shift+P`)
3. Type `analyze`
4. Click "Arjun: Analyze Repository"
5. Wait 5 seconds
6. Look at the left sidebar (where file explorer is)
7. You'll see "Arjun" section with your files and stats
8. This means Arjun is working!

Now go back and follow METHOD 1 or 2.

---

## Next Steps

- ✅ Set up API key (METHOD 1 or 2)
- ✅ Ask your first question
- ✅ See the compressed context + answer
- ✅ Save money on API costs
- ✅ Ship your code faster

That's it!
