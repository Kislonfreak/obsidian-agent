# ObsidianAgent v0.1.0 — Initial Release

## 🧠 What is ObsidianAgent?

Ultra-fast local AI agent with Obsidian vault as its brain. Fully local, no cloud required.

---

## ✨ Features

### Multi-model routing
- `qwen3.5:4b` — fast model for simple queries and tool calls (~2-4s)
- `qwen3:8b` — thinking model for complex reasoning (~5-10s)
- `qwen2.5vl:3b` — vision model for image analysis
- Automatic routing based on query type — no manual switching

### Obsidian Vault as brain
- Agent reads and writes directly to `vault/` folder
- Edit `SOUL.md`, `USER.md`, `MEMORY.md`, `PROJECTS.md` in Obsidian
- File watcher — changes in vault are picked up instantly (no restart needed)
- System prompt cache (30s TTL) — vault loads once, not on every message

### Skill system
- Skills are `.md` files in `vault/skills/`
- Auto-loaded on startup, auto-detected by keyword matching
- 4 built-in skills included:
  - `skill-creator` — agent creates new skills from conversation
  - `code-runner` — writes and runs code locally
  - `git-helper` — git operations with safety checks
  - `web-researcher` — deep web research with structured output
- New skills saved to vault, visible and editable in Obsidian

### Tool calling
- `shell` — run system commands (PowerShell on Windows)
- `file_read` / `file_write` — read/write any file on disk
- `vault_read` / `vault_write` — read/write Obsidian vault files
- `web_search` — DuckDuckGo search (no API key needed)
- `memory_write` — save facts to MEMORY.md
- `switch_branch` — switch active knowledge branch
- `skill_create` / `skill_list` / `skill_delete` — manage skills

### Knowledge branches
- Organize knowledge in `vault/knowledge/` subdirectories
- Switch branch: `/branch coding` or via Web UI dropdown
- Agent loads branch content as RAG context

### Web UI
- Dark theme chat interface at `http://127.0.0.1:18789`
- Real-time WebSocket communication
- Branch switcher dropdown
- Shows model used and response time per message

### Telegram Bot
- Full agent access via Telegram
- Typing indicator while agent processes
- Commands: `/start` `/status` `/clear` `/branch`
- Allowlist by username for security

### Onboarding
- Auto-runs on first launch
- Agent interviews user (8 questions)
- Fills `USER.md`, `PROJECTS.md`, `MEMORY.md` automatically
- Re-run anytime with `/setup`

---

## 🛠️ Stack

- **Runtime:** Node.js + TypeScript
- **LLM:** Ollama (local)
- **Models tested:** qwen3:8b, qwen3.5:4b, qwen2.5vl:3b
- **Web:** Express + WebSocket
- **Vault sync:** chokidar file watcher
- **Telegram:** node-telegram-bot-api

---

## 📋 Requirements

- Node.js ≥ 20
- Ollama running locally
- Models: `qwen3:8b`, `qwen3.5:4b`, `qwen2.5vl:3b`
- Windows / Linux / macOS

---

## 🔜 Coming next

- Chrome extension (browser control)
- Heartbeat / cron jobs
- Voice input via Whisper
- Multi-agent (coordinator + specialists)
- Fine-tuned router model (Phase 2)

---

## ⚠️ Known issues

- `qwen3:1.7b` not available on Ollama yet — use `qwen3.5:4b` as tools model
- Web search rate-limited on heavy use (DuckDuckGo HTML fallback included)
- `better-sqlite3` requires Windows SDK — removed from dependencies, using in-memory history instead