import React, { useState, useEffect } from 'react'
import { saveSetting, loadSetting } from '../persistence/idb'

export default function AIPanel(){
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('Create a simple mobile app wireframe with a header, list of items and a primary button. Output JSON with pages -> components, each component with type and props.')

  useEffect(()=>{
    async function load(){
      const k = await loadSetting('ai:openai_key')
      if(k) setApiKey(k)
    }
    load()
  }, [])

  async function handleSaveKey(){
    await saveSetting('ai:openai_key', apiKey)
    alert('API key saved locally in your browser (IndexedDB).')
  }

  async function handleGenerate(){
    if(!apiKey) return alert('Provide your OpenAI API key first')
    setStatus('calling AI...')
    try{
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 800 })
      })
      if(!res.ok){
        const text = await res.text()
        throw new Error('AI call failed: ' + text)
      }
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      // attempt to parse JSON from the model output
      const jsonStart = content.indexOf('{')
      const json = jsonStart >= 0 ? content.slice(jsonStart) : content
      const parsed = JSON.parse(json)
      // save wireframe to IndexedDB as latest
      const { saveWireframe } = await import('../persistence/idb')
      await saveWireframe(parsed)
      setStatus('wireframe saved')
      alert('Wireframe generated and saved to local storage. Open Editor to view.')
    }catch(err:any){
      console.error(err)
      setStatus('error')
      alert('AI generation failed: ' + (err.message ?? err))
    }
  }

  return (
    <div style={{marginTop:12}}>
      <h4>AI Assistant</h4>
      <div>
        <input placeholder="OpenAI API key" value={apiKey} onChange={(e)=>setApiKey(e.target.value)} style={{width:'100%'}} />
        <div style={{marginTop:8}}>
          <button onClick={handleSaveKey}>Save API key</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} style={{width:'100%', minHeight:100}} />
        <div style={{marginTop:8}}>
          <button onClick={handleGenerate}>Generate wireframe</button>
        </div>
      </div>

      <div style={{marginTop:8}}>Status: {status ?? 'idle'}</div>
    </div>
  )
}
