import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { Agent } from '../core/agent.js'
import { config } from '../core/config.js'

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ObsidianAgent</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d1117; color: #c9d1d9; font-family: 'Segoe UI', monospace; height: 100vh; display: flex; flex-direction: column; }
  #header { background: #161b22; border-bottom: 1px solid #30363d; padding: 12px 20px; display: flex; align-items: center; gap: 12px; }
  #header h1 { font-size: 1rem; color: #58a6ff; }
  #status { font-size: 0.75rem; color: #8b949e; margin-left: auto; }
  #model-badge { background: #21262d; border: 1px solid #30363d; border-radius: 4px; padding: 2px 8px; font-size: 0.7rem; color: #3fb950; }
  #messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .msg { max-width: 80%; }
  .msg.user { align-self: flex-end; }
  .msg.agent { align-self: flex-start; }
  .bubble { padding: 12px 16px; border-radius: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .user .bubble { background: #1f6feb; color: white; border-radius: 12px 12px 2px 12px; }
  .agent .bubble { background: #161b22; border: 1px solid #30363d; border-radius: 12px 12px 12px 2px; }
  .meta { font-size: 0.7rem; color: #8b949e; margin-top: 4px; }
  .tools-used { font-size: 0.7rem; color: #3fb950; margin-top: 2px; }
  #input-area { background: #161b22; border-top: 1px solid #30363d; padding: 16px 20px; display: flex; gap: 10px; }
  #input { flex: 1; background: #21262d; border: 1px solid #30363d; border-radius: 8px; padding: 10px 14px; color: #c9d1d9; font-size: 0.9rem; resize: none; outline: none; font-family: inherit; }
  #input:focus { border-color: #58a6ff; }
  #send { background: #238636; border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
  #send:hover { background: #2ea043; }
  #send:disabled { background: #21262d; color: #8b949e; cursor: not-allowed; }
  .thinking { display: flex; gap: 4px; padding: 12px 16px; }
  .thinking span { width: 6px; height: 6px; background: #58a6ff; border-radius: 50%; animation: bounce 1s infinite; }
  .thinking span:nth-child(2) { animation-delay: 0.15s; }
  .thinking span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
  #branch-selector { background: #21262d; border: 1px solid #30363d; border-radius: 4px; padding: 4px 8px; color: #c9d1d9; font-size: 0.75rem; }
</style>
</head>
<body>
<div id="header">
  <span>🧠</span>
  <h1>ObsidianAgent</h1>
  <select id="branch-selector" title="Knowledge branch">
    <option value="main">branch: main</option>
    <option value="coding">branch: coding</option>
    <option value="research">branch: research</option>
  </select>
  <span id="model-badge">qwen3:8b</span>
  <span id="status">connecting...</span>
</div>
<div id="messages"></div>
<div id="input-area">
  <textarea id="input" placeholder="Message..." rows="2"></textarea>
  <button id="send">Send</button>
</div>
<script>
  const ws = new WebSocket('ws://localhost:${config.server.wsPort}')
  const messages = document.getElementById('messages')
  const input = document.getElementById('input')
  const send = document.getElementById('send')
  const status = document.getElementById('status')
  const modelBadge = document.getElementById('model-badge')
  const branchSelector = document.getElementById('branch-selector')
  let thinkingEl = null

  ws.onopen = () => { status.textContent = 'connected' }
  ws.onclose = () => { status.textContent = 'disconnected' }

  function addMessage(role, content, meta) {
    const div = document.createElement('div')
    div.className = 'msg ' + role
    const bubble = document.createElement('div')
    bubble.className = 'bubble'
    bubble.textContent = content
    div.appendChild(bubble)
    if (meta) {
      const m = document.createElement('div')
      m.className = 'meta'
      m.textContent = meta
      div.appendChild(m)
    }
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
    return div
  }

  function showThinking() {
    thinkingEl = document.createElement('div')
    thinkingEl.className = 'msg agent'
    thinkingEl.innerHTML = '<div class="bubble thinking"><span></span><span></span><span></span></div>'
    messages.appendChild(thinkingEl)
    messages.scrollTop = messages.scrollHeight
  }

  function hideThinking() {
    if (thinkingEl) { thinkingEl.remove(); thinkingEl = null }
  }

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.type === 'response') {
      hideThinking()
      const tools = msg.toolsUsed?.length ? '🔧 ' + msg.toolsUsed.join(', ') : ''
      const meta = \`\${msg.model} · \${msg.duration}ms \${tools}\`
      addMessage('agent', msg.content, meta)
      if (msg.model) modelBadge.textContent = msg.model
      send.disabled = false
      input.focus()
    } else if (msg.type === 'error') {
      hideThinking()
      addMessage('agent', '⚠️ ' + msg.error)
      send.disabled = false
    }
  }

  function sendMessage() {
    const text = input.value.trim()
    if (!text || send.disabled) return
    addMessage('user', text)
    ws.send(JSON.stringify({ type: 'chat', content: text, branch: branchSelector.value }))
    input.value = ''
    send.disabled = true
    showThinking()
  }

  send.onclick = sendMessage
  input.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  branchSelector.onchange = () => {
    ws.send(JSON.stringify({ type: 'branch', branch: branchSelector.value }))
  }
</script>
</body>
</html>`

export function startServer(agent: Agent) {
  const app = express()
  app.get('/', (_, res) => res.send(HTML))

  const httpServer = app.listen(config.server.uiPort, () => {
    console.log(`[ui] http://127.0.0.1:${config.server.uiPort}`)
  })

  const wss = new WebSocketServer({ port: config.server.wsPort })

  wss.on('connection', (ws: WebSocket) => {
    console.log('[ws] client connected')

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        if (msg.type === 'branch') {
          config.vault.activeBranch = msg.branch
          console.log(`[agent] branch → ${msg.branch}`)
          return
        }

        if (msg.type === 'chat') {
          if (msg.branch) config.vault.activeBranch = msg.branch

          const response = await agent.run(msg.content)

          ws.send(JSON.stringify({
            type: 'response',
            content: response.content,
            toolsUsed: response.toolsUsed,
            model: config.ollama.models[response.model as keyof typeof config.ollama.models],
            duration: response.duration
          }))
        }
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', error: err.message }))
      }
    })

    ws.on('close', () => console.log('[ws] client disconnected'))
  })

  console.log(`[ws] ws://127.0.0.1:${config.server.wsPort}`)
  return { httpServer, wss }
}
