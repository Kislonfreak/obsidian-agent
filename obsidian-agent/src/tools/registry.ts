import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { VaultManager } from '../core/vault.js'

const execAsync = promisify(exec)

export interface Tool {
  name: string
  description: string
  parameters: object
  execute: (args: Record<string, unknown>, vault: VaultManager) => Promise<string>
}

export const TOOLS: Tool[] = [

  // ── Shell ──────────────────────────────────────────────────────────
  {
    name: 'shell',
    description: 'Run a shell command and return output. Use for system tasks, git, npm, etc.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        cwd: { type: 'string', description: 'Working directory (optional)' }
      },
      required: ['command']
    },
    async execute({ command, cwd }) {
      try {
        const { stdout, stderr } = await execAsync(command as string, {
          cwd: cwd as string | undefined,
          timeout: 30000,
          shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash'
        })
        return stdout || stderr || '(no output)'
      } catch (err: any) {
        return `ERROR: ${err.message}`
      }
    }
  },

  // ── File read ──────────────────────────────────────────────────────
  {
    name: 'file_read',
    description: 'Read a file from disk',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute or relative file path' }
      },
      required: ['path']
    },
    async execute({ path: filePath }) {
      try {
        return await fs.readFile(filePath as string, 'utf-8')
      } catch (err: any) {
        return `ERROR: ${err.message}`
      }
    }
  },

  // ── File write ─────────────────────────────────────────────────────
  {
    name: 'file_write',
    description: 'Write content to a file',
    parameters: {
      type: 'object',
      properties: {
        path:    { type: 'string', description: 'File path' },
        content: { type: 'string', description: 'Content to write' },
        append:  { type: 'boolean', description: 'Append instead of overwrite' }
      },
      required: ['path', 'content']
    },
    async execute({ path: filePath, content, append }) {
      try {
        const p = filePath as string
        await fs.mkdir(path.dirname(p), { recursive: true })
        if (append) {
          await fs.appendFile(p, content as string, 'utf-8')
        } else {
          await fs.writeFile(p, content as string, 'utf-8')
        }
        return `Written: ${p}`
      } catch (err: any) {
        return `ERROR: ${err.message}`
      }
    }
  },

  // ── Web search ─────────────────────────────────────────────────────
  {
    name: 'web_search',
    description: 'Search the web using DuckDuckGo. Returns top results.',
    parameters: {
      type: 'object',
      properties: {
        query:      { type: 'string',  description: 'Search query' },
        maxResults: { type: 'number',  description: 'Max results (default 5)' }
      },
      required: ['query']
    },
    async execute({ query, maxResults = 5 }) {
      try {
        const q = encodeURIComponent(query as string)
        const res = await fetch(`https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`, {
          headers: { 'User-Agent': 'obsidian-agent/1.0' }
        })
        const data = await res.json() as any

        const results: string[] = []

        // Abstract (instant answer)
        if (data.Abstract) {
          results.push(`**${data.Heading}**\n${data.Abstract}\n${data.AbstractURL}`)
        }

        // Related topics
        const topics = (data.RelatedTopics || [])
          .filter((t: any) => t.Text && t.FirstURL)
          .slice(0, (maxResults as number) - results.length)

        for (const t of topics) {
          results.push(`- ${t.Text}\n  ${t.FirstURL}`)
        }

        if (results.length === 0) {
          // Fallback: HTML search scrape
          const htmlRes = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
          })
          const html = await htmlRes.text()
          const matches = [...html.matchAll(/class="result__snippet"[^>]*>([^<]+)</g)]
          const snippets = matches.slice(0, maxResults as number).map(m => m[1].trim())
          return snippets.length ? snippets.join('\n\n') : 'No results found.'
        }

        return results.join('\n\n')
      } catch (err: any) {
        return `Search error: ${err.message}`
      }
    }
  },

  // ── Memory write ───────────────────────────────────────────────────
  {
    name: 'memory_write',
    description: 'Write an important fact or decision to long-term memory (MEMORY.md)',
    parameters: {
      type: 'object',
      properties: {
        section: { type: 'string', enum: ['System', 'Fixes', 'Decisions', 'Disagreements'] },
        entry:   { type: 'string', description: 'What to remember' }
      },
      required: ['entry']
    },
    async execute({ entry, section = 'Decisions' }, vault) {
      const line = `\n- \`${new Date().toISOString().split('T')[0]}\` [${section}] ${entry}`
      await vault.append('MEMORY.md', line)
      return `Saved to MEMORY.md: ${entry}`
    }
  },

  // ── Vault read ─────────────────────────────────────────────────────
  {
    name: 'vault_read',
    description: 'Read a file from the Obsidian vault',
    parameters: {
      type: 'object',
      properties: {
        file: { type: 'string', description: 'Relative path within vault (e.g. PROJECTS.md)' }
      },
      required: ['file']
    },
    async execute({ file }, vault) {
      const content = await vault.read(file as string)
      return content || `(empty: ${file})`
    }
  },

  // ── Vault write ────────────────────────────────────────────────────
  {
    name: 'vault_write',
    description: 'Write or update a file in the Obsidian vault',
    parameters: {
      type: 'object',
      properties: {
        file:    { type: 'string', description: 'Relative path within vault' },
        content: { type: 'string', description: 'Content to write' },
        append:  { type: 'boolean', description: 'Append to existing content' }
      },
      required: ['file', 'content']
    },
    async execute({ file, content, append }, vault) {
      if (append) {
        await vault.append(file as string, content as string)
      } else {
        await vault.write(file as string, content as string)
      }
      return `Vault updated: ${file}`
    }
  },

  // ── Skill management ──────────────────────────────────────────────
  {
    name: 'skill_create',
    description: 'Create a new skill and save it to vault/skills/',
    parameters: {
      type: 'object',
      properties: {
        name:    { type: 'string', description: 'Skill name (lowercase, hyphens)' },
        content: { type: 'string', description: 'Full skill markdown content' }
      },
      required: ['name', 'content']
    },
    async execute({ name, content }, vault) {
      const { skillLoader } = await import('../core/skills.js')
      await skillLoader.saveSkill(name as string, content as string)
      return `Skill saved: vault/skills/${name}.md`
    }
  },

  {
    name: 'skill_list',
    description: 'List all available skills',
    parameters: { type: 'object', properties: {} },
    async execute(_args, _vault) {
      const { skillLoader } = await import('../core/skills.js')
      const skills = skillLoader.getAllSkills()
      if (skills.length === 0) return 'No skills loaded.'
      return skills.map(s => `- **${s.name}**: ${s.description}\n  triggers: ${s.trigger.join(', ')}`).join('\n')
    }
  },

  {
    name: 'skill_delete',
    description: 'Delete a skill by name',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Skill name to delete' }
      },
      required: ['name']
    },
    async execute({ name }, _vault) {
      const { skillLoader } = await import('../core/skills.js')
      await skillLoader.deleteSkill(name as string)
      return `Deleted skill: ${name}`
    }
  },


  {
    name: 'switch_branch',
    description: 'Switch the active knowledge branch (main, coding, research, or custom)',
    parameters: {
      type: 'object',
      properties: {
        branch: { type: 'string', description: 'Branch name to activate' }
      },
      required: ['branch']
    },
    async execute({ branch }, vault) {
      const { config } = await import('../core/config.js')
      config.vault.activeBranch = branch as string
      return `Active knowledge branch: ${branch}`
    }
  }
]

export function getToolSchemas() {
  return TOOLS.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }
  }))
}

export function getTool(name: string): Tool | undefined {
  return TOOLS.find(t => t.name === name)
}
