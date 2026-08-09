import React, { useState } from 'react'
import { downloadKit, loadKitFromCache } from './kitLoader'
import { useAppState } from '../state/useAppState'

const BUILT_INS = [
  { id: 'tailwind-starter-kit', name: 'Tailwind Starter Kit', manifest: '/src/kits/manifests/tailwind-starter-kit.json' }
]

export default function KitPanel(){
  const setCurrentKit = useAppState((s) => s.setCurrentKit)
  const [status, setStatus] = useState<string | null>(null)
  const [manifestUrl, setManifestUrl] = useState('')

  async function handleLoadBuiltIn(manifestPath: string){
    setStatus('loading')
    try{
      const kit = await downloadKit(manifestPath)
      setCurrentKit(kit)
      setStatus('loaded')
    }catch(err:any){
      console.error(err)
      setStatus('error')
      alert('Failed to load kit: ' + err.message)
    }
  }

  async function handleLoadFromUrl(){
    if(!manifestUrl) return alert('Enter manifest URL')
    setStatus('loading')
    try{
      const kit = await downloadKit(manifestUrl)
      setCurrentKit(kit)
      setStatus('loaded')
    }catch(err:any){
      console.error(err)
      setStatus('error')
      alert('Failed to load kit: ' + err.message)
    }
  }

  async function handleLoadFromCache(id: string){
    const kit = await loadKitFromCache(id)
    if(!kit) return alert('No cached kit with id: ' + id)
    useAppState.getState().setCurrentKit(kit)
    setStatus('loaded (cache)')
  }

  return (
    <div>
      <h4>UI Kits</h4>
      <div>
        {BUILT_INS.map(b => (
          <div key={b.id} style={{marginBottom:8}}>
            <button onClick={() => handleLoadBuiltIn(b.manifest)}>{b.name}</button>
            <button style={{marginLeft:8}} onClick={() => handleLoadFromCache(b.id)}>Load cached</button>
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <input placeholder="Manifest URL or local path" value={manifestUrl} onChange={(e)=>setManifestUrl(e.target.value)} style={{width:'100%'}} />
        <div style={{marginTop:8}}>
          <button onClick={handleLoadFromUrl}>Load manifest</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div>Status: {status ?? 'idle'}</div>
      </div>
    </div>
  )
}
