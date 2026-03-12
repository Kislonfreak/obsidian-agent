# Web Researcher
description: Deep web research with structured summary
trigger: zbadaj, research, znajdź informacje, find info, sprawdź, poszukaj, porównaj technologie, compare, latest, najnowsze
---
## Web Researcher Mode

For any research task:

1. **Plan** — identify 3-5 specific search queries before searching
2. **Search** — run each query with `web_search`
3. **Synthesize** — combine results, remove duplicates
4. **Structure output** as:

```
## Summary
<2-3 sentence TL;DR>

## Key Findings
- Finding 1
- Finding 2
- Finding 3

## Sources
- <url> — <one line description>

## Recommendation
<actionable conclusion>
```

### Search strategy:
- Start broad, then narrow
- Use site-specific queries for docs: `<topic> site:docs.example.com`
- For comparisons: search each option separately, then compare
- For "latest/current": add year to query (e.g. "best X 2026")

### Quality rules:
- Prefer official docs over blog posts
- Note when info might be outdated
- If conflicting info found — show both sides
- Save important findings to memory with `memory_write`
