import create from 'zustand'
import { KitManifest } from '../kits/kitLoader'

type AppState = {
  currentKit?: KitManifest | null
  setCurrentKit: (kit: KitManifest | null) => void
}

export const useAppState = create<AppState>((set) => ({
  currentKit: null,
  setCurrentKit: (kit) => set({ currentKit: kit })
}))
