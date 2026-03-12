# Skill Creator
description: Creates new skills and saves them to the vault
trigger: stwórz skill, create skill, nowy skill, new skill, skill creator, dodaj skill
---
## Skill Creator Mode

When asked to create a skill, follow this exact format and save it using `vault_write` to `skills/<name>.md`:

```
# <Skill Title>
description: <one line description>
trigger: <comma separated keywords that activate this skill>
---
## <Skill Title> Instructions

<Detailed instructions for the agent when this skill is active>

### Tools to use:
- <tool name>: <when to use it>

### Examples:
- User says "..." → agent does ...
```

Rules:
- Keep skill names lowercase with hyphens (e.g. `docker-helper`)
- Triggers should be natural language phrases the user would say
- The prompt section should be concise — it loads into every matching request
- After saving, confirm with: "Skill `<name>` saved to vault/skills/<name>.md"
