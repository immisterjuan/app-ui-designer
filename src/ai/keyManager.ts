// Minimal AI key manager - stores user-provided API keys locally in IndexedDB (or memory)
import { saveWireframe } from '../persistence/idb'

const AI_KEY_STORAGE = 'ai_keys'

export function saveApiKey(provider: string, key: string){
  // TODO: store in IndexedDB in a secure way; for now, keep in localStorage as a demo (user must opt-in)
  localStorage.setItem(`ai_key:${provider}`, key)
}

export function getApiKey(provider: string){
  return localStorage.getItem(`ai_key:${provider}`) || undefined
}

export async function generateWireframeFromPrompt(prompt: string){
  const key = getApiKey('openai')
  if(!key) throw new Error('Missing API key for OpenAI')
  // call the provider - left as TODO for user to implement with their account
  throw new Error('generateWireframeFromPrompt not implemented in scaffold')
}
