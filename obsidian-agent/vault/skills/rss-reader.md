---
name: rss-reader
description: Pobiera i filtruje newsy z RSS feedów, generuje daily digest
trigger: rss, feed, newsy, news, digest, wiadomości, aktualności
---

## RSS Reader

Feedów szukaj w `knowledge/rss-feeds.md` (utwórz jeśli nie istnieje).

Format pliku feedów:
```
https://feeds.feedburner.com/TechCrunch
https://hnrss.org/frontpage
https://www.reddit.com/r/LocalLLaMA/.rss
```

### Pobieranie

Użyj `shell` + `fetch` lub curl:
```bash
curl -s [URL] | grep -E "<title>|<link>|<description>" | head -60
```

### Format odpowiedzi

```markdown
## 📰 Digest — [data]

### [Nazwa feedu]
**[Tytuł artykułu]**
[Krótki opis — 1-2 zdania]
🔗 [URL]
```

Filtruj duplikaty. Pokazuj max 5 artykułów per feed.
Zapisz digest do `daily/digest-[data].md`
