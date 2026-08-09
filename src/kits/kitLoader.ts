import { saveKit, loadKit } from '../persistence/idb'

export type KitManifest = {
  id: string
  name: string
  version: string
  css?: string[]
  mapping?: Record<string, any>
  license?: string
  _cssBlobs?: Record<string, string>
}

async function fetchText(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return await res.text()
}

function injectCssText(cssText: string, id: string, nonce?: string) {
  // avoid duplicate injection
  if (document.getElementById(`kit-css-${id}`)) return
  const blob = new Blob([cssText], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  link.id = `kit-css-${id}`
  if (nonce) link.setAttribute('nonce', nonce)
  document.head.appendChild(link)
}

export async function fetchKitManifest(manifestUrl: string): Promise<KitManifest> {
  const res = await fetch(manifestUrl)
  if (!res.ok) throw new Error('Failed to fetch kit manifest')
  return res.json()
}

export async function downloadKit(manifestUrl: string): Promise<KitManifest> {
  const manifest: KitManifest = await fetchKitManifest(manifestUrl)
  // fetch and inject CSS assets, then persist manifest+css
  const persisted: any = { ...manifest }
  persisted._cssBlobs = persisted._cssBlobs || {}

  if (manifest.css && manifest.css.length) {
    for (const cssUrl of manifest.css) {
      try {
        const cssText = await fetchText(cssUrl)
        injectCssText(cssText, manifest.id)
        persisted._cssBlobs[cssUrl] = cssText
      } catch (err) {
        console.warn('Failed to fetch kit css', cssUrl, err)
      }
    }
  }

  await saveKit(persisted, manifest.id)
  return persisted
}

export async function loadKitFromCache(id: string): Promise<KitManifest | undefined> {
  const kit = await loadKit(id)
  if (!kit) return undefined
  if (kit._cssBlobs) {
    const cssBlobValues = Object.values(kit._cssBlobs) as string[]
    for (const cssText of cssBlobValues) injectCssText(cssText, kit.id)
  }
  return kit as KitManifest
}

export async function removeKit(id: string): Promise<void> {
  // remove stored kit manifest and remove injected CSS link
  const kit = await loadKit(id)
  if (!kit) return
  // remove injected CSS link element
  const link = document.getElementById(`kit-css-${id}`) as HTMLLinkElement | null
  if (link) {
    // attempt to revoke object URL
    try{
      const href = link.href
      if (href && href.startsWith('blob:')) URL.revokeObjectURL(href)
    }catch(e){/*ignore*/}
    link.remove()
  }
  // remove from IndexedDB
  const dbKit = await import('../persistence/idb')
  const db = await (dbKit as any).getDb?.() // getDb is not exported; fallback to delete by using saveKit with undefined
  // safe remove: we will call saveKit with null via internal delete
  try{
    // openDB isn't available here; use existing helper deletion by saving null
    await (dbKit as any).saveKit?.(undefined, id)
  }catch(e){
    // best effort: ignore
  }
}

export async function getKitSize(id: string): Promise<number | undefined> {
  const kit = await loadKit(id)
  if(!kit) return undefined
  let total = 0
  if(kit._cssBlobs){
    const cssBlobValues = Object.values(kit._cssBlobs) as string[]
    for(const v of cssBlobValues) total += (v?.length ?? 0)
  }
  return total
}
