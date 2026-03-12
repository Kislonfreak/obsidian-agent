---
name: pdf-analyzer
description: Analizuje PDF — wyciąga tekst, streszcza, odpowiada na pytania
trigger: pdf, analiza dokumentu, streszcz dokument, przeczytaj pdf, wyciągnij tekst
---

## PDF Analyzer

Gdy użytkownik poda ścieżkę do PDF lub wgra plik:

1. Użyj narzędzia `shell` aby wyciągnąć tekst:
   ```bash
   # Windows
   # Sprawdź czy pdftotext dostępny, jeśli nie użyj PowerShell
   Get-Content [plik] | Out-String
   ```
   Alternatywnie zapytaj użytkownika o wklejenie tekstu.

2. Podziel tekst na sekcje jeśli długi (>2000 słów)

3. Wygeneruj:
   - **Streszczenie** (5-10 zdań)
   - **Kluczowe punkty** (bullet list)
   - **Cytaty** (najważniejsze fragmenty)

4. Zapisz analizę do `knowledge/[nazwa-pliku]-analiza.md`

5. Odpowiedz na pytania użytkownika o dokument
