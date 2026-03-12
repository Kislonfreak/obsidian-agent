# ObsidianAgent v0.1.0 — Initial Release

## 🧠 What is ObsidianAgent?

Ultra-fast local AI agent with Obsidian vault as its brain. Fully local, no cloud required.

---

## ✨ Features

### Multi-model routing
- `qwen3.5:4b` — fast model for simple queries and tool calls (~2-4s)
- `qwen3:8b` — thinking model for complex reasoning (~5-10s)
- `qwen2.5vl:3b` — vision model for image analysis
- Automatic routing based on query type — no manual switching

### Obsidian Vault as brain
- Agent reads and writes directly to `vault/` folder
- Edit `SOUL.md`, `USER.md`, `MEMORY.md`, `PROJECTS.md` in Obsidian
- File watcher — changes in vault are picked up instantly (no restart needed)
- System prompt cache (30s TTL) — vault loads once, not on every message

### System umiejętności
- Umiejętności to `. .md` pliki w `sklepienie/umiejętności/`
- Automatyczne ładowanie podczas uruchamiania, automatyczne wykrywanie poprzez dopasowanie słów kluczowych
- W zestawie 4 wbudowane umejętności:
  - `twórca umiejątności` — agent tworzy nowe umejętności z rozmowy
  - `code-runner` — pisze i uruchamia kod lokalnie
  - `pomocnik git` — operacje git z kontrolami bezpieczeństwa
  - `badacz stron internetowych` — głębokie badania internetowe ze strukturalnymi wynikami
- Nowe umejętności zaisane w skarbcu, widoczne i edytowalne w Obsydianie

### Wywoływanie narzów
- `muszla` — uruchamiaj polecenia systemowe (PowerShell z systemowym systemem Windows)
- `odczyt pliku` / `zapis_pliku` — odczytaj/zapisz swolny plik na dysku
- `vault_read` / `vault_write` — odczyt/zapis plików Obsydian Vault
- `wyszukiwanie_sieciowe` — Wyszukiwanie DuckDuckGo (nie jest potrzebny klucz API)
- `zapis_pamićci` — zapasz fakty w MEMORY.md
- `przelićnik_gałęzi` — przełęcz aktywnić gałęź wiedzy
- `umejętność_utwórz` / `lista_umiejątności` / `umejętność_usuń` — zarządzaj umejętnościami

### Gałęzie Wiedzy
- Zorganizaj wiedzę w `sklepienie/wiedza/` podkatalogi
- Przełęcz gałąź: `/kodowanie gałęzi` lub za pośrednictwem rozwijanego interfeju użytkownika sieci Web
- Agent ładuje zawartość gałęzi jako kontekst RAG

### Przeszkadza sieciowa
- Interfejs czatu z ciemnym motyw w `http://127.0.0.1:18789`
- Komunikacja WebSocket w czasie rzeczywistym
- Rozwiana lista praćnikowa gałęzi
- Pokazuje użyty model i czas reakcji na wiadomość

### Bot Telegramu
- Pełny dośćp agent przez Telegram
- Wskaźnik wpisywania podczas przetwarzania agenta
- Polecenia: `/start` `/status` `/jasne` `/oddział`
- Lista dozwołonych nazw według nazwy użytkownika dla bezpieczeńskiego

### Onboarding
- Automatyka uruchamianie pra pierwszym uruchomieniu
- Agent przeprowadza wywiad z użytkownikiem (8 pytań)
- Wypłuc `UŻYTKOWNIK.md`, `PROJEKT.md`, `PAMIĆ.md` automatyczny
- Uruchom ponownie w downym momencie za pomocć `/konfiguracja`

---

## 🛠️ Stos

- **Czas wykonania:** Node.js + TypeScript
- **LLM:** Ollama (lokalny)
- **Test próbny:** qwen3:8b, qwen3.5:4b, qwen2.5vl:3b
- **Sieć:** Express + WebSocket
- **Synchronizacja skarbca:** obserwator plików chokidar
- **Telegram:** node-telegram-bot-api

---

## 📋 Wymagania

- Node.js ≥ 20
- Ollama działa lokalnie
- Próba: `qwen3:8b`, `qwen3.5:4b`, `qwen2.5vl:3b`
- Windows / Linux / macOS

---

## 🔜 Już wkrótce

- Rozszerzenie Chrom (kontrola przeglądarki)
- Zadania Heartbeat / Cron
- Wejście głoskie przed Szeptem
- Wieloagentowy (koordynator + specjaliści)
- Routera modelu Dostrojony (faza 2)

---

## ⚠️ Problem Znane'a

- `qwen3:1,7b` niedostępne jeszcz na Ollama — użyj `qwen3.5:4b` jak model narzędzi
- Ograniczona szybkość wyszukiwania w sieci przy intensiwnym użytkowianu (w tym zapasowy kod HTML DuckDuckGo)
- `lepszy-sqlite3` wymaga usunićcia pakietu Windows SDK — z zależnienci, zamiast tego używajć historia w pamiuci
