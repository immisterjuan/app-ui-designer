import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForToken } from './commitHelpers'
import { saveToken } from '../persistence/idb'

export default function OAuthCallback() {
  const [status, setStatus] = useState('processing')
  // useNavigate only if react-router used; if not, we just show UI and not redirect
  // const navigate = useNavigate()

  useEffect(() => {
    async function handle() {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const state = params.get('state')
        const storedState = sessionStorage.getItem('oauth:state')
        const client_id = sessionStorage.getItem('oauth:client_id')
        const code_verifier = sessionStorage.getItem('oauth:code_verifier')

        if (!code || !state || state !== storedState) {
          setStatus('invalid state or missing code')
          return
        }
        if (!client_id || !code_verifier) {
          setStatus('missing PKCE verifier or client_id in sessionStorage')
          return
        }

        setStatus('exchanging code for token...')
        const token = await exchangeCodeForToken({ client_id, code, code_verifier, redirect_uri: `${window.location.origin}/oauth/callback` })

        if (token && token.access_token) {
          await saveToken(token.access_token)
          setStatus('success: access token saved locally')
          // clear PKCE items
          sessionStorage.removeItem('oauth:code_verifier')
          sessionStorage.removeItem('oauth:state')
          // navigate to app root if router present
          // navigate('/')
        } else {
          setStatus('failed to obtain token')
        }
      } catch (err:any) {
        console.error(err)
        setStatus('error: ' + (err.message ?? String(err)))
      }
    }
    handle()
  }, [])

  return (
    <div style={{padding:24}}>
      <h3>OAuth callback</h3>
      <div>Status: {status}</div>
      <div style={{marginTop:12}}>
        {status.startsWith('success') ? (
          <div>You can close this tab and return to the app. The access token is stored in your browser.</div>
        ) : (
          <div>If exchange failed, consider using the server-side exchange template described in the README.</div>
        )}
      </div>
    </div>
  )
}
