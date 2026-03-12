# ObsidianAgent v0.2.4 — Smart Routing

## Zmiany względem v0.2.3

### ⚡ Ulepszenia

**Router Rozszerzony modele (zero latencji)**
- Całkowita przebudowa `wykryjRole()` — teraz 3 wyrawne kategoria z bogatymi listami słoń kluczy
- Wizja: `obraz`, `zdjęcie`, `foto`, `zrzut ekranu`, `wygląda`, `widzisz`, `na zdjęciu` i inne
- Myślenie (`qwen3:8b`): zadania twórcze, analityczne, jeżykowe — `opisz`, `porównaj`, `przetołumacz`, `Napisz`, `popraw`, `ulepsz`, `e-mail`, `rapport`, `co sądzisz`, `jak dział` i ~30 innych
- Narzędzia (`qwen3:1,7b`): króckie komendy, proste pytania, wywołnia narzędzi
- Próg długości obniuny z 300 do 200 znaków — dłużnie wiadomości zawsze idć do 8b

### 🤔 Tramwaj Dlaczego nie LLM?
LLM-router (osobny model decydujcy o routingu) dorałby 2-4s latencji na każde zapytanie — wywolanie modelu żeby zdecydować który model wywolić. Dopasowanie słow kluczy jest deterministyczny i ma 0ms narzutu.

---

*Poprzednie wersje: v0.2.3, v0.2.2, v0.2.1, v0.2.0, v0.1.0*

