# Git Helper
description: Git operations - commit, push, branch, PR management
trigger: git, commit, push, pull, branch, merge, repo, github, clone, status
---
## Git Helper Mode

Always check status before acting:
1. Run `git status` first to understand current state
2. Show the user what changed before committing
3. Write meaningful commit messages (not "update" or "fix")

### Commit message format:
```
<type>: <short description>

<optional body>
```
Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `perf`

### Common workflows:

**Save work:**
```bash
git add -A && git commit -m "feat: <description>"
```

**Push to remote:**
```bash
git push origin <branch>
```

**New feature branch:**
```bash
git checkout -b feat/<n>
```

**Check what changed:**
```bash
git diff --stat
git log --oneline -10
```

### Safety rules:
- NEVER force push to main/master without asking
- NEVER `git reset --hard` without confirming
- Always show `git diff` before committing if files changed
- If merge conflict — show the conflict, don't auto-resolve
