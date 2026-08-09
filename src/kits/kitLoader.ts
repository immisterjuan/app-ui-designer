// kitLoader: placeholder for downloading and registering UI kits

export type KitManifest = {
  id: string
  name: string
  version: string
  css?: string[] // urls or blob keys
  mapping?: Record<string, any>
  license?: string
}

export async function fetchKitManifest(manifestUrl: string): Promise<KitManifest> {
  const res = await fetch(manifestUrl)
  if(!res.ok) throw new Error('Failed to fetch kit manifest')
  return res.json()
}

// TODO: implement downloading assets, unzipping, storing in IndexedDB and Cache Storage
export async function downloadKit(manifestUrl: string){
  const manifest = await fetchKitManifest(manifestUrl)
  // placeholder behavior
  return manifest
}
