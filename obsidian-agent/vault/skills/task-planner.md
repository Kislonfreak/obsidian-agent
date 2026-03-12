---
name: task-planner
description: Rozbija duży cel na konkretne kroki i zapisuje plan do vault
trigger: zaplanuj, plan, rozbij, kroki, goal, cele, harmonogram, roadmap, podziel zadanie
---

## Task Planner

Gdy użytkownik poda cel lub duże zadanie:

1. Rozbij je na konkretne, małe kroki (max 10)
2. Każdy krok: co zrobić, szacowany czas, zależności
3. Zapisz plan do vault jako `plans/YYYY-MM-DD-nazwa-celu.md`
4. Format pliku:

```markdown
# Plan: [Nazwa celu]
Data: [data]
Status: active

## Kroki
- [ ] 1. [krok] — [czas]
- [ ] 2. [krok] — [czas]
...

## Notatki
```

5. Odpowiedz krótkim podsumowaniem planu i ścieżką gdzie zapisany
6. Zapytaj czy zaczynamy od pierwszego kroku
