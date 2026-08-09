import { openDB } from 'idb'

const DB_NAME = 'app-ui-designer-db'
const DB_VERSION = 1

async function getDb(){
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db){
      if(!db.objectStoreNames.contains('wireframes')){
        db.createObjectStore('wireframes')
      }
      if(!db.objectStoreNames.contains('kits')){
        db.createObjectStore('kits')
      }
      if(!db.objectStoreNames.contains('settings')){
        db.createObjectStore('settings')
      }
    }
  })
}

export async function saveWireframe(wireframe: any, key = 'latest'){
  const db = await getDb()
  await db.put('wireframes', wireframe, key)
}

export async function loadWireframe(key = 'latest'){
  const db = await getDb()
  return db.get('wireframes', key)
}

export async function saveKit(manifest: any, key: string){
  const db = await getDb()
  await db.put('kits', manifest, key)
}

export async function loadKit(key: string){
  const db = await getDb()
  return db.get('kits', key)
}
