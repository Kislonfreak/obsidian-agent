import { OllamaClient, Message, ModelRole } from '../models/ollama.js'
import { VaultManager } from './vault.js'
import { TOOLS, getToolSchemas, getTool } from '../tools/registry.js'
import { skillLoader } from './skills.js'
import { config } from './config.js'

export interface AgentResponse {
  content: string
  toolsUsed: string[]
  model: string
  duration: number
}

export class Agent {
  private ollama: OllamaClient
  private vault: VaultManager
  private history: Message[] = []
  private systemPromptCache: string = ''
  private systemPromptTime: number = 0
  private readonly CACHE_TTL = 30_000 // 30s cache

  constructor(ollama: OllamaClient, vault: VaultManager) {
    this.ollama = ollama
    this.vault = vault
  }

  async init() {
    const ok = await this.ollama.ping()
    if (!ok) throw new Error('Ollama not reachable. Is it running?')
    await skillLoader.loadAll()
    // Invalidate prompt cache when vault files change
    this.vault.on('vaultChange', () => {
      this.systemPromptCache = ''
    })
    console.log(`[agent] Ollama connected`)
    console.log(`[agent] Thinking: ${config.ollama.models.thinking}`)
    console.log(`[agent] Tools:    ${config.ollama.models.tools}`)
    console.log(`[agent] Vision:   ${config.ollama.models.vision}`)
  }

  private async getSystemPrompt(full: boolean, skillsPrompt: string): Promise<string> {
    const now = Date.now()
    // Rebuild cache if stale or vault changed
    if (!this.systemPromptCache || now - this.systemPromptTime > this.CACHE_TTL) {
      this.systemPromptCache = await this.vault.buildSystemPrompt(full)
      this.systemPromptTime = now
    }
    return this.systemPromptCache + skillsPrompt
  }

  private async buildMessages(userInput: string, lightweight = false): Promise<Message[]> {
    const skillsPrompt = skillLoader.buildSkillsPrompt(userInput)
    const systemPrompt = await this.getSystemPrompt(!lightweight, skillsPrompt)
    const recent = this.history.slice(-config.agent.memoryWindow * 2)

    return [
      { role: 'system', content: systemPrompt },
      ...recent,
      { role: 'user', content: userInput }
    ]
  }

  private detectRole(input: string): ModelRole {
    const toolKeywords = ['run', 'execute', 'search', 'find', 'write', 'create', 'list', 'show']
    const lower = input.toLowerCase()

    // Vision if input contains image reference
    if (lower.includes('image') || lower.includes('screenshot') || lower.includes('zdjęcie')) {
      return 'vision'
    }

    // Tools model for action-oriented requests
    const isToolRequest = toolKeywords.some(k => lower.includes(k))
    if (isToolRequest && input.length < 200) return 'tools'

    // Complex thinking only for long or analytical queries
    const thinkingKeywords = ['dlaczego', 'wyjaśnij', 'explain', 'analyze', 'porównaj', 'compare', 'zaprojektuj', 'architektura', 'przemyśl', 'zaplanuj']
    if (input.length > 300 || thinkingKeywords.some(k => lower.includes(k))) {
      return 'thinking'
    }

    // Default: small model (fast)
    return 'tools'
  }

  async run(userInput: string, onToken?: (t: string) => void, attachments?: any[]): Promise<AgentResponse> {
    const start = Date.now()
    const toolsUsed: string[] = []
    let finalContent = ''

    await this.vault.writeDailyLog(`User: ${userInput}`)

    // If images attached, force vision model
    const hasImages = attachments?.some(a => a.type === 'image')
    const role: ModelRole = hasImages ? 'vision' : this.detectRole(userInput)
    const messages = await this.buildMessages(userInput, role !== 'thinking')

    // Inject images into last user message
    if (hasImages && attachments) {
      const lastMsg = messages[messages.length - 1]
      const content: any[] = [{ type: 'text', text: lastMsg.content }]
      for (const att of attachments.filter(a => a.type === 'image')) {
        content.push({ type: 'image_url', image_url: { url: `data:${att.mime};base64,${att.base64}` } })
      }
      messages[messages.length - 1] = { role: 'user', content: content as any }
    }
    const toolSchemas = getToolSchemas()

    // Agent loop
    let iterations = 0
    const maxIterations = config.agent.maxToolIterations
    let currentMessages = [...messages]

    while (iterations < maxIterations) {
      iterations++

      const response = await this.ollama.chat(currentMessages, role, toolSchemas)

      if (!response.toolCalls || response.toolCalls.length === 0) {
        // Final answer
        finalContent = response.content
        break
      }

      // Execute tool calls
      const toolResults: string[] = []

      for (const tc of response.toolCalls) {
        console.log(`[tool] ${tc.name}(${JSON.stringify(tc.arguments)})`)
        toolsUsed.push(tc.name)

        const tool = getTool(tc.name)
        if (!tool) {
          toolResults.push(`Unknown tool: ${tc.name}`)
          continue
        }

        const result = await tool.execute(tc.arguments, this.vault)
        console.log(`[tool] ${tc.name} → ${result.slice(0, 100)}`)
        toolResults.push(`Tool: ${tc.name}\nResult: ${result}`)
      }

      // Add assistant message and tool results to context
      currentMessages.push({
        role: 'assistant',
        content: response.content || ''
      })
      currentMessages.push({
        role: 'tool',
        content: toolResults.join('\n\n')
      })
    }

    // Update history
    this.history.push(
      { role: 'user',      content: userInput },
      { role: 'assistant', content: finalContent }
    )

    // Trim history
    if (this.history.length > config.agent.memoryWindow * 2) {
      this.history = this.history.slice(-config.agent.memoryWindow * 2)
    }

    await this.vault.writeDailyLog(`Agent: ${finalContent.slice(0, 200)}`)

    return {
      content: finalContent,
      toolsUsed,
      model: role,
      duration: Date.now() - start
    }
  }

  clearHistory() {
    this.history = []
  }

  getHistory(): Message[] {
    return [...this.history]
  }
}
