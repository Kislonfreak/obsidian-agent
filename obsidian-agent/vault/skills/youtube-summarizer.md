---
name: youtube-summarizer
description: Pobiera transcript z YouTube i generuje streszczenie
trigger: youtube, youtu.be, yt.be, streszcz film, podsumuj video, transcript
---

## YouTube Summarizer

Gdy użytkownik poda URL YouTube:

1. Wyciągnij ID filmu z URL
2. Pobierz transcript przez shell:

```bash
# Jeśli zainstalowany yt-dlp
yt-dlp --write-auto-sub --sub-lang pl,en --skip-download -o "%(id)s" [URL]

# Alternatywnie — pobierz stronę i wyciągnij opis
```

3. Jeśli transcript niedostępny — pobierz opis i metadane strony

4. Wygeneruj:
   - **Tytuł i kanał**
   - **Streszczenie** (5-8 zdań)
   - **Kluczowe punkty** (bullet list)
   - **Timestamp najważniejszych momentów** (jeśli dostępne)

5. Zapisz do `knowledge/youtube-[id].md`
