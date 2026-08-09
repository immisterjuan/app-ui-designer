import React, { useState } from 'react'
import { generateProjectFiles, generateZip } from './generator'
import { loadWireframe } from '../persistence/idb'

export default function ExportPanel(){
  const [status, setStatus] = useState<string | null>(null)

  async function handleDownloadZip(){
    setStatus('generating files...')
    const wire = await loadWireframe()
    const files = await generateProjectFiles(wire, undefined)
    setStatus('building zip...')
    const blob = await generateZip(files)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(wire?.meta?.name) || 'ui-designer-export'}.zip`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setStatus('downloaded')
  }

  return (
    <div style={{marginTop:12}}>
      <h4>Export</h4>
      <p>Create a runnable project from the current wireframe and download as a ZIP (uses Tailwind CDN for preview).</p>
      <div>
        <button onClick={handleDownloadZip}>Download ZIP</button>
      </div>
      <div style={{marginTop:8}}>Status: {status ?? 'idle'}</div>
    </div>
  )
}
