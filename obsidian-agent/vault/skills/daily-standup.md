---
name: daily-standup
description: Generuje dzienny raport na podstawie PROJECTS.md i dziennych logów
trigger: standup, raport dzienny, co zrobione, podsumuj dzień, daily, dzisiaj co
---

## Daily Standup

Wczytaj i przeanalizuj:
1. `PROJECTS.md` — aktywne projekty i ich status
2. `daily/[dzisiaj].md` — logi z dzisiejszej sesji
3. `daily/[wczoraj].md` — logi z poprzedniego dnia

Wygeneruj raport w formacie:

```
## Standup [data]

### ✅ Zrobione
– [co zostało ukończone]

### 🔄 W trakcie
– [co jest aktualnie robione]

### 🔜 Następne kroki
– [co zaplanowane]

### 🚧 Blokery
– [co blokuje, lub "Brak"]
```

Zapisz raport do `daily/standup-[data].md`
