import 'dotenv/config'
import path from 'path'

export const config = {
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    models: {
      thinking: process.env.THINKING_MODEL || 'qwen3:8b',
      tools:    process.env.TOOLS_MODEL    || 'qwen3:1.7b',
      vision:   process.env.VISION_MODEL   || 'qwen2.5vl:3b',
    }
  },
  vault: {
    path: path.resolve(process.env.VAULT_PATH || './vault'),
    activeBranch: process.env.ACTIVE_KNOWLEDGE_BRANCH || 'main',
  },
  agent: {
    name: process.env.AGENT_NAME || 'ObsidianAgent',
    maxToolIterations: 10,
    memoryWindow: 20,
  },
  server: {
    uiPort:  parseInt(process.env.UI_PORT  || '18789'),
    wsPort:  parseInt(process.env.WS_PORT  || '18790'),
  },
  telegram: {
    token:     process.env.TELEGRAM_TOKEN || '',
    allowFrom: (process.env.TELEGRAM_ALLOW_FROM || '').split(',').filter(Boolean),
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  }
}
