import React, { useState } from 'react'
import { generatePkcePair, buildGithubAuthUrl } from './pkce'

export default function OAuthPanel() {
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function handleConnect() {
    if (!clientId) return alert('Enter GitHub OAuth App client_id (you can register one in GitHub Developer settings)')
    setStatus('starting')
    const redirect_uri = `${window.location.origin}/oauth/callback`
    const state = Math.random().toString(36).slice(2)
    const { code_verifier, code_challenge } = await generatePkcePair()

    // store verifier and client_id and state in sessionStorage for callback
    sessionStorage.setItem('oauth:code_verifier', code_verifier)
    sessionStorage.setItem('oauth:client_id', clientId)
    sessionStorage.setItem('oauth:state', state)

    const url = buildGithubAuthUrl({ client_id: clientId, redirect_uri, scope: 'repo', state, code_challenge })
    // redirect to GitHub authorization
    window.location.href = url
  }

  return (
    <div style={{marginBottom:12}}>
      <h4>GitHub Connect</h4>
      <p style={{fontSize:13}}>Connect your GitHub account to push generated projects to YOUR repositories. This uses OAuth Authorization Code + PKCE; no client_secret is required.</p>
      <div style={{marginTop:8}}>
        <input placeholder="OAuth App client_id" value={clientId} onChange={(e)=>setClientId(e.target.value)} style={{width:'100%'}} />
      </div>
      <div style={{marginTop:8, display:'flex', gap:8}}>
        <button onClick={handleConnect}>Connect to GitHub</button>
        <button onClick={()=>{ setClientId(''); sessionStorage.removeItem('oauth:client_id'); }}>Clear</button>
      </div>
      <div style={{marginTop:8}}>Status: {status ?? 'idle'}</div>
      <div style={{marginTop:8, fontSize:13}}>
        <strong>Notes:</strong>
        <ul>
          <li>Register an OAuth App in your GitHub account (Settings → Developer settings → OAuth Apps). Set the callback URL to <code>{window.location.origin}/oauth/callback</code>.</li>
          <li>If you don't want to register an app, you can paste a client_id from one you control.</li>
          <li>The access token will be stored only in your browser (IndexedDB) and used to push commits to repositories you select.</li>
        </ul>
      </div>
    </div>
  )
}
