# Arjun Test Scenarios

Use these scenarios to validate Arjun works correctly with real projects.

## Scenario 1: Small TypeScript Project (5-10 files)

**Setup**: Open a small TS/JS project

**Test Steps**:
1. Run "Arjun: Analyze Repository"
2. ✅ Check: Tree shows 3-5 files (or all files if <5)
3. ✅ Verify: Index.ts / main.ts should rank high
4. Run "Arjun: Build Optimized Context"
5. ✅ Check: Panel shows all top files in "Relevant Files" section
6. ✅ Verify: Compression shows 40-60% reduction
7. Click "Copy Context to Clipboard"
8. ✅ Check: Content is copied (no errors)

**Expected Results**:
- Analysis completes in <2 seconds
- All files ranked and displayed
- Compression works
- No console errors

---

## Scenario 2: Large Python Project (50+ files)

**Setup**: Open a large Python project (Django, Flask, etc.)

**Test Steps**:
1. Run "Arjun: Analyze Repository"
2. ✅ Check: Takes 3-10 seconds (depends on size)
3. ✅ Verify: Tree shows top 10 files
4. ✅ Check: Key files rank high (e.g., models.py, views.py)
5. Run "Arjun: Build Optimized Context"
6. ✅ Verify: Handles file sizes correctly
7. ✅ Check: Token report shows reasonable compression

**Expected Results**:
- Analyzer doesn't hang on large projects
- Ranking makes sense (high-frequency imports rank higher)
- Compression ratio consistent with code size

---

## Scenario 3: Mixed Language Project

**Setup**: Open a full-stack project (API + Frontend + Config)

**Test Steps**:
1. Run "Arjun: Analyze Repository"
2. ✅ Check: Both .ts and .py files analyzed
3. ✅ Verify: Cross-file references detected (e.g., API imports)
4. ✅ Check: Config files rank appropriately
5. Run "Arjun: Build Optimized Context"
6. ✅ Verify: Code compression works for both languages

**Expected Results**:
- Handles multiple languages without errors
- Symbol extraction works per language
- Mixed-language compression succeeds

---

## Scenario 4: File Compression Commands

**Setup**: Open any code file

**Test Steps**:
1. Open a .ts file
2. Run "Arjun: Compress Current File"
3. ✅ Check: Shows compression stats (e.g., "500 → 300 tokens (40% reduction)")
4. Open a .py file
5. Run "Arjun: Compress Current File"
6. ✅ Check: Works for Python too
7. Open a .json file
8. ✅ Verify: JSON compression runs without error

**Expected Results**:
- Command works for all supported file types
- Stats display correctly
- No errors for unsupported types (fallback to code compression)

---

## Scenario 5: Log Compression

**Setup**: Create a test log file with repeated errors

```
[ERROR] Connection timeout at line 142
[ERROR] Connection timeout at line 145
[ERROR] Connection timeout at line 148
[ERROR] Database unavailable at line 156
[ERROR] Database unavailable at line 159
[WARN] Retry attempt #1 at line 200
[WARN] Retry attempt #2 at line 205
[WARN] Retry attempt #3 at line 210
```

**Test Steps**:
1. Save as `test.log`
2. Open in VSCode
3. Run "Arjun: Compress Logs"
4. ✅ Check: Deduplicates similar errors
5. ✅ Verify: Shows occurrence counts
6. ✅ Check: Compression ratio is high (80%+)

**Expected Results**:
- Log compression shows dramatic reduction
- Similar lines grouped
- Summary is readable

---

## Scenario 6: Kiro Integration

**Setup**: Have Arjun open alongside Kiro

**Test Steps**:
1. In VSCode, run "Arjun: Build Optimized Context"
2. Click "Copy Context to Clipboard"
3. Switch to Kiro
4. Paste context into a new conversation
5. ✅ Check: Context is properly formatted
6. ✅ Verify: No markdown formatting issues
7. ✅ Check: Token count displayed in Kiro
8. Ask Kiro a question about your code
9. ✅ Verify: Kiro uses the context (check in response)
10. Compare token usage:
    - With Arjun context: X tokens
    - Without context: Y tokens
11. ✅ Check: X < Y (token savings)

**Expected Results**:
- Context copies cleanly to Kiro
- Kiro accepts and uses the compressed context
- Token savings visible in API logs (40-70% reduction typical)

---

## Scenario 7: Large File Handling

**Setup**: Open a large code file (1000+ lines)

**Test Steps**:
1. Run "Arjun: Compress Current File"
2. ✅ Check: Command completes in <5 seconds
3. ✅ Verify: Compression ratio is reasonable
4. Run "Arjun: Build Optimized Context"
5. ✅ Check: Large file is included (if ranked high)
6. ✅ Verify: Compression is applied to it

**Expected Results**:
- Handles large files without timeout
- Compression effective but not aggressive (preserve code meaning)
- No memory errors or crashes

---

## Scenario 8: No Supported Files

**Setup**: Create a folder with only unsupported files

```
config.txt
data.csv
image.png
README (no extension)
```

**Test Steps**:
1. Open folder in VSCode
2. Run "Arjun: Analyze Repository"
3. ✅ Check: Completes without error
4. ✅ Verify: Tree shows no files (or only README if recognized)
5. Run "Arjun: Build Optimized Context"
6. ✅ Check: Shows empty or minimal context

**Expected Results**:
- Graceful handling of unsupported file types
- No crashes or exceptions
- Clear message to user

---

## Scenario 9: Rapid Re-analysis

**Setup**: Open a project

**Test Steps**:
1. Run "Arjun: Analyze Repository"
2. Wait for completion
3. Run "Arjun: Analyze Repository" again immediately
4. ✅ Check: Second run completes (no duplicate processes)
5. ✅ Verify: Results are consistent

**Expected Results**:
- Re-analysis doesn't cause conflicts
- Results are deterministic (same ranking)

---

## Scenario 10: Token Budget Constraint

**Setup**: Open a large project with many files

**Test Steps**:
1. Run "Arjun: Build Optimized Context"
2. ✅ Check: Reports token budget (should be 4096 or configurable)
3. ✅ Verify: Selected files fit within budget
4. ✅ Check: Token report shows budget constraint respected
5. Edit the prompt to be longer
6. Run "Arjun: Build Optimized Context" again
7. ✅ Verify: Fewer files included due to longer prompt

**Expected Results**:
- Token budgeting works as expected
- Fewer files included as prompt grows
- No error when budget is exceeded

---

## Validation Checklist

After running scenarios, check:

- [ ] No console errors (Cmd+Shift+J in VSCode)
- [ ] All commands accessible via Cmd+Shift+P
- [ ] Stats panel displays correctly
- [ ] Tree view updates after each analysis
- [ ] Compression ratios reasonable (code: 40-70%, logs: 80-95%)
- [ ] File paths in output are correct
- [ ] No memory leaks (monitor in DevTools)
- [ ] Works with different VSCode themes
- [ ] Keyboard navigation works (Tab through UI)
- [ ] Copying works for all content types

---

## Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| Analyze (10 files) | <2s | __ |
| Analyze (100+ files) | <10s | __ |
| Compress file (100 lines) | <1s | __ |
| Build context | <3s | __ |
| Copy to clipboard | <500ms | __ |

---

## Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| Tree view doesn't update | Click refresh button or run analyze again |
| Stats panel is blank | Reload VSCode window (Cmd+R) |
| Compression shows 0% | File may be empty or very small |

---

## Reporting Issues

If tests fail:
1. Note the scenario number
2. Capture: OS, VSCode version, project type
3. Check console for errors (Cmd+Shift+J)
4. Include screenshot of error
5. File issue with tag `bug:` and scenario number
