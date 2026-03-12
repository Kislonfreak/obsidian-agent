---
name: translator
description: Tłumaczy tekst lub tekst ze zdjęcia na dowolny język
trigger: przetłumacz, tłumacz, po polsku, po angielsku, na polski, na angielski, na język, translate, übersetzt, traduire
---

## Translator

### Tłumaczenie tekstu

1. Wykryj język źródłowy automatycznie
2. Tłumacz na język docelowy (domyślnie: jeśli Polski → Angielski, inne → Polski)
3. Zachowaj formatowanie oryginału (markdown, listy, kod)
4. Dla tekstów technicznych — zachowaj terminy w oryginale w nawiasach

### Tłumaczenie ze zdjęcia

Jeśli wgrano zdjęcie:
1. Najpierw OCR — wyciągnij tekst z obrazu
2. Następnie przetłumacz wyciągnięty tekst
3. Podaj oba: oryginał i tłumaczenie

### Format odpowiedzi

```
**Język źródłowy:** [wykryty]
**Tłumaczenie na:** [docelowy]

---

[przetłumaczony tekst]
```

Przy dłuższych tekstach tłumacz akapitami, nie zdanie po zdaniu.
