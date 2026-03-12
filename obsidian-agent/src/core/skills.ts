import fs from 'fs/promises'
import path from 'path'
import { config } from '../core/config.js'

export interface Skill {
  name: string
  description: string
  trigger: string[]   // keywords that activate this skill
  prompt: string      // injected into system prompt when active
  tools?: string[]    // extra tool names this skill enables
}

export class SkillLoader {
  private skills = new Map<string, Skill>()
  private skillsPath: string

  constructor() {
    this.skillsPath = path.join(config.vault.path, 'skills')
  }

  async loadAll(): Promise<void> {
    this.skills.clear()
    try {
      const files = await fs.readdir(this.skillsPath)
      for (const file of files.filter(f => f.endsWith('.md'))) {
        await this.loadSkill(file)
      }
      console.log(`[skills] loaded ${this.skills.size} skill(s): ${[...this.skills.keys()].join(', ')}`)
    } catch {
      await fs.mkdir(this.skillsPath, { recursive: true })
    }
  }

  private async loadSkill(filename: string): Promise<void> {
    const filePath = path.join(this.skillsPath, filename)
    const content = await fs.readFile(filePath, 'utf-8')
    const skill = this.parseSkill(filename.replace('.md', ''), content)
    if (skill) this.skills.set(skill.name, skill)
  }

  private parseSkill(name: string, content: string): Skill | null {
    // Parse frontmatter-style metadata from markdown
    // Format:
    // # Skill Name
    // description: ...
    // trigger: keyword1, keyword2
    // ---
    // (rest is the prompt injected into system)

    const lines = content.split('\n')
    let description = ''
    let trigger: string[] = []
    let promptStart = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('description:')) {
        description = line.slice('description:'.length).trim()
      } else if (line.startsWith('trigger:')) {
        trigger = line.slice('trigger:'.length).split(',').map(t => t.trim().toLowerCase())
      } else if (line === '---') {
        promptStart = i + 1
        break
      }
    }

    const prompt = lines.slice(promptStart).join('\n').trim()

    return { name, description, trigger, prompt }
  }

  // Detect which skills apply to a given input
  getActiveSkills(input: string): Skill[] {
    const lower = input.toLowerCase()
    return [...this.skills.values()].filter(skill =>
      skill.trigger.some(t => lower.includes(t))
    )
  }

  // Get all skills prompt injection
  buildSkillsPrompt(input: string): string {
    const active = this.getActiveSkills(input)
    if (active.length === 0) return ''
    return '\n\n## Active Skills\n' + active.map(s => s.prompt).join('\n\n')
  }

  getSkill(name: string): Skill | undefined {
    return this.skills.get(name)
  }

  getAllSkills(): Skill[] {
    return [...this.skills.values()]
  }

  async saveSkill(name: string, content: string): Promise<void> {
    await fs.mkdir(this.skillsPath, { recursive: true })
    await fs.writeFile(path.join(this.skillsPath, `${name}.md`), content, 'utf-8')
    await this.loadSkill(`${name}.md`)
    console.log(`[skills] saved: ${name}`)
  }

  async deleteSkill(name: string): Promise<void> {
    await fs.unlink(path.join(this.skillsPath, `${name}.md`))
    this.skills.delete(name)
  }
}

export const skillLoader = new SkillLoader()
