import React, { useState, useEffect } from 'react'
import { downloadKit, loadKitFromCache, fetchKitManifest, removeKit, getKitSize } from './kitLoader'
import { useAppState } from '../state/useAppState'

const BUILT_INS = [
  { id: 'tailwind-starter-kit', name: 'Tailwind Starter Kit', manifest: '/src/kits/manifests/tailwind-starter-kit.json' }
]

export default function KitPanel(){
  const setCurrentKit = useAppState((s) => s.setCurrentKit)
  const [status, setStatus] = useState<string | null>(null)
  const [manifestUrl, setManifestUrl] = useState('')
  const [cached, setCached] = useState<Record<string, any>>({})

  useEffect(()=>{
    async function loadCached(){
      const map: Record<string, any> = {}
      for(const b of BUILT_INS){
        const k = await loadKitFromCache(b.id)
        if(k) map[b.id] = k
      }
      setCached(map)
    }
    loadCached()
  }, [])

  async function handleLoadBuiltIn(manifestPath: string, id: string){
    setStatus('fetching manifest...')
    try{
      const manifest = await fetchKitManifest(manifestPath)
      // show license & size estimation: fetch css text lengths (not yet downloaded)
      const size = (manifest.css && manifest.css.length) ? 'unknown (remote)' : 'small'
      if(!confirm(`${manifest.name} (${manifest.version})\nLicense: ${manifest.license || 'unknown'}\nEstimated size: ${size}\n\nProceed to download and cache this kit for offline use?`)){
        setStatus('cancelled')
        return
      }
      setStatus('downloading kit...')
      const kit = await downloadKit(manifestPath)
      setCurrentKit(kit)
      setCached((c)=>({ ...c, [id]: kit }))
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
      setCached((c)=>({ ...c, [kit.id]: kit }))
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

  async function handleUninstall(id:string){
    if(!confirm('Remove cached kit and free up space?')) return
    setStatus('removing...')
    try{
      await removeKit(id)
      setCached((c)=>{ const nc = { ...c }; delete nc[id]; return nc })
      setStatus('removed')
      alert('Kit removed from cache (best effort)')
    }catch(err:any){
      console.error(err)
      setStatus('error')
      alert('Failed to remove kit: ' + err.message)
    }
  }

  async function handleShowSize(id:string){
    const s = await getKitSize(id)
    alert(`Estimated cached size: ${s ?? 'unknown'} bytes`)
  }

  return (
    <div>
      <h4>UI Kits</h4>
      <div>
        {BUILT_INS.map(b => (
          <div key={b.id} style={{marginBottom:8}}>
            <button onClick={() => handleLoadBuiltIn(b.manifest, b.id)}>{b.name}</button>
            <button style={{marginLeft:8}} onClick={() => handleLoadFromCache(b.id)}>Load cached</button>
            {cached[b.id] && (
              <>
                <button style={{marginLeft:8}} onClick={() => handleShowSize(b.id)}>Size</button>
                <button style={{marginLeft:8}} onClick={() => handleUninstall(b.id)}>Uninstall</button>
              </>
            )}
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
