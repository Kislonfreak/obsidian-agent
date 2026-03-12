# ObsidianAgent v0.1.0 — Initial Release

## 🧠 What is ObsidianAgent?

Ultra-fast local AI agent with Obsidian vault as its brain. Fully local, no cloud required.

---

## ✨ Features

### Trasowanie wielomodelowe
- `qwen3.5:4b` — szybki model dla prostych zapytań i wywołań narzędzi (~2-4 s)
- `qwen3:8b` — model myślenia dla złożonego rozumowania (~5-10 s)
- `qwen2.5vl:3b` — model widzenia do analizy obrazu
- Automatyczne trasowanie na podstawie typu zapytania — brak ręcznego przełączania

### Obsydianowy skarb jako mózg
- Agent czyta i pisze bezpośrednio do `sklepienie/` folder
- Edytować `DUSZA.md`, `UŻYTKOWNIK.md`, `PAMIĘĆ.md`, `PROJEKTY.md` w Obsydianie
- File Watcher — zmiany w skarbcu są natychmiast wykrywane (nie jest wymagane ponowne uruchamianie)
- Pamięć podręczna monitów systemowych (30 s TTL) — vault ładuje się raz, a nie przy każdej wiadomości

### System umiejętności
- Umiejętności to `. .md` pliki w `sklepienie/umiejętności/`
- Automatyczne ładowanie podczas uruchamiania, automatyczne wykrywanie poprzez dopasowanie słów kluczowych
- W zestawie 4 wbudowane umiejętności:
  - `twórca umiejętności` — agent tworzy nowe umiejętności z rozmowy
  - `code-runner` — pisze i uruchamia kod lokalnie
  - `pomocnik git` — operacje git z kontrolami bezpieczeństwa
  - `badacz stron internetowych` — głębokie badania internetowe ze strukturalnymi wynikami
- Nowe umiejętności zapisane w skarbcu, widoczne i edytowalne w Obsidian

### Wywoływanie narzędzi
- `muszla` — uruchamiaj polecenia systemowe (PowerShell w systemie Windows)
- `odczyt pliku` / `zapis_pliku` — odczytaj/zapisz dowolny plik na dysku
- `vault_read` / `vault_write` — odczyt/zapis plików Obsidian Vault
- `wyszukiwanie_sieciowe` — Wyszukiwanie DuckDuckGo (nie jest potrzebny klucz API)
- `zapis_pamięci` — zapisz fakty w MEMORY.md
- `przełącznik_gałęzi` — przełącz aktywną gałąź wiedzy
- `umiejętność_utwórz` / `lista_umiejętności` / `umiejętność_usuń` — zarządzaj umiejętnościami

### Gałęzie wiedzy
- Zorganizaj wiedzę w `sklepienie/wiedza/` podkatalogi
- Przełęcz gałąź: `/kodowanie gałęzi` lub za pośrednictwem rozwijanego interfeju użytkownika sieci Web
- Agent ładuje zawartość gałęzi jako kontekst RAG

### Przeszkadza sieciowa
- Interfejs czatu z ciemnym motyw w `http://127.0.0.1:18789`
- Komunikacja WebSocket w czasie rzeczywistym
- Rozwiana lista praćnika gałęzi
- Pokazuje użyty model i czas reakcji na wiadomość

### Bot Telegramu
- Pełny dośćp agent przez Telegram
- Wskaźnik wpisywania podczas przetwarzania agenta
- Polecenia: `/start` `/status` `/jasne` `/oddział`
- Lista dozwołonych nazw według nazwy użytkownika dla bezpieczego

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
