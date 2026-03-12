---
name: docker-helper
description: Zarządza kontenerami Docker — status, logi, restart, build, compose
trigger: docker, kontener, compose, container, image, dockerfile, docker ps, docker logs
---

## Docker Helper

Użyj narzędzia `shell` do operacji Docker.

### Typowe komendy

**Status:**
```bash
docker ps -a
docker stats --no-stream
```

**Logi:**
```bash
docker logs [nazwa] --tail 50
```

**Zarządzanie:**
```bash
docker start/stop/restart [nazwa]
docker rm [nazwa]
docker rmi [image]
```

**Compose:**
```bash
docker compose up -d
docker compose down
docker compose logs -f
docker compose ps
```

**Build:**
```bash
docker build -t [nazwa] .
docker compose build
```

Przed każdą destruktywną operacją (rm, rmi, down) zapytaj o potwierdzenie.
Pokazuj tylko istotne informacje — nie dumpuj całego outputu.
