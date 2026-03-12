import TelegramBot from 'node-telegram-bot-api'
import { Agent } from '../core/agent.js'
import { config } from '../core/config.js'
import { VaultManager } from '../core/vault.js'

export class TelegramChannel {
  private bot: TelegramBot
  private agent: Agent
  private vault: VaultManager
  private allowFrom: Set<string>
  private activeSessions = new Map<number, boolean>() // chatId → busy

  constructor(agent: Agent, vault: VaultManager) {
    if (!config.telegram.token) throw new Error('TELEGRAM_TOKEN not set in .env')
    this.bot = new TelegramBot(config.telegram.token, { polling: true })
    this.agent = agent
    this.vault = vault
    this.allowFrom = new Set(config.telegram.allowFrom)
  }

  start() {
    console.log('[telegram] bot started, polling...')

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id
      const userId = msg.from?.username || String(msg.from?.id)
      const text = msg.text?.trim() || ''

      // Auth check
      if (this.allowFrom.size > 0 && !this.allowFrom.has(userId) && !this.allowFrom.has(String(msg.from?.id))) {
        await this.bot.sendMessage(chatId, '⛔ Unauthorized.')
        console.log(`[telegram] unauthorized: ${userId}`)
        return
      }

      if (!text) return

      // Busy check
      if (this.activeSessions.get(chatId)) {
        await this.bot.sendMessage(chatId, '⏳ Przetwarzam poprzednie zapytanie...')
        return
      }

      // Commands
      if (text === '/start') {
        await this.bot.sendMessage(chatId, `🧠 *ObsidianAgent online*\n\nPisz normalnie — jestem gotowy.\n\n/status — stan agenta\n/clear — wyczyść historię\n/branch [nazwa] — zmień gałąź wiedzy`, { parse_mode: 'Markdown' })
        return
      }

      if (text === '/status') {
        const branch = config.vault.activeBranch
        await this.bot.sendMessage(chatId, `🧠 *Status: Operacyjny*\n📂 Branch: ${branch}\n🤖 Model: ${config.ollama.models.tools}`, { parse_mode: 'Markdown' })
        return
      }

      if (text === '/clear') {
        this.agent.clearHistory()
        await this.bot.sendMessage(chatId, '🗑️ Historia wyczyszczona.')
        return
      }

      if (text.startsWith('/branch ')) {
        const branch = text.slice(8).trim()
        config.vault.activeBranch = branch
        await this.bot.sendMessage(chatId, `📂 Branch zmieniony na: *${branch}*`, { parse_mode: 'Markdown' })
        return
      }

      // Chat
      this.activeSessions.set(chatId, true)
      await this.bot.sendChatAction(chatId, 'typing')

      // Typing indicator loop
      const typingInterval = setInterval(() => {
        this.bot.sendChatAction(chatId, 'typing').catch(() => {})
      }, 4000)

      try {
        const response = await this.agent.run(text)

        clearInterval(typingInterval)

        // Format response for Telegram
        let reply = response.content

        // Add tools used if any
        if (response.toolsUsed.length > 0) {
          reply += `\n\n🔧 _${response.toolsUsed.join(', ')} · ${response.duration}ms_`
        }

        // Telegram max message length is 4096
        if (reply.length > 4096) {
          const chunks = reply.match(/.{1,4096}/gs) || [reply]
          for (const chunk of chunks) {
            await this.bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' })
          }
        } else {
          await this.bot.sendMessage(chatId, reply, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          }).catch(async () => {
            // If markdown fails, send as plain text
            await this.bot.sendMessage(chatId, response.content)
          })
        }

      } catch (err: any) {
        clearInterval(typingInterval)
        await this.bot.sendMessage(chatId, `⚠️ Błąd: ${err.message}`)
        console.error('[telegram] error:', err.message)
      } finally {
        this.activeSessions.delete(chatId)
      }
    })

    this.bot.on('polling_error', (err) => {
      console.error('[telegram] polling error:', err.message)
    })
  }

  stop() {
    this.bot.stopPolling()
    console.log('[telegram] stopped')
  }
}
