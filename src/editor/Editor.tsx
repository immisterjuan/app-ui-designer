import React, { useCallback } from 'react'
import ReactFlow, { addEdge, Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'

import { saveWireframe, loadWireframe } from '../persistence/idb'

const initialNodes = [
  {
    id: '1',
    position: { x: 250, y: 5 },
    data: { label: 'Container' }
  }
]

const initialEdges: any[] = []

export default function Editor(){
  const [nodes, setNodes] = React.useState(initialNodes)
  const [edges, setEdges] = React.useState(initialEdges)

  const onNodesChange = useCallback((changes:any) => {
    // reactflow helper can be wired in; keep simple for now
  }, [])

  const onConnect = useCallback((params:any) => setEdges((eds) => addEdge(params, eds)), [])

  async function handleSave(){
    const wire = { meta: { name: 'untitled' }, pages: [ { id: 'p1', name: 'Page 1', components: nodes } ] }
    await saveWireframe(wire)
    alert('Saved wireframe to IndexedDB (demo)')
  }

  async function handleLoad(){
    const wire = await loadWireframe()
    if(!wire) return alert('No wireframe saved')
    alert('Loaded wireframe: ' + (wire.meta?.name ?? 'unknown'))
  }

  return (
    <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div style={{paddingBottom:8}}>
        <button onClick={handleSave}>Save wireframe</button>
        <button onClick={handleLoad} style={{marginLeft:8}}>Load wireframe</button>
      </div>

      <div style={{flex:1, border:'1px dashed #ddd'}}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onConnect={onConnect} fitView>
          <Background gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}
