import readline from 'readline'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
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
    rl.question('\n' + question + '\n> ', answer => resolve(answer.trim()))
  })
}

function askPin(rl: readline.Interface): Promise<string> {
  return new Promise(resolve => {
    const prompt = () => {
      rl.question('\nUstaw PIN do logowania w UI (4-8 cyfr):\n> ', (answer) => {
        const pin = answer.trim()
        if (/^\d{4,8}$/.test(pin)) {
          resolve(pin)
        } else {
          console.log('  PIN musi mieć 4-8 cyfr. Spróbuj jeszcze raz.')
          prompt()
        }
      })
    }
    prompt()
  })
}

async function updateEnvFile(pin: string, secret: string) {
  const envPath = path.resolve('.env')
  let content = ''
  try {
    content = await fs.readFile(envPath, 'utf-8')
  } catch {
    try { content = await fs.readFile('.env.example', 'utf-8') } catch { content = '' }
  }
  if (content.includes('UI_PIN=')) {
    content = content.replace(/^UI_PIN=.*/m, 'UI_PIN=' + pin)
  } else {
    content += '\nUI_PIN=' + pin
  }
  if (content.includes('SESSION_SECRET=')) {
    content = content.replace(/^SESSION_SECRET=.*/m, 'SESSION_SECRET=' + secret)
  } else {
    content += '\nSESSION_SECRET=' + secret
  }
  await fs.writeFile(envPath, content, 'utf-8')
}

export async function runOnboarding(vault: VaultManager, ollama: OllamaClient) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  console.log('\n' + '='.repeat(52))
  console.log('  ObsidianAgent -- pierwsze uruchomienie')
  console.log('  Zadam Ci kilka pytan i uzupelnie pliki vault.')
  console.log('='.repeat(52))

  const answers: Record<string, string> = {}
  for (const { key, q } of QUESTIONS) {
    answers[key] = await ask(rl, q)
  }

  console.log('\n' + '-'.repeat(52))
  console.log('  Bezpieczenstwo -- dostep do interfejsu web')
  console.log('  PIN bedzie wymagany przy kazdym wejsciu do UI.')
  console.log('-'.repeat(52))

  const pin = await askPin(rl)
  const secret = crypto.randomBytes(32).toString('hex')
  rl.close()

  await updateEnvFile(pin, secret)
  console.log('\n  PIN i klucz sesji zapisane do .env')

  const date = new Date().toISOString().split('T')[0]

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
- \`${date}\` -- Onboarding completed.
`

  const projectsMd = `# Projects

## ${answers.project} \`STATUS: active\`
- **Goal:** ${answers.goal}
- **Last action:** Project initialized via onboarding
- **Next step:** (agent will update)
`

  await vault.write('USER.md', userMd)
  await vault.write('PROJECTS.md', projectsMd)
  await vault.writeMemory(`User: ${answers.name}, stack: ${answers.stack}`)

  console.log('\n  Vault uzupelniony:')
  console.log('     USER.md     -- profil uzytkownika')
  console.log('     PROJECTS.md -- aktywny projekt')
  console.log('     MEMORY.md   -- podstawowe fakty')
  console.log('\n  UI dostepne pod: http://127.0.0.1:18789')
  console.log('  Twoj PIN jest zapisany w .env jako UI_PIN')
  console.log('='.repeat(52) + '\n')
}

export async function shouldOnboard(vault: VaultManager): Promise<boolean> {
  const user = await vault.read('USER.md')
  return user.includes('(set me)') || user.trim() === '' || !user.includes('Name:')
}
