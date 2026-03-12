---
name: note-organizer
description: Porządkuje vault — duplikaty, puste pliki, sugeruje tagi i linki
trigger: porządkuj notatki, vault cleanup, organizuj, duplikaty, puste notatki, uporządkuj vault
---

## Note Organizer

Przeskanuj vault używając `vault_read` i `shell`:

1. **Znajdź puste pliki** (< 10 słów treści)
2. **Znajdź duplikaty** (podobne nazwy lub treść)
3. **Sprawdź niepołączone notatki** — nie mają linków do innych plików
4. **Zaproponuj tagi** na podstawie treści

Raport w formacie:

```markdown
## Raport vault — [data]

### 🗑️ Puste pliki
– [lista]

### 🔁 Możliwe duplikaty
– [para plików] — [powód]

### 🔗 Niepołączone notatki
– [lista]

### 🏷️ Sugerowane tagi
– [plik] → #tag1 #tag2
```

Zapisz raport do `daily/vault-audit-[data].md`
NIE usuwaj plików automatycznie — tylko raportuj i pytaj o zgodę.
