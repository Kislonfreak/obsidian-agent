# ObsidianAgent v0.2.1 — Vision Fix

## Zmiany względem v0.2.0

### 🐛 Bugfix
- **Naprawiono obsługę zdjęć** — agent wysyłał obrazy w formacie OpenAI (`image_url` zagnieżdżony w `content[]`), Ollama tego nie obsługuje. Zmieniono na natywny format Ollama: `images: ["base64"]` jako osobne pole wiadomości. Model `qwen2.5vl:3b` teraz poprawnie analizuje zdjęcia i dokumenty.

---

# ObsidianAgent v0.2.0 — UI Rewrite

## Zmiany względem v0.1.0

### ✨ Nowe funkcje

**Autoryzacja**
- Logowanie do Web UI przez PIN (4-8 cyfr)
- Session cookie z 24h ważnością
- Bez PIN-u brak dostępu do UI
- PIN ustawiany automatycznie podczas onboardingu
- SESSION_SECRET generowany losowo (`crypto.randomBytes`)

**10 motywów (skórek)**
- Matrix — zielony terminal
- Cyberpunk — magenta + cyan neon
- Midnight — GitHub dark
- Dracula — fiolet + zieleń
- Nord — zimny błękit
- Solarized — deep teal
- Tokyo Night — niebieski akcent
- Blood — czerwony mroczny
- Deep Ocean — morski błękit
- Ghost — różowo-fioletowy
- Wybór zapisywany w localStorage (pamiętany po odświeżeniu)

**Lewy sidebar**
- Status 3 modeli z kolorowymi kropkami (aktywny/idle)
- Lista załadowanych skilli z opisami
- Historia sesji — ostatnie 20 wiadomości, klik wkleja do inputa
- Przycisk Logout

**Upload plików**
- Przycisk 📎 + drag & drop na całą stronę
- Obrazy → miniatura preview → wysyłane do `qwen2.5vl:3b`
- Dokumenty (`.txt`, `.md`, `.py`, `.ts`, `.pdf`) → tekst wklejany do kontekstu
- Możliwość usunięcia pliku przed wysłaniem

### 🔧 Ulepszenia
- Auto-resize textarea (rośnie wraz z treścią)
- Animowane kropki "thinking" podczas oczekiwania na odpowiedź
- Meta pod każdą wiadomością: model + czas odpowiedzi + użyte narzędzia
- Branch switcher w headerze

### 🛠️ Fixes
- Usunięto `better-sqlite3` z `package.json` (wymaga Windows SDK, nieużywany)
- Usunięto `duck-duck-scrape` (zastąpiony wcześniej fetch API)
- PIN czytany dynamicznie z `process.env` — działa od razu po onboardingu bez restartu

---

# ObsidianAgent v0.1.0 — Initial Release

Pierwsza publiczna wersja. Szczegóły: [RELEASE_NOTES_v0.1.0.md]

## Stack
- Node.js + TypeScript
- Ollama (local LLM)
- Express + WebSocket
- Chokidar (vault file watcher)

## Modele
- `qwen3:8b` — thinking
- `qwen3.5:4b` — tools (fast)
- `qwen2.5vl:3b` — vision

## Wymagania
- Node.js ≥ 20
- Ollama z modelami: `qwen3:8b`, `qwen3.5:4b`, `qwen2.5vl:3b`
- Windows / Linux / macOS
