import React, { useEffect, useState } from 'react'
import { loadToken } from '../persistence/idb'
import { listUserRepos, listBranches, createCommitToBranch } from './commitHelpers'
import { generateProjectFiles } from '../export/generator'
import { loadWireframe } from '../persistence/idb'

export default function RepoCommitPanel(){
  const [token, setToken] = useState<string | null>(null)
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('main')
  const [status, setStatus] = useState<string | null>(null)
  const [previewFiles, setPreviewFiles] = useState<Record<string,string>>({})

  useEffect(()=>{
    async function init(){
      const t = await loadToken()
      setToken(t ?? null)
      if(t){
        try{
          const rs = await listUserRepos(t)
          setRepos(rs)
        }catch(err:any){
          console.error(err)
          setStatus('failed to list repos: ' + err.message)
        }
      }
    }
    init()
  }, [])

  async function handleSelectRepo(repo:any){
    setSelectedRepo(repo)
    setStatus('loading branches...')
    try{
      const br = await listBranches(token!, repo.owner.login, repo.name)
      setBranches(br)
      setSelectedBranch(br[0]?.name ?? 'main')
      setStatus(null)
    }catch(err:any){
      console.error(err)
      setStatus('failed to list branches: ' + err.message)
    }
  }

  async function handlePreview(){
    setStatus('generating files...')
    const wire = await loadWireframe()
    const kit = undefined // generator will read currentKit if needed; keep simple
    const files = await generateProjectFiles(wire, kit)
    setPreviewFiles(files)
    setStatus('preview ready')
  }

  async function handleCommit(){
    if(!token) return alert('No GitHub token found; connect first')
    if(!selectedRepo) return alert('Select a repository')
    const owner = selectedRepo.owner.login
    const repo = selectedRepo.name
    const branch = selectedBranch
    setStatus('creating commit...')
    try{
      await createCommitToBranch(token, owner, repo, branch, previewFiles, 'Add generated UI from App UI Designer')
      setStatus('commit successful')
      alert('Commit successful')
    }catch(err:any){
      console.error(err)
      setStatus('commit failed: ' + err.message)
      alert('Commit failed: ' + err.message)
    }
  }

  return (
    <div style={{marginTop:12}}>
      <h4>Export & Push</h4>
      <div>GitHub token: {token ? 'connected' : 'not connected'}</div>

      <div style={{marginTop:8}}>
        <strong>Choose repo</strong>
        <div style={{maxHeight:200, overflow:'auto', border:'1px solid #eee', padding:8}}>
          {repos.map(r => (
            <div key={r.id} style={{padding:6, borderBottom:'1px solid #f4f4f4'}}>
              <div><strong>{r.full_name}</strong></div>
              <div style={{fontSize:12}}>{r.description}</div>
              <div style={{marginTop:6}}>
                <button onClick={() => handleSelectRepo(r)}>Select</button>
              </div>
            </div>
          ))}
          {repos.length === 0 && <div style={{padding:8}}>No repos. Connect to GitHub or create a repo first.</div>}
        </div>
      </div>

      {selectedRepo && (
        <div style={{marginTop:12}}>
          <div>Selected: <strong>{selectedRepo.full_name}</strong></div>
          <div style={{marginTop:8}}>
            <label>Target branch: </label>
            <select value={selectedBranch} onChange={(e)=>setSelectedBranch(e.target.value)}>
              {branches.map(b => (<option key={b.name} value={b.name}>{b.name}</option>))}
            </select>
          </div>

          <div style={{marginTop:12}}>
            <button onClick={handlePreview}>Generate preview files</button>
            <button onClick={handleCommit} style={{marginLeft:8}}>Commit to repo</button>
          </div>

          <div style={{marginTop:12}}>
            <h5>Preview files</h5>
            <div style={{maxHeight:240, overflow:'auto', border:'1px solid #eee', padding:8}}>
              {Object.keys(previewFiles).length === 0 ? <div>No preview generated</div> : (
                Object.entries(previewFiles).map(([path, content]) => (
                  <div key={path} style={{marginBottom:12}}>
                    <div style={{fontWeight:600}}>{path}</div>
                    <pre style={{whiteSpace:'pre-wrap', wordBreak:'break-word', background:'#f9f9f9', padding:8}}>{content.slice(0, 2000)}</pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{marginTop:12}}>Status: {status ?? 'idle'}</div>
    </div>
  )
}
