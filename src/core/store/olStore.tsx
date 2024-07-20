import { create } from 'zustand'
import { fromLonLat } from 'ol/proj'

export interface OlStore {
  view: RView
}

export interface OlAction {
  setView: (view: RView) => void
}

export const useOlStore = create<OlStore & OlAction>((set) => ({
  view: {
    center: fromLonLat([-49.37, -28.685]),
    zoom: 14,
  },
  setView: (view: RView) => set({ view }),
}))
