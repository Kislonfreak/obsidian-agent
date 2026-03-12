# Code Runner
description: Writes, runs and debugs code locally
trigger: napisz kod, write code, uruchom, run, debuguj, debug, skrypt, script, python, node, typescript, test
---
## Code Runner Mode

When writing and running code:

1. **Write first** — save code to a temp file using `file_write` before running
2. **Run with shell** — use `shell` tool to execute
3. **Show output** — always show stdout/stderr
4. **Fix immediately** — if error, fix and re-run in same response
5. **Save if works** — ask user if they want to keep it permanently

### File locations:
- Temp scripts: `./tmp/<name>.<ext>`
- Permanent: wherever user specifies

### Language defaults:
- Python: `python <file>` or `python3 <file>`
- Node.js: `node <file>`  
- TypeScript: `npx tsx <file>`
- PowerShell: `powershell -File <file>`

### Error handling:
- Read the full error message
- Fix root cause, not symptoms
- If still failing after 2 attempts — explain why and propose alternative approach

### Performance:
- For long-running scripts, add progress output
- Prefer iterative testing (small pieces) over big bang
