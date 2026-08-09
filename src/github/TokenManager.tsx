import React, { useEffect, useState } from 'react'
import { loadToken, deleteToken } from '../persistence/idb'
import { getUser } from './commitHelpers'

export default function TokenManager(){
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(()=>{
    async function init(){
      const t = await loadToken()
      setToken(t ?? null)
      if(t){
        try{
          const u = await getUser(t)
          setUser(u)
        }catch(err:any){
          console.error(err)
        }
      }
    }
    init()
  }, [])

  async function handleRevoke(){
    if(!confirm('Remove the stored GitHub access token from this browser?')) return
    setStatus('revoking...')
    try{
      await deleteToken()
      setToken(null)
      setUser(null)
      setStatus('revoked')
      alert('Token removed from browser storage. To fully revoke access, remove the app access in your GitHub account settings.')
    }catch(err:any){
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div style={{marginBottom:12}}>
      <h4>Token Management</h4>
      <div>Stored token: {token ? 'present' : 'not present'}</div>
      {user && (
        <div style={{marginTop:8}}>
          <div><strong>User:</strong> {user.login} ({user.name ?? 'no name'})</div>
          <div style={{fontSize:12}}><img src={user.avatar_url} alt="avatar" style={{width:24,height:24,borderRadius:12,verticalAlign:'middle'}}/> {user.html_url}</div>
        </div>
      )}
      <div style={{marginTop:8}}>
        <button onClick={handleRevoke} disabled={!token}>Remove stored token</button>
        <div style={{marginTop:8}}>Status: {status ?? 'idle'}</div>
      </div>
    </div>
  )
}
