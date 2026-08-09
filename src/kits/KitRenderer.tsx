import React from 'react'

type ComponentNode = { id: string; type: string; props?: any }

export default function KitRenderer({ node, mapping }: { node: ComponentNode; mapping?: Record<string, any> }) {
  const map = mapping?.[node.type]
  if (!map) {
    return <div style={{ padding: 8, border: '1px dashed #ccc' }}>{node.props?.text ?? node.type}</div>
  }

  const Tag = (map.tag || 'div') as any
  const className = [map.className, node.props?.className].filter(Boolean).join(' ')
  const children = node.props?.children ?? node.props?.text

  const props: any = {}
  if (map.props) {
    for (const [k, v] of Object.entries(map.props)) props[k] = v
  }

  return React.createElement(Tag, { className, ...props }, children)
}
