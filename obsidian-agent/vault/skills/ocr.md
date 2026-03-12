---
name: ocr
description: Wyciąga tekst ze zdjęć i skanów dokumentów
trigger: ocr, tekst ze zdjęcia, odczytaj zdjęcie, skan, przepisz tekst, wyciągnij tekst ze zdjęcia
---

## OCR — Optyczne rozpoznawanie tekstu

Gdy użytkownik wgra zdjęcie z tekstem (dokument, skan, screenshot, tablica, kartka):

1. Przeanalizuj obraz modelem vision (`qwen2.5vl`)
2. Wyciągnij **cały widoczny tekst** zachowując:
   - Oryginalną strukturę (nagłówki, akapity, listy)
   - Formatowanie tabelaryczne jeśli obecne
   - Kolejność czytania (lewo→prawo, góra→dół)
3. Oznacz fragmenty nieczytelne jako `[nieczytelne]`
4. Zapytaj czy zapisać wynik do vault

### Format odpowiedzi

```
## Rozpoznany tekst

[cały tekst z obrazu]

---
⚙️ OCR zakończone | Znaki: [liczba] | Pewność: [wysoka/średnia/niska]
```
