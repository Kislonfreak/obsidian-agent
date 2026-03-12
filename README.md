# ObsidianAgent v0.2.2 — Vision Fix #2

## Zmiany względem v0.2.1

### 🐛 Bugfix
- **Model vision nie obsługuje tool calling** — `qwen2.5vl:3b` zwracał błąd `does not support tool` bo agent zawsze przekazywał schematy narzędzi. Gdy rola to `vision`, narzędzia są teraz wyłączane (`tools: undefined`). Agent opisuje zdjęcia i dokumenty bez błędów.

---

*Poprzednie wersje: v0.2.1, v0.2.0, v0.1.0*
