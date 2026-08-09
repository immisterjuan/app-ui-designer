// persistence/idb.ts - updated with token helpers
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

export async function saveSetting(key: string, value: any){
  const db = await getDb()
  await db.put('settings', value, key)
}

export async function loadSetting(key: string){
  const db = await getDb()
  return db.get('settings', key)
}

// Token helpers
export async function saveToken(token: string){
  return saveSetting('github:access_token', token)
}

export async function loadToken(){
  return loadSetting('github:access_token')
}

export async function deleteToken(){
  const db = await getDb()
  return db.delete('settings', 'github:access_token')
}
