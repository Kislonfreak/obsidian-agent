import { Ollama } from 'ollama'
import { config } from '../core/config.js'

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

export interface ToolCall {
  name: string
  arguments: Record<string, unknown>
}

export interface ModelResponse {
  content: string
  toolCalls?: ToolCall[]
  model: string
  duration: number
}

export type ModelRole = 'thinking' | 'tools' | 'vision'

export class OllamaClient {
  private client: Ollama
  private loadedModels = new Set<string>()

  constructor() {
    this.client = new Ollama({ host: config.ollama.url })
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.list()
      return true
    } catch {
      return false
    }
  }

  async listModels(): Promise<string[]> {
    const res = await this.client.list()
    return res.models.map(m => m.name)
  }

  private getModel(role: ModelRole): string {
    return config.ollama.models[role]
  }

  async chat(
    messages: Message[],
    role: ModelRole = 'thinking',
    tools?: object[]
  ): Promise<ModelResponse> {
    const model = this.getModel(role)
    const start = Date.now()

    try {
      const res = await this.client.chat({
        model,
        messages: messages as any,
        tools: tools as any,
        options: {
          temperature: role === 'tools' ? 0.0 : 0.1,
          num_ctx: role === 'thinking' ? 8192 : 4096,
          num_predict: role === 'tools' ? 512 : 1024,
          // Disable thinking tokens for speed (qwen3 specific)
          think: false,
        }
      })

      this.loadedModels.add(model)

      const toolCalls = res.message.tool_calls?.map(tc => ({
        name: tc.function.name,
        arguments: tc.function.arguments as Record<string, unknown>
      }))

      return {
        content: res.message.content || '',
        toolCalls,
        model,
        duration: Date.now() - start
      }
    } catch (err: any) {
      throw new Error(`[ollama] ${model} error: ${err.message}`)
    }
  }

  async chatStream(
    messages: Message[],
    role: ModelRole = 'thinking',
    onToken: (token: string) => void
  ): Promise<string> {
    const model = this.getModel(role)
    let full = ''

    const stream = await this.client.chat({
      model,
      messages: messages as any,
      stream: true,
      options: { temperature: 0.1, num_ctx: 8192 }
    })

    for await (const chunk of stream) {
      const token = chunk.message.content
      full += token
      onToken(token)
    }

    return full
  }
}
