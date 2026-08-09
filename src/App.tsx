import React from 'react'
import Editor from './editor/Editor'
import KitPanel from './kits/KitPanel'
import OAuthPanel from './github/OAuthPanel'
<<<<<<< HEAD
import TokenManager from './github/TokenManager'
=======
>>>>>>> feature/github-oauth

export default function App() {
  return (
    <div className="app-shell">
      <header style={{padding:12, borderBottom:'1px solid #eee'}}>
        <h1>App UI Designer</h1>
      </header>

      <main style={{display:'flex', height:'calc(100vh - 68px)'}}>
<<<<<<< HEAD
        <aside style={{width:320, borderRight:'1px solid #eee', padding:12, overflow:'auto'}}>
          <OAuthPanel />
          <TokenManager />
=======
        <aside style={{width:300, borderRight:'1px solid #eee', padding:12, overflow:'auto'}}>
          <OAuthPanel />
>>>>>>> feature/github-oauth
          <hr />
          <KitPanel />
          <hr />
          <h3 style={{marginTop:12}}>Palette</h3>
          <p>Generic primitives: Container, Text, Image, Button, Input</p>
        </aside>

        <section style={{flex:1, padding:12}}>
          <Editor />
        </section>

        <aside style={{width:320, borderLeft:'1px solid #eee', padding:12}}>
          <h3>Inspector</h3>
          <p>Selected item properties and kit mapping</p>
        </aside>
      </main>

      <footer style={{padding:8, borderTop:'1px solid #eee'}}>
        <small>Offline-capable PWA · GitHub commit integration · AI helpers (user-provided keys)</small>
      </footer>
    </div>
  )
}
