import fs from 'fs/promises'
import path from 'path'
import chokidar from 'chokidar'
import { EventEmitter } from 'events'
import { config } from './config.js'

export interface VaultFile {
  name: string
  path: string
  content: string
  modified: Date
}

export class VaultManager extends EventEmitter {
  private vaultPath: string
  private cache = new Map<string, string>()
  private watcher?: ReturnType<typeof chokidar.watch>

  constructor() {
    super()
    this.vaultPath = config.vault.path
  }

  async init() {
    await fs.mkdir(this.vaultPath, { recursive: true })
    await this.ensureStructure()
    this.watchVault()
    console.log(`[vault] watching ${this.vaultPath}`)
  }

  private async ensureStructure() {
    const dirs = [
      'skills', 'daily',
      'knowledge/main', 'knowledge/coding', 'knowledge/research'
    ]
    for (const dir of dirs) {
      await fs.mkdir(path.join(this.vaultPath, dir), { recursive: true })
    }

    // Create default files if missing
    await this.ensureFile('SOUL.md', DEFAULT_SOUL)
    await this.ensureFile('USER.md', DEFAULT_USER)
    await this.ensureFile('MEMORY.md', DEFAULT_MEMORY)
    await this.ensureFile('PROJECTS.md', DEFAULT_PROJECTS)
  }

  private async ensureFile(name: string, content: string) {
    const filePath = path.join(this.vaultPath, name)
    try {
      await fs.access(filePath)
    } catch {
      await fs.writeFile(filePath, content, 'utf-8')
    }
  }

  private watchVault() {
    this.watcher = chokidar.watch(this.vaultPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    })
    this.watcher.on('change', (filePath) => {
      this.cache.delete(filePath)
      // Notify agent to invalidate system prompt cache
      this.emit('vaultChange', filePath)
      console.log(`[vault] changed: ${path.relative(this.vaultPath, filePath)}`)
    })
  }

  async read(relativePath: string): Promise<string> {
    const fullPath = path.join(this.vaultPath, relativePath)
    if (this.cache.has(fullPath)) return this.cache.get(fullPath)!
    try {
      const content = await fs.readFile(fullPath, 'utf-8')
      this.cache.set(fullPath, content)
      return content
    } catch {
      return ''
    }
  }

  async write(relativePath: string, content: string) {
    const fullPath = path.join(this.vaultPath, relativePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content, 'utf-8')
    this.cache.set(fullPath, content)
  }

  async append(relativePath: string, content: string) {
    const existing = await this.read(relativePath)
    await this.write(relativePath, existing + '\n' + content)
  }

  async list(dir: string): Promise<string[]> {
    const fullPath = path.join(this.vaultPath, dir)
    try {
      const files = await fs.readdir(fullPath)
      return files.filter(f => f.endsWith('.md'))
    } catch {
      return []
    }
  }

  // Load knowledge branch for RAG
  async loadBranch(branch: string): Promise<string> {
    const files = await this.list(`knowledge/${branch}`)
    const contents: string[] = []
    for (const file of files) {
      const content = await this.read(`knowledge/${branch}/${file}`)
      if (content) contents.push(`## ${file}\n${content}`)
    }
    return contents.join('\n\n---\n\n')
  }

  // Build system prompt from vault files
  async buildSystemPrompt(full = true): Promise<string> {
    const soul   = await this.read('SOUL.md')
    const user   = await this.read('USER.md')
    const memory = await this.read('MEMORY.md')
    const today  = new Date().toISOString().split('T')[0]

    if (!full) {
      // Lightweight prompt for fast queries
      return `${soul}\n\n${user}\n\n## Memory\n${memory}\n\nToday: ${today}`
    }

    const projects  = await this.read('PROJECTS.md')
    const branch    = config.vault.activeBranch
    const knowledge = await this.loadBranch(branch)
    const dailyLog  = await this.read(`daily/${today}.md`)

    return `${soul}

---

${user}

---

## Memory
${memory}

---

## Projects
${projects}

---

## Knowledge (branch: ${branch})
${knowledge || 'No knowledge loaded for this branch.'}

---

## Today's Log (${today})
${dailyLog || 'No entries yet today.'}

---

Today's date: ${today}
`
  }

  async writeDailyLog(entry: string) {
    const today = new Date().toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString('pl-PL')
    await this.append(`daily/${today}.md`, `\n**${time}** ${entry}`)
  }

  async writeMemory(entry: string) {
    const date = new Date().toISOString().split('T')[0]
    await this.append('MEMORY.md', `\n- \`${date}\` ${entry}`)
  }
}

// Default vault file contents
const DEFAULT_SOUL = `# Soul

## Identity
- **Name:** ObsidianAgent
- **Vibe:** Fast, precise, no fluff. Technical partner with opinions.
- **Emoji:** 🧠

## Language Rule
ALWAYS respond in the user's language.
If user writes in Polish — respond in Polish with correct grammar and spelling.
If English — respond in English. NEVER mix languages.

## Formatting Rules (CRITICAL — always follow)
**Lists:**
- One item per line, never inline
- Bullet • or – for unordered, numbers for steps
- Max 1-2 lines per item, keep it short

**Sections:**
- Use ## headers to separate topics
- Blank line between sections

**Code:**
- Always use triple backticks with language name
- Never write code inline in a sentence

**Tables:**
- Use markdown tables for comparisons, lists of features, skill summaries

**Response style:**
- Short answer first, details below
- No filler: "Świetne pytanie!", "Oczywiście!", "Certainly!", "Of course!"
- No repeating the question back to the user

## Core Traits
- Terse by default. One sentence beats a paragraph.
- Opinionated. Has a take. Shares it once.
- Confirms before destructive actions — once, clearly.
- Never pretends to have done something it hasn't.
- Writes to memory without being asked when something important happens.

## Boot Sequence
Every session:
1. Read SOUL.md, USER.md, MEMORY.md, PROJECTS.md
2. Greet with one-line status — NOT "Jak mogę Ci pomóc?"

## Sign-off
End significant responses with:
⚙️ [what was done] | 🔜 [next step] | 🧠 [saved to memory if applicable]
`

const DEFAULT_USER = `# User Context

## Identity
- **Name:** (set me)
- **Timezone:** Europe/Warsaw
- **Language:** Polish (primary), English (technical)

## Preferences
- Short and to the point
- Working code over perfect code
- Proposals with reasoning, not questions

## Notes
<!-- Agent appends observations here -->
`

const DEFAULT_MEMORY = `# Memory
<!-- Agent appends here. Curate periodically. -->

## System
<!-- Hardware, software, config facts -->

## Fixes
<!-- Bugs solved and how -->

## Decisions
<!-- Choices made and why -->

## Disagreements
<!-- When agent disagreed but executed anyway -->
`

const DEFAULT_PROJECTS = `# Projects
<!-- Active projects with status, blockers, next steps -->

## Format
**Project name** \`STATUS: active|blocked|done\`
- Goal:
- Last action:
- Next step:
- Blocker:
`
