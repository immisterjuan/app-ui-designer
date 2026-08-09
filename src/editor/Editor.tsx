import React, { useCallback } from 'react'
import ReactFlow, { addEdge, Background, Controls, MiniMap, Node } from 'reactflow'
import 'reactflow/dist/style.css'

import { saveWireframe, loadWireframe } from '../persistence/idb'
import { useAppState } from '../state/useAppState'
import KitRenderer from '../kits/KitRenderer'

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 5 },
    data: { label: 'Container' },
    type: 'default'
  }
]

const initialEdges: any[] = []

export default function Editor(){
  const [nodes, setNodes] = React.useState(initialNodes)
  const [edges, setEdges] = React.useState(initialEdges)
  const currentKit = useAppState((s) => s.currentKit)

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
      <div style={{paddingBottom:8, display:'flex', alignItems:'center'}}>
        <button onClick={handleSave}>Save wireframe</button>
        <button onClick={handleLoad} style={{marginLeft:8}}>Load wireframe</button>
        <div style={{marginLeft:16}}>
          <strong>Current Kit:</strong> {currentKit?.name ?? 'none'}
        </div>
      </div>

      <div style={{flex:1, border:'1px dashed #ddd', display:'flex'}}>
        <div style={{flex:1}}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onConnect={onConnect} fitView>
            <Background gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <div style={{width:320, borderLeft:'1px solid #eee', padding:12}}>
          <h4>Preview</h4>
          {/* simple preview of first node using current kit mapping */}
          {nodes[0] ? (
            <KitRenderer node={{ id: nodes[0].id, type: 'button', props: { text: 'Primary action' } }} mapping={currentKit?.mapping} />
          ) : (
            <div>No selection</div>
          )}

          <div style={{marginTop:12}}>
            <h5>Kit mapping (raw)</h5>
            <pre style={{maxHeight:200, overflow:'auto'}}>{JSON.stringify(currentKit?.mapping ?? {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
