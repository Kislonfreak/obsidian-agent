import readline from 'readline'
import { VaultManager } from '../core/vault.js'
import { OllamaClient } from '../models/ollama.js'

const QUESTIONS = [
  { key: 'name',     q: 'Jak masz na imię lub jaki jest Twój nick?' },
  { key: 'timezone', q: 'W jakiej strefie czasowej jesteś? (np. Europe/Warsaw)' },
  { key: 'lang',     q: 'W jakim języku mam się z Tobą komunikować?' },
  { key: 'style',    q: 'Jak mam odpowiadać? (np. krótko i technicznie / bardziej opisowo)' },
  { key: 'stack',    q: 'Jakiego stacku/technologii używasz na co dzień?' },
  { key: 'hardware', q: 'Jakie masz główne urządzenia/sprzęt do pracy?' },
  { key: 'project',  q: 'Nad czym teraz pracujesz? (aktualny projekt)' },
  { key: 'goal',     q: 'Jaki jest główny cel tego projektu?' },
]

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(`\n${question}\n> `, answer => resolve(answer.trim()))
  })
}

export async function runOnboarding(vault: VaultManager, ollama: OllamaClient) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  console.log('\n' + '─'.repeat(50))
  console.log('🧠 ObsidianAgent — pierwsze uruchomienie')
  console.log('Zadam Ci kilka pytań i uzupełnię pliki vault.')
  console.log('─'.repeat(50))

  const answers: Record<string, string> = {}

  for (const { key, q } of QUESTIONS) {
    answers[key] = await ask(rl, q)
  }

  rl.close()

  const date = new Date().toISOString().split('T')[0]

  // Build USER.md
  const userMd = `# User Context

## Identity
- **Name:** ${answers.name}
- **Timezone:** ${answers.timezone || 'Europe/Warsaw'}
- **Language:** ${answers.lang || 'Polish'}

## Communication Style
${answers.style}

## Technical Stack
${answers.stack}

## Hardware
${answers.hardware}

## Notes
<!-- Agent appends observations here -->
- \`${date}\` — Onboarding completed.
`

  // Build PROJECTS.md
  const projectsMd = `# Projects

## ${answers.project} \`STATUS: active\`
- **Goal:** ${answers.goal}
- **Last action:** Project initialized via onboarding
- **Next step:** (agent will update)
- **Blocker:** (none yet)
`

  await vault.write('USER.md', userMd)
  await vault.write('PROJECTS.md', projectsMd)

  // Write to memory
  await vault.writeMemory(`User: ${answers.name}, stack: ${answers.stack}`)

  console.log('\n✅ Vault uzupełniony:')
  console.log('   USER.md     — profil użytkownika')
  console.log('   PROJECTS.md — aktywny projekt')
  console.log('   MEMORY.md   — podstawowe fakty')
  console.log('\nMożesz edytować te pliki w Obsidian w każdej chwili.')
  console.log('─'.repeat(50) + '\n')
}

export async function shouldOnboard(vault: VaultManager): Promise<boolean> {
  const user = await vault.read('USER.md')
  // Check if USER.md still has placeholder content
  return user.includes('(set me)') || user.trim() === '' || !user.includes('Name:')
}
