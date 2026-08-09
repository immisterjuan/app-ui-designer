// PKCE helpers for GitHub OAuth (client-side)
// Generates code_verifier and code_challenge according to RFC 7636

export function randomString(length = 128) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const values = new Uint8Array(length)
  crypto.getRandomValues(values)
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length]
  }
  return result
}

function base64urlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return base64urlEncode(hashBuffer)
}

export async function generatePkcePair() {
  const code_verifier = randomString(96)
  const code_challenge = await sha256(code_verifier)
  return { code_verifier, code_challenge }
}

export function buildGithubAuthUrl({
  client_id,
  redirect_uri,
  scope = 'repo',
  state,
  code_challenge,
}: {
  client_id: string
  redirect_uri: string
  scope?: string
  state: string
  code_challenge: string
}) {
  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope,
    state,
    code_challenge_method: 'S256',
    code_challenge,
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}
