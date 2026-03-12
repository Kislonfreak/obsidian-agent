# 🧠 ObsidianAgent

**Ultra-fast local AI agent with your Obsidian vault as its brain.**

No cloud. No subscriptions. No data leaving your machine.

![status](https://img.shields.io/badge/status-active-brightgreen)
![node](https://img.shields.io/badge/node-%3E%3D20-blue)
![license](https://img.shields.io/badge/license-MIT-green)

---

## What makes it different

| Feature | Description |
|---|---|
| 🧠 **Obsidian as brain** | Edit personality, memory, skills in Obsidian — just markdown |
| ⚡ **Multi-model routing** | Small model for speed, big model for thinking, vision model for images |
| 🎯 **Skill system** | Agent learns new skills from `.md` files, create them by talking |
| 📂 **Knowledge branches** | Organize knowledge, switch context with one command |
| 🔒 **Fully local** | Runs on Ollama, no API keys needed |

---

## Architecture

```
┌─────────────────────────────────────┐
│           Obsidian Vault            │  ← You edit here
│  SOUL.md · USER.md · MEMORY.md      │
│  PROJECTS.md · skills/ · knowledge/ │
└──────────────┬──────────────────────┘
               │ read/write .md files (live sync)
┌──────────────▼──────────────────────┐
│         Node.js Backend             │
│                                     │
│  Router ──→ qwen3.5:4b  (fast)     │  ~2-4s
│         ──→ qwen3:8b    (think)    │  ~5-10s
│         ──→ qwen2.5vl   (vision)   │  ~3-6s
│                                     │
│  Tools: shell · files · web search  │
│         vault · memory · git        │
└──────┬───────────────────┬──────────┘
       │                   │
  ┌────▼────┐        ┌─────▼──────┐
  │ Web UI  │        │  Telegram  │
  │:18789   │        │    Bot     │
  └─────────┘        └────────────┘
```

---

## Requirements

| Tool | Version | Download |
|---|---|---|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| Ollama | latest | [ollama.com](https://ollama.com) |
| Git | any | [git-scm.com](https://git-scm.com) |
| Obsidian | any (optional) | [obsidian.md](https://obsidian.md) |

---

## Installation

### Step 1 — Install Ollama

Download and install from [ollama.com](https://ollama.com).

Verify it's running:
```bash
ollama list
```

### Step 2 — Pull models

```bash
# Required — main thinking model
ollama pull qwen3:8b

# Required — fast tools model
ollama pull qwen3.5:4b

# Required — vision model
ollama pull qwen2.5vl:3b
```

> **Note:** Total download ~18GB. Make sure you have enough disk space.
> Minimum VRAM: 6GB. Recommended: 8GB+.

### Step 3 — Install Node.js

Download Node.js ≥ 20 from [nodejs.org](https://nodejs.org) (LTS version recommended).

Verify:
```bash
node --version   # should show v20.x or higher
npm --version
```

### Step 4 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/obsidian-agent.git
cd obsidian-agent
```

### Step 5 — Install dependencies

```bash
npm install
```

### Step 6 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and adjust if needed:

```env
# Ollama settings
OLLAMA_URL=http://localhost:11434
THINKING_MODEL=qwen3:8b
TOOLS_MODEL=qwen3.5:4b
VISION_MODEL=qwen2.5vl:3b

# Vault location (relative or absolute path)
VAULT_PATH=./vault

# Agent name
AGENT_NAME=ObsidianAgent

# Default knowledge branch
ACTIVE_KNOWLEDGE_BRANCH=main

# Web UI port
UI_PORT=18789
WS_PORT=18790

# Telegram (optional — leave empty to skip)
TELEGRAM_TOKEN=
TELEGRAM_ALLOW_FROM=
```

### Step 7 — Set up vault files

```bash
# Windows (PowerShell)
copy vault\SOUL.md.example vault\SOUL.md
copy vault\USER.md.example vault\USER.md
copy vault\MEMORY.md.example vault\MEMORY.md
copy vault\PROJECTS.md.example vault\PROJECTS.md

# Linux / macOS
cp vault/SOUL.md.example vault/SOUL.md
cp vault/USER.md.example vault/USER.md
cp vault/MEMORY.md.example vault/MEMORY.md
cp vault/PROJECTS.md.example vault/PROJECTS.md
```

### Step 8 — Run

```bash
npm run dev
```

Open your browser at **http://127.0.0.1:18789**

### Step 9 — Onboarding

On first launch the agent detects empty vault files and runs an automatic interview.
It will ask you 8 questions and fill `USER.md`, `PROJECTS.md`, and `MEMORY.md` for you.

To repeat onboarding at any time, type `/setup` in the chat.

---

## Obsidian Setup (optional but recommended)

1. Open Obsidian
2. Click **Open folder as vault**
3. Select the `vault/` directory inside the project
4. All agent files are now visible and editable in Obsidian

Changes are picked up **instantly** — no restart needed.

| File | What to edit |
|---|---|
| `SOUL.md` | Agent name, personality, behavior rules |
| `USER.md` | Your name, timezone, tech stack, preferences |
| `MEMORY.md` | Long-term facts (agent also writes here automatically) |
| `PROJECTS.md` | Your active projects and their status |
| `skills/*.md` | Agent skills — add, edit, or delete |
| `knowledge/main/` | Drop any `.md` files here for general knowledge |
| `knowledge/coding/` | Coding-specific knowledge branch |
| `knowledge/research/` | Research knowledge branch |

---

## Telegram Setup (optional)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy the bot token
4. Get your user ID from `@userinfobot`
5. Add to `.env`:

```env
TELEGRAM_TOKEN=123456789:ABCdefGHI...
TELEGRAM_ALLOW_FROM=your_telegram_username
```

6. Restart the agent

Available bot commands:
```
/start          — show welcome message
/status         — show agent status and active model
/clear          — clear conversation history
/branch [name]  — switch knowledge branch
```

---

## CLI Commands

When running in terminal mode:

```
/setup          — re-run onboarding interview
/clear          — clear conversation history
/branch NAME    — switch knowledge branch (main/coding/research)
/help           — show all commands
/quit           — exit
```

---

## Skills

Skills are markdown files in `vault/skills/`. They activate automatically when your message contains matching keywords.

### Built-in skills

| Skill | Activation keywords | Description |
|---|---|---|
| `skill-creator` | "create skill", "nowy skill", "stwórz skill" | Creates new skills from conversation |
| `code-runner` | "napisz kod", "uruchom", "debug", "python", "node" | Writes, runs, and debugs code locally |
| `git-helper` | "git", "commit", "push", "branch", "github" | Git operations with safety checks |
| `web-researcher` | "zbadaj", "research", "znajdź", "porównaj" | Deep web research with structured output |

### Creating a new skill

Just ask:
```
stwórz skill do obsługi dockera
```

The agent writes the skill to `vault/skills/docker-helper.md` and loads it immediately.

### Skill file format

```markdown
# Skill Name
description: One line description
trigger: keyword1, keyword2, keyword3
---
## Instructions for the agent

What to do when this skill is active...
```

---

## Model Routing

The agent automatically selects the right model based on your query:

| Trigger | Model | Speed |
|---|---|---|
| Short queries, commands, tool calls | `qwen3.5:4b` | ~2-4s |
| Keywords: `wyjaśnij`, `porównaj`, `zaprojektuj`, `explain`, `analyze`, `compare` | `qwen3:8b` | ~5-10s |
| Queries > 300 characters | `qwen3:8b` | ~5-10s |
| Keywords: `obraz`, `zdjęcie`, `screenshot`, `image` | `qwen2.5vl:3b` | ~3-6s |

---

## Available Tools

| Tool | Description |
|---|---|
| `shell` | Run system commands (PowerShell on Windows, bash on Linux/macOS) |
| `file_read` | Read any file from disk |
| `file_write` | Write or append to any file |
| `web_search` | Search DuckDuckGo (no API key needed) |
| `vault_read` | Read a file from Obsidian vault |
| `vault_write` | Write to Obsidian vault |
| `memory_write` | Save a fact to MEMORY.md |
| `switch_branch` | Switch active knowledge branch |
| `skill_create` | Create a new skill |
| `skill_list` | List all loaded skills |
| `skill_delete` | Delete a skill |

---

## Troubleshooting

**Agent doesn't start:**
```bash
# Check Ollama is running
ollama list

# Check Node version
node --version  # must be ≥ 20
```

**"Cannot find module" error:**
```bash
npm install
npx tsx src/index.ts
```

**Slow responses:**
- Make sure `TOOLS_MODEL=qwen3.5:4b` (not 8b) for fast queries
- Check VRAM usage — if models are swapping, responses slow down
- `think: false` is set by default in ollama.ts — if you edited it, revert

**Web search not working:**
- DuckDuckGo has rate limits — wait 60s and try again
- Works without API key but can be rate-limited on heavy use

**Telegram bot not responding:**
- Check `TELEGRAM_TOKEN` in `.env`
- Check `TELEGRAM_ALLOW_FROM` matches your exact Telegram username (no @)
- Restart the agent after changing `.env`

---

## Roadmap

- [x] Multi-model routing
- [x] Obsidian vault sync with live file watcher
- [x] Tool calling (shell, files, web search, git)
- [x] Skill system with auto-loading
- [x] Web UI with branch switcher
- [x] Telegram channel
- [x] Onboarding interview
- [x] System prompt cache
- [ ] Chrome extension
- [ ] Heartbeat / cron jobs
- [ ] Voice input (Whisper)
- [ ] Multi-agent (coordinator + specialists)
- [ ] Fine-tuned router model (Phase 2)

---

## License

MIT — do whatever you want with it.

---

*Built with Node.js, TypeScript, Ollama, and obsessive attention to response time.*
