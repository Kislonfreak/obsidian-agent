import express, { Request, Response, NextFunction } from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import crypto from 'crypto'
import { Agent } from '../core/agent.js'
import { config } from '../core/config.js'
import { VaultManager } from '../core/vault.js'
import { skillLoader } from '../core/skills.js'

// ── Session store ──────────────────────────────────────────────────
const sessions = new Map<string, { created: number }>()

function createSession(): string {
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, { created: Date.now() })
  return token
}

function isValidSession(token: string): boolean {
  const s = sessions.get(token)
  if (!s) return false
  // 24h expiry
  if (Date.now() - s.created > 86400000) { sessions.delete(token); return false }
  return true
}

function getToken(req: Request): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/session=([a-f0-9]{64})/)
  return match ? match[1] : null
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/login' || req.path === '/login-action') return next()
  const token = getToken(req)
  if (token && isValidSession(token)) return next()
  res.redirect('/login')
}

// ── Skins ──────────────────────────────────────────────────────────
const SKINS: Record<string, Record<string, string>> = {
  matrix: {
    '--bg': '#0d0d0d', '--bg2': '#0a1a0a', '--bg3': '#0f2010',
    '--border': '#00ff41', '--accent': '#00ff41', '--accent2': '#00cc33',
    '--text': '#00ff41', '--text2': '#88ff99', '--text3': '#004d14',
    '--msg-user': '#003300', '--msg-agent': '#0a1a0a',
    '--font': '"Courier New", monospace', '--glow': '0 0 10px #00ff41',
    '--name': 'Matrix'
  },
  cyberpunk: {
    '--bg': '#0a0a0f', '--bg2': '#12121f', '--bg3': '#1a1a2e',
    '--border': '#ff00ff', '--accent': '#ff00ff', '--accent2': '#00ffff',
    '--text': '#f0f0ff', '--text2': '#ff00ff', '--text3': '#333355',
    '--msg-user': '#1a003a', '--msg-agent': '#12121f',
    '--font': '"Rajdhani", "Segoe UI", sans-serif', '--glow': '0 0 15px #ff00ff',
    '--name': 'Cyberpunk'
  },
  midnight: {
    '--bg': '#0d1117', '--bg2': '#161b22', '--bg3': '#21262d',
    '--border': '#30363d', '--accent': '#58a6ff', '--accent2': '#3fb950',
    '--text': '#c9d1d9', '--text2': '#8b949e', '--text3': '#21262d',
    '--msg-user': '#1f6feb', '--msg-agent': '#161b22',
    '--font': '"Segoe UI", sans-serif', '--glow': 'none',
    '--name': 'Midnight'
  },
  dracula: {
    '--bg': '#282a36', '--bg2': '#1e1f29', '--bg3': '#44475a',
    '--border': '#6272a4', '--accent': '#bd93f9', '--accent2': '#50fa7b',
    '--text': '#f8f8f2', '--text2': '#6272a4', '--text3': '#44475a',
    '--msg-user': '#6272a4', '--msg-agent': '#1e1f29',
    '--font': '"Fira Code", monospace', '--glow': '0 0 8px #bd93f9',
    '--name': 'Dracula'
  },
  nord: {
    '--bg': '#2e3440', '--bg2': '#3b4252', '--bg3': '#434c5e',
    '--border': '#4c566a', '--accent': '#88c0d0', '--accent2': '#a3be8c',
    '--text': '#eceff4', '--text2': '#d8dee9', '--text3': '#4c566a',
    '--msg-user': '#5e81ac', '--msg-agent': '#3b4252',
    '--font': '"Segoe UI", sans-serif', '--glow': 'none',
    '--name': 'Nord'
  },
  solarized: {
    '--bg': '#002b36', '--bg2': '#073642', '--bg3': '#094d5a',
    '--border': '#268bd2', '--accent': '#268bd2', '--accent2': '#2aa198',
    '--text': '#839496', '--text2': '#657b83', '--text3': '#073642',
    '--msg-user': '#1a4a7a', '--msg-agent': '#073642',
    '--font': '"Courier New", monospace', '--glow': 'none',
    '--name': 'Solarized'
  },
  tokyo: {
    '--bg': '#1a1b26', '--bg2': '#16161e', '--bg3': '#24283b',
    '--border': '#7aa2f7', '--accent': '#7aa2f7', '--accent2': '#9ece6a',
    '--text': '#c0caf5', '--text2': '#565f89', '--text3': '#24283b',
    '--msg-user': '#3d59a1', '--msg-agent': '#16161e',
    '--font': '"Segoe UI", sans-serif', '--glow': '0 0 8px #7aa2f780',
    '--name': 'Tokyo Night'
  },
  blood: {
    '--bg': '#0d0000', '--bg2': '#1a0000', '--bg3': '#2d0000',
    '--border': '#cc0000', '--accent': '#ff2200', '--accent2': '#ff6600',
    '--text': '#ffcccc', '--text2': '#cc4444', '--text3': '#2d0000',
    '--msg-user': '#4d0000', '--msg-agent': '#1a0000',
    '--font': '"Courier New", monospace', '--glow': '0 0 12px #cc0000',
    '--name': 'Blood'
  },
  ocean: {
    '--bg': '#0a1628', '--bg2': '#0d1f3c', '--bg3': '#122947',
    '--border': '#1e6eb5', '--accent': '#00b4d8', '--accent2': '#90e0ef',
    '--text': '#caf0f8', '--text2': '#4a9bbe', '--text3': '#0d1f3c',
    '--msg-user': '#023e8a', '--msg-agent': '#0d1f3c',
    '--font': '"Segoe UI", sans-serif', '--glow': '0 0 10px #00b4d880',
    '--name': 'Deep Ocean'
  },
  ghost: {
    '--bg': '#1a1a2e', '--bg2': '#16213e', '--bg3': '#0f3460',
    '--border': '#e94560', '--accent': '#e94560', '--accent2': '#533483',
    '--text': '#eaeaea', '--text2': '#a0a0cc', '--text3': '#16213e',
    '--msg-user': '#533483', '--msg-agent': '#16213e',
    '--font': '"Segoe UI", sans-serif', '--glow': '0 0 12px #e9456080',
    '--name': 'Ghost'
  }
}

function skinCSS(skin: Record<string, string>): string {
  return Object.entries(skin)
    .filter(([k]) => k.startsWith('--'))
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
}

// ── HTML ───────────────────────────────────────────────────────────
function buildLoginHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ObsidianAgent — Login</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0d1117;color:#c9d1d9;font-family:"Segoe UI",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
  .box{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:40px;width:320px;text-align:center}
  .logo{font-size:2rem;margin-bottom:8px}
  h1{font-size:1.2rem;color:#58a6ff;margin-bottom:24px}
  input{width:100%;background:#21262d;border:1px solid #30363d;border-radius:8px;padding:12px;color:#c9d1d9;font-size:1.2rem;text-align:center;letter-spacing:8px;outline:none;margin-bottom:16px}
  input:focus{border-color:#58a6ff}
  button{width:100%;background:#238636;border:none;color:white;padding:12px;border-radius:8px;font-size:1rem;cursor:pointer}
  button:hover{background:#2ea043}
  .err{color:#f85149;font-size:0.85rem;margin-top:12px}
</style>
</head>
<body>
<div class="box">
  <div class="logo">🧠</div>
  <h1>ObsidianAgent</h1>
  <form method="POST" action="/login-action">
    <input type="password" name="pin" placeholder="PIN" maxlength="8" autofocus autocomplete="off">
    <button type="submit">Wejdź</button>
  </form>
</div>
<!-- Skill Editor Modal -->
<div id="skill-modal">
  <div id="skill-box">
    <div id="skill-modal-header">
      <span id="skill-modal-title">✏️ Skill Editor</span>
      <input id="skill-name-input" placeholder="nazwa-skilla" />
      <button class="skill-modal-btn save" onclick="saveSkill()">💾 Zapisz</button>
      <button class="skill-modal-btn del" onclick="deleteSkill()">🗑️ Usuń</button>
      <button class="skill-modal-btn" onclick="closeSkillModal()">✕</button>
    </div>
    <textarea id="skill-content" spellcheck="false"></textarea>
    <div id="skill-status"></div>
  </div>
</div>
</body>
</html>`
}

function buildMainHTML(wsPort: number): string {
  const skinOptions = Object.entries(SKINS)
    .map(([k, v]) => `<option value="${k}">${v['--name']}</option>`)
    .join('')

  const skinVarsAll = Object.entries(SKINS)
    .map(([k, v]) => `.skin-${k}{${skinCSS(v)}}`)
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ObsidianAgent</title>
<style>
:root{${skinCSS(SKINS.matrix)}}
${skinVarsAll}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:var(--font);height:100vh;display:flex;overflow:hidden}

/* Sidebar */
#sidebar{width:260px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;transition:width 0.2s;overflow:hidden}
#sidebar.collapsed{width:0}
#sidebar-header{padding:16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
#sidebar-header .logo{font-size:1.2rem}
#sidebar-title{font-size:0.9rem;color:var(--accent);font-weight:600;white-space:nowrap}
.sidebar-section{padding:12px 16px;border-bottom:1px solid var(--border)}
.sidebar-section h3{font-size:0.7rem;text-transform:uppercase;color:var(--text2);margin-bottom:8px;letter-spacing:1px}
.model-item{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.78rem}
.model-dot{width:7px;height:7px;border-radius:50%;background:var(--accent2);box-shadow:var(--glow);flex-shrink:0}
.model-dot.idle{background:var(--text2);box-shadow:none}
.model-name{color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.model-role{color:var(--text2);font-size:0.68rem;margin-left:auto}
.skill-item{display:flex;align-items:center;gap:6px;padding:3px 0;font-size:0.78rem;cursor:pointer}
.skill-dot{width:6px;height:6px;border-radius:50%;background:var(--accent2);flex-shrink:0}
.skill-name{color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.history-item{padding:6px 8px;border-radius:6px;font-size:0.75rem;color:var(--text2);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.history-item:hover{background:var(--bg3);color:var(--text)}
.sidebar-bottom{margin-top:auto;padding:12px 16px;border-top:1px solid var(--border)}
.logout-btn{width:100%;background:transparent;border:1px solid var(--border);color:var(--text2);padding:6px;border-radius:6px;font-size:0.75rem;cursor:pointer}
.logout-btn:hover{border-color:var(--accent);color:var(--text)}

/* Main */
#main{flex:1;display:flex;flex-direction:column;min-width:0}
#header{background:var(--bg2);border-bottom:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}
#toggle-sidebar{background:none;border:none;color:var(--text2);font-size:1.2rem;cursor:pointer;padding:2px 6px}
#toggle-sidebar:hover{color:var(--text)}
#header-title{font-size:0.95rem;color:var(--accent);font-weight:600}
#status{font-size:0.72rem;color:var(--text2);margin-right:auto}
.header-controls{display:flex;align-items:center;gap:8px;margin-left:auto}
#skin-select{background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:4px 8px;font-size:0.75rem;cursor:pointer}
#branch-select{background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:4px 8px;font-size:0.75rem}

/* Messages */
#messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}
#messages::-webkit-scrollbar{width:4px}
#messages::-webkit-scrollbar-track{background:transparent}
#messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.msg{max-width:78%;display:flex;flex-direction:column}
.msg.user{align-self:flex-end;align-items:flex-end}
.msg.agent{align-self:flex-start;align-items:flex-start}
.bubble{padding:11px 15px;border-radius:14px;line-height:1.65;white-space:pre-wrap;word-break:break-word;font-size:0.88rem;box-shadow:var(--glow)}
.user .bubble{background:var(--msg-user);color:var(--text);border:1px solid var(--border);border-radius:14px 14px 2px 14px}
.agent .bubble{background:var(--msg-agent);border:1px solid var(--border);border-radius:14px 14px 14px 2px}
.meta{font-size:0.68rem;color:var(--text2);margin-top:3px;padding:0 4px}
.tools-tag{color:var(--accent2);font-size:0.68rem}

/* Upload preview */
.upload-preview{display:flex;gap:6px;flex-wrap:wrap;padding:0 4px;margin-bottom:4px}
.preview-item{position:relative;display:inline-block}
.preview-img{width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--border)}
.preview-file{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:0.7rem;color:var(--text2)}
.preview-remove{position:absolute;top:-4px;right:-4px;background:var(--bg);border:1px solid var(--border);border-radius:50%;width:16px;height:16px;font-size:0.6rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text2)}

/* Input area */
#input-area{background:var(--bg2);border-top:1px solid var(--border);padding:12px 16px;flex-shrink:0}
#input-row{display:flex;gap:8px;align-items:flex-end}
#upload-btn{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--text2);cursor:pointer;font-size:1rem;flex-shrink:0;height:40px}
#upload-btn:hover{border-color:var(--accent);color:var(--text)}
#file-input{display:none}
#input{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 13px;color:var(--text);font-size:0.88rem;resize:none;outline:none;font-family:var(--font);max-height:160px}
#input:focus{border-color:var(--accent)}
#send{background:var(--accent);border:none;color:#000;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:0.88rem;font-weight:600;flex-shrink:0;height:40px;box-shadow:var(--glow)}
#send:hover{opacity:0.9}
#send:disabled{background:var(--bg3);color:var(--text2);box-shadow:none;cursor:not-allowed}

/* Skill editor modal */
#skill-modal{display:none;position:fixed;inset:0;background:#000a;z-index:100;align-items:center;justify-content:center}
#skill-modal.open{display:flex}
#skill-box{background:var(--bg2);border:1px solid var(--border);border-radius:12px;width:min(680px,95vw);max-height:85vh;display:flex;flex-direction:column;overflow:hidden}
#skill-modal-header{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
#skill-modal-title{font-size:0.95rem;color:var(--accent);font-weight:600;flex:1}
#skill-name-input{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 10px;color:var(--text);font-size:0.85rem;width:200px}
.skill-modal-btn{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 14px;color:var(--text2);font-size:0.8rem;cursor:pointer}
.skill-modal-btn:hover{border-color:var(--accent);color:var(--text)}
.skill-modal-btn.save{background:var(--accent);color:#000;border-color:var(--accent)}
.skill-modal-btn.save:hover{opacity:0.9}
.skill-modal-btn.del{border-color:#cc0000;color:#ff4444}
.skill-modal-btn.del:hover{background:#2d0000}
#skill-content{flex:1;background:var(--bg3);border:none;color:var(--text);font-family:"Fira Code","Courier New",monospace;font-size:0.8rem;padding:14px;resize:none;outline:none;overflow-y:auto;min-height:300px;line-height:1.6}
#skill-status{padding:8px 18px;font-size:0.75rem;color:var(--text2);border-top:1px solid var(--border)}
/* Thinking */
.thinking-bubble{display:flex;gap:5px;padding:12px 16px;align-items:center}
.thinking-bubble span{width:7px;height:7px;background:var(--accent);border-radius:50%;animation:pulse 1s infinite;box-shadow:var(--glow)}
.thinking-bubble span:nth-child(2){animation-delay:0.2s}
.thinking-bubble span:nth-child(3){animation-delay:0.4s}
@keyframes pulse{0%,80%,100%{transform:scale(0);opacity:0.3}40%{transform:scale(1);opacity:1}}
</style>
</head>
<body class="skin-matrix">

<!-- Sidebar -->
<div id="sidebar">
  <div id="sidebar-header">
    <span class="logo">🧠</span>
    <span id="sidebar-title">ObsidianAgent</span>
  </div>

  <div class="sidebar-section">
    <h3>Models</h3>
    <div class="model-item"><span class="model-dot" id="dot-think"></span><span class="model-name" id="name-think">-</span><span class="model-role">think</span></div>
    <div class="model-item"><span class="model-dot" id="dot-tools"></span><span class="model-name" id="name-tools">-</span><span class="model-role">tools</span></div>
    <div class="model-item"><span class="model-dot" id="dot-vision"></span><span class="model-name" id="name-vision">-</span><span class="model-role">vision</span></div>
  </div>

  <div class="sidebar-section">
    <h3>Skills</h3>
    <div id="skills-list"></div>
  </div>

  <div class="sidebar-section" style="flex:1;overflow-y:auto">
    <h3>History</h3>
    <div id="history-list"></div>
  </div>

  <div class="sidebar-bottom">
    <button class="logout-btn" onclick="location.href='/logout'">⏻ Logout</button>
  </div>
</div>

<!-- Main -->
<div id="main">
  <div id="header">
    <button id="toggle-sidebar" title="Toggle sidebar">☰</button>
    <span id="header-title">🧠 ObsidianAgent</span>
    <span id="status">connecting...</span>
    <div class="header-controls">
      <select id="branch-select" title="Knowledge branch">
        <option value="main">📂 main</option>
        <option value="coding">📂 coding</option>
        <option value="research">📂 research</option>
      </select>
      <select id="skin-select" title="Theme">${skinOptions}</select>
    </div>
  </div>

  <div id="messages"></div>

  <div id="input-area">
    <div id="preview-area" class="upload-preview"></div>
    <div id="input-row">
      <button id="upload-btn" title="Upload image or document">📎</button>
      <input type="file" id="file-input" accept="image/*,.pdf,.txt,.md,.csv,.js,.ts,.py" multiple>
      <textarea id="input" placeholder="Wpisz wiadomość... (Enter = wyślij, Shift+Enter = nowa linia)" rows="1"></textarea>
      <button id="send">Wyślij</button>
    </div>
  </div>
</div>

<script>
const ws = new WebSocket('ws://localhost:${wsPort}')
const messagesEl = document.getElementById('messages')
const inputEl = document.getElementById('input')
const sendBtn = document.getElementById('send')
const statusEl = document.getElementById('status')
const skinSelect = document.getElementById('skin-select')
const branchSelect = document.getElementById('branch-select')
const sidebar = document.getElementById('sidebar')
const toggleBtn = document.getElementById('toggle-sidebar')
const fileInput = document.getElementById('file-input')
const uploadBtn = document.getElementById('upload-btn')
const previewArea = document.getElementById('preview-area')
const historyList = document.getElementById('history-list')
const skillsList = document.getElementById('skills-list')

let thinkingEl = null
let pendingFiles = [] // {type, data, name}
let sessionHistory = []

// ── Skin ────────────────────────────────────────────────────────────
const savedSkin = localStorage.getItem('skin') || 'matrix'
document.body.className = 'skin-' + savedSkin
skinSelect.value = savedSkin

skinSelect.onchange = () => {
  document.body.className = 'skin-' + skinSelect.value
  localStorage.setItem('skin', skinSelect.value)
}

// ── Sidebar toggle ──────────────────────────────────────────────────
toggleBtn.onclick = () => sidebar.classList.toggle('collapsed')

// ── WS ──────────────────────────────────────────────────────────────
ws.onopen = () => {
  statusEl.textContent = 'online'
  ws.send(JSON.stringify({ type: 'init' }))
}
ws.onclose = () => { statusEl.textContent = 'disconnected' }

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)

  if (msg.type === 'init') {
    document.getElementById('name-think').textContent = msg.models.thinking
    document.getElementById('name-tools').textContent = msg.models.tools
    document.getElementById('name-vision').textContent = msg.models.vision
    if (msg.skills) renderSkills(msg.skills)
    return
  }

  if (msg.type === 'response') {
    hideThinking()
    const tools = msg.toolsUsed?.length ? ' 🔧 ' + msg.toolsUsed.join(', ') : ''
    const meta = msg.model + ' · ' + msg.duration + 'ms' + tools
    addMessage('agent', msg.content, meta)
    addToHistory(msg.userInput || '')
    sendBtn.disabled = false
    inputEl.focus()

    // Update model dots
    document.querySelectorAll('.model-dot').forEach(d => d.classList.add('idle'))
    const roleMap = { thinking: 'dot-think', tools: 'dot-tools', vision: 'dot-vision' }
    const dot = document.getElementById(roleMap[msg.role] || 'dot-tools')
    if (dot) dot.classList.remove('idle')
  }

  if (msg.type === 'error') {
    hideThinking()
    addMessage('agent', '⚠️ ' + msg.error)
    sendBtn.disabled = false
  }

  if (msg.type === 'skills') {
    renderSkills(msg.skills)
  }
}

// ── Messages ─────────────────────────────────────────────────────────
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
  messagesEl.appendChild(div)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

function showThinking() {
  thinkingEl = document.createElement('div')
  thinkingEl.className = 'msg agent'
  thinkingEl.innerHTML = '<div class="bubble thinking-bubble"><span></span><span></span><span></span></div>'
  messagesEl.appendChild(thinkingEl)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

function hideThinking() {
  if (thinkingEl) { thinkingEl.remove(); thinkingEl = null }
}

// ── History ──────────────────────────────────────────────────────────
function addToHistory(text) {
  if (!text) return
  const short = text.slice(0, 40) + (text.length > 40 ? '…' : '')
  sessionHistory.unshift(short)
  if (sessionHistory.length > 20) sessionHistory.pop()
  renderHistory()
}

function renderHistory() {
  historyList.innerHTML = sessionHistory.map((h, i) =>
    '<div class="history-item" onclick="recallHistory(' + i + ')" title="' + h + '">' + h + '</div>'
  ).join('')
}

window.recallHistory = (i) => {
  inputEl.value = sessionHistory[i]
  inputEl.focus()
}

// ── Skills ───────────────────────────────────────────────────────────
function renderSkills(skills) {
  const newBtn = '<div class="skill-item" onclick="openNewSkill()" style="opacity:0.6;margin-bottom:4px"><span style="font-size:0.7rem">＋</span><span class="skill-name">Nowy skill</span></div>'
  skillsList.innerHTML = newBtn + skills.map(s =>
    '<div class="skill-item" title="' + s.description + '" onclick="openSkill(\'' + s.name + '\')">' +
    '<span class="skill-dot"></span><span class="skill-name">' + s.name + '</span></div>'
  ).join('')
}

// ── File upload ──────────────────────────────────────────────────────
uploadBtn.onclick = () => fileInput.click()

fileInput.onchange = async () => {
  for (const file of fileInput.files) {
    const data = await readFile(file)
    pendingFiles.push({ name: file.name, type: file.type, data })
    renderPreview()
  }
  fileInput.value = ''
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    if (file.type.startsWith('image/')) {
      reader.onload = e => resolve({ kind: 'image', base64: e.target.result.split(',')[1], mime: file.type })
    } else {
      reader.onload = e => resolve({ kind: 'text', content: e.target.result })
    }
    file.type.startsWith('image/') ? reader.readAsDataURL(file) : reader.readAsText(file)
  })
}

function renderPreview() {
  previewArea.innerHTML = pendingFiles.map((f, i) => {
    if (f.data.kind === 'image') {
      return '<div class="preview-item"><img class="preview-img" src="data:' + f.type + ';base64,' + f.data.base64 + '"><button class="preview-remove" onclick="removeFile(' + i + ')">✕</button></div>'
    }
    return '<div class="preview-item"><div class="preview-file">📄 ' + f.name + '</div><button class="preview-remove" onclick="removeFile(' + i + ')">✕</button></div>'
  }).join('')
}

window.removeFile = (i) => {
  pendingFiles.splice(i, 1)
  renderPreview()
}

// ── Send ─────────────────────────────────────────────────────────────
function sendMessage() {
  const text = inputEl.value.trim()
  if ((!text && pendingFiles.length === 0) || sendBtn.disabled) return

  const displayText = text + (pendingFiles.length ? ' 📎 ' + pendingFiles.map(f => f.name).join(', ') : '')
  addMessage('user', displayText)

  ws.send(JSON.stringify({
    type: 'chat',
    content: text,
    files: pendingFiles.map(f => ({ name: f.name, data: f.data })),
    branch: branchSelect.value,
    userInput: text
  }))

  inputEl.value = ''
  pendingFiles = []
  previewArea.innerHTML = ''
  sendBtn.disabled = true
  showThinking()
}

sendBtn.onclick = sendMessage
inputEl.onkeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
}

// Auto-resize textarea
inputEl.oninput = () => {
  inputEl.style.height = 'auto'
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px'
}

// Branch switch
branchSelect.onchange = () => {
  ws.send(JSON.stringify({ type: 'branch', branch: branchSelect.value }))
}

// ── Skill Editor ─────────────────────────────────────────────────
let currentSkillName = null

window.openSkill = async (name) => {
  currentSkillName = name
  document.getElementById('skill-modal-title').textContent = '✏️ ' + name
  document.getElementById('skill-name-input').value = name
  document.getElementById('skill-status').textContent = 'Ładowanie...'
  document.getElementById('skill-modal').classList.add('open')

  try {
    const res = await fetch('/api/skill/' + name)
    const data = await res.json()
    document.getElementById('skill-content').value = data.content || ''
    document.getElementById('skill-status').textContent = 'Plik: vault/skills/' + name + '.md'
  } catch {
    document.getElementById('skill-status').textContent = '⚠️ Błąd ładowania'
  }
}

window.openNewSkill = () => {
  currentSkillName = null
  document.getElementById('skill-modal-title').textContent = '✨ Nowy Skill'
  document.getElementById('skill-name-input').value = ''
  document.getElementById('skill-content').value = `---
name: nowy-skill
description: Opis co robi skill
trigger: słowo1, słowo2, słowo3
---

## Nowy Skill

Instrukcje dla agenta...`
  document.getElementById('skill-status').textContent = 'Nowy skill — podaj nazwę powyżej'
  document.getElementById('skill-modal').classList.add('open')
}

window.saveSkill = async () => {
  const name = document.getElementById('skill-name-input').value.trim()
  const content = document.getElementById('skill-content').value
  if (!name) { document.getElementById('skill-status').textContent = '⚠️ Podaj nazwę'; return }

  const url = currentSkillName ? '/api/skill/' + currentSkillName : '/api/skill'
  const body = currentSkillName ? { content } : { name, content }

  try {
    const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.ok) {
      currentSkillName = data.name || name
      document.getElementById('skill-status').textContent = '✅ Zapisano — vault/skills/' + currentSkillName + '.md'
      ws.send(JSON.stringify({ type: 'init' })) // refresh sidebar
    }
  } catch {
    document.getElementById('skill-status').textContent = '⚠️ Błąd zapisu'
  }
}

window.deleteSkill = async () => {
  if (!currentSkillName) return
  if (!confirm('Usunąć skill "' + currentSkillName + '"?')) return
  try {
    await fetch('/api/skill/' + currentSkillName, { method: 'DELETE' })
    closeSkillModal()
    ws.send(JSON.stringify({ type: 'init' }))
  } catch {
    document.getElementById('skill-status').textContent = '⚠️ Błąd usuwania'
  }
}

window.closeSkillModal = () => {
  document.getElementById('skill-modal').classList.remove('open')
}

// Close on backdrop click
document.getElementById('skill-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('skill-modal')) closeSkillModal()
})

// Ctrl+S to save
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's' && document.getElementById('skill-modal').classList.contains('open')) {
    e.preventDefault()
    saveSkill()
  }
})

// Drag & drop
document.body.ondragover = e => e.preventDefault()
document.body.ondrop = async (e) => {
  e.preventDefault()
  for (const file of e.dataTransfer.files) {
    const data = await readFile(file)
    pendingFiles.push({ name: file.name, type: file.type, data })
    renderPreview()
  }
}
</script>
<!-- Skill Editor Modal -->
<div id="skill-modal">
  <div id="skill-box">
    <div id="skill-modal-header">
      <span id="skill-modal-title">✏️ Skill Editor</span>
      <input id="skill-name-input" placeholder="nazwa-skilla" />
      <button class="skill-modal-btn save" onclick="saveSkill()">💾 Zapisz</button>
      <button class="skill-modal-btn del" onclick="deleteSkill()">🗑️ Usuń</button>
      <button class="skill-modal-btn" onclick="closeSkillModal()">✕</button>
    </div>
    <textarea id="skill-content" spellcheck="false"></textarea>
    <div id="skill-status"></div>
  </div>
</div>
</body>
</html>`
}

// ── Server ─────────────────────────────────────────────────────────
export function startServer(agent: Agent, vault: VaultManager) {
  const app = express()
  app.use(express.urlencoded({ extended: true }))

  // Login page
  app.get('/login', (_req, res) => res.send(buildLoginHTML()))

  // Login action
  app.post('/login-action', (req, res) => {
    const pin = (req.body.pin || '').trim()
    // Read PIN dynamically — onboarding may have written it after startup
    const currentPin = process.env.UI_PIN || config.server.pin
    if (pin === currentPin) {
      const token = createSession()
      res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=86400`)
      res.redirect('/')
    } else {
      res.send(buildLoginHTML().replace('</form>', '<p class="err">Wrong PIN</p></form>'))
    }
  })

  // Logout
  app.get('/logout', (req, res) => {
    const token = getToken(req)
    if (token) sessions.delete(token)
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0')
    res.redirect('/login')
  })

  // Auth middleware
  app.use(authMiddleware)
  app.use(express.json())

  // ── Skill API ────────────────────────────────────────────────────
  // GET /api/skills — list all skills
  app.get('/api/skills', async (_req, res) => {
    const skills = skillLoader.getAllSkills()
    res.json(skills.map(s => ({ name: s.name, description: s.description, trigger: s.trigger })))
  })

  // GET /api/skill/:name — get skill content
  app.get('/api/skill/:name', async (req, res) => {
    try {
      const content = await vault.read(`skills/${req.params.name}.md`)
      res.json({ name: req.params.name, content })
    } catch {
      res.status(404).json({ error: 'Skill not found' })
    }
  })

  // POST /api/skill/:name — save skill content
  app.post('/api/skill/:name', async (req, res) => {
    try {
      const { content } = req.body
      if (!content) return res.status(400).json({ error: 'No content' })
      await vault.write(`skills/${req.params.name}.md`, content)
      await skillLoader.loadAll()
      res.json({ ok: true })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // DELETE /api/skill/:name — delete skill
  app.delete('/api/skill/:name', async (req, res) => {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const skillPath = path.join(config.vault.path, 'skills', req.params.name + '.md')
      await fs.unlink(skillPath)
      await skillLoader.loadAll()
      res.json({ ok: true })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /api/skill — create new skill
  app.post('/api/skill', async (req, res) => {
    try {
      const { name, content } = req.body
      if (!name || !content) return res.status(400).json({ error: 'name and content required' })
      const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      await vault.write(`skills/${safeName}.md`, content)
      await skillLoader.loadAll()
      res.json({ ok: true, name: safeName })
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  })

  // Main UI
  app.get('/', (_req, res) => res.send(buildMainHTML(config.server.wsPort)))

  const httpServer = createServer(app)
  httpServer.listen(config.server.uiPort, () => {
    console.log(`[ui] http://127.0.0.1:${config.server.uiPort}`)
  })

  // WebSocket — check session token via query param
  const wss = new WebSocketServer({ port: config.server.wsPort })

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        if (msg.type === 'init') {
          ws.send(JSON.stringify({
            type: 'init',
            models: config.ollama.models,
            skills: skillLoader.getAllSkills().map(s => ({ name: s.name, description: s.description }))
          }))
          return
        }

        if (msg.type === 'branch') {
          config.vault.activeBranch = msg.branch
          return
        }

        if (msg.type === 'chat') {
          if (msg.branch) config.vault.activeBranch = msg.branch

          // Build input with file context
          let input = msg.content || ''
          const attachments: any[] = []

          if (msg.files?.length) {
            for (const f of msg.files) {
              if (f.data.kind === 'image') {
                attachments.push({ type: 'image', base64: f.data.base64, mime: f.data.mime })
              } else if (f.data.kind === 'text') {
                input += `\n\n[Attached file: ${f.name}]\n\`\`\`\n${f.data.content.slice(0, 8000)}\n\`\`\``
              }
            }
          }

          const response = await agent.run(input, undefined, attachments)

          ws.send(JSON.stringify({
            type: 'response',
            content: response.content,
            toolsUsed: response.toolsUsed,
            model: config.ollama.models[response.model as keyof typeof config.ollama.models],
            role: response.model,
            duration: response.duration,
            userInput: msg.userInput || msg.content
          }))

          // Refresh skills list
          ws.send(JSON.stringify({
            type: 'skills',
            skills: skillLoader.getAllSkills().map(s => ({ name: s.name, description: s.description }))
          }))
        }

      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', error: err.message }))
      }
    })
  })

  console.log(`[ws] ws://127.0.0.1:${config.server.wsPort}`)
  return { httpServer, wss }
}
