import { OllamaClient } from './models/ollama.js'
import { VaultManager } from './core/vault.js'
import { Agent } from './core/agent.js'
import { startServer } from './ui/server.js'
import { TelegramChannel } from './channels/telegram.js'
import { config } from './core/config.js'
import { runOnboarding, shouldOnboard } from './core/onboarding.js'
import readline from 'readline'

async function main() {
  console.log('🧠 ObsidianAgent starting...')

  // Init vault
  const vault = new VaultManager()
  await vault.init()

  // Init Ollama
  const ollama = new OllamaClient()

  // Onboarding if first run
  if (await shouldOnboard(vault)) {
    await runOnboarding(vault, ollama)
  }

  const agent = new Agent(ollama, vault)
  await agent.init()

  // Start web UI + WebSocket
  startServer(agent)

  // Start Telegram if configured
  if (config.telegram.token) {
    const telegram = new TelegramChannel(agent, vault)
    telegram.start()
    console.log('[telegram] channel active')
  } else {
    console.log('[telegram] skipped (no token in .env)')
  }

  console.log(`\n✅ Ready!`)
  console.log(`   Web UI:  http://127.0.0.1:${config.server.uiPort}`)
  console.log(`   Vault:   ${config.vault.path}`)
  console.log(`   Branch:  ${config.vault.activeBranch}`)
  console.log(`\nType your message below (or use the web UI):\n`)

  // CLI mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  })

  rl.prompt()

  rl.on('line', async (line) => {
    const input = line.trim()
    if (!input) { rl.prompt(); return }

    if (input === '/clear') {
      agent.clearHistory()
      console.log('[cleared]')
      rl.prompt()
      return
    }

    if (input === '/setup') {
      await runOnboarding(vault, ollama)
      agent.clearHistory()
      rl.prompt()
      return
    }

    if (input.startsWith('/branch ')) {
      config.vault.activeBranch = input.slice(8).trim()
      console.log(`[branch] → ${config.vault.activeBranch}`)
      rl.prompt()
      return
    }

    if (input === '/setup') {
      await runOnboarding(vault, ollama)
      agent.clearHistory()
      rl.prompt()
      return
    }

    if (input === '/help') {
      console.log('/setup        — re-run onboarding interview')
      console.log('/clear        — clear conversation history')
      console.log('/branch NAME  — switch knowledge branch')
      console.log('/quit         — exit')
      rl.prompt()
      return
    }

    if (input === '/quit') {
      process.exit(0)
    }

    try {
      const start = Date.now()
      process.stdout.write('🤔 ')
      const response = await agent.run(input)
      process.stdout.write('\r')
      console.log(`\n${response.content}`)
      const tools = response.toolsUsed.length ? ` | 🔧 ${response.toolsUsed.join(', ')}` : ''
      console.log(`\n⏱ ${response.duration}ms${tools}\n`)
    } catch (err: any) {
      console.error(`\n⚠️  ${err.message}\n`)
    }

    rl.prompt()
  })

  rl.on('close', () => process.exit(0))
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
