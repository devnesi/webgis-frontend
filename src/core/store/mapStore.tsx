import { create } from 'zustand'

export type ExtendedMap = API.RAW.Map & { layers: API.RAW.Layer[] }

export interface MapStore {
  maps: {
    [key: number]: ExtendedMap
  }
}

export interface MapAction {
  setMaps: (maps: MapStore['maps']) => void
}

export const useMapStore = create<MapStore & MapAction>((set) => ({
  maps: [],
  setMaps: (maps: MapStore['maps']) => set({ maps }),
}))
