// import { atom } from 'jotai'

// export const userInterfacePreferences = atom<{
//   activePanel?: 'layers'
//   activeLayer?: number
//   activeMap?: number
// }>({})

import { GeoJSON } from 'ol/format'
import { create } from 'zustand'

type availablePanels = 'layers' | 'compactLayers'

export interface InterfaceStore {
  activePanel?: availablePanels
  activeLayer?: number
  activeMap?: number
  activeGeometryID?: number
  activeGeometry?: API.GEOMETRY.detail
  bBoxLock?: number[]
  editorTool?: 'Lasso' | 'Pen' | 'Circle' | 'Line' | 'Point' | 'Edit' | 'Move' | 'Select' // undefined = move
  pendingGeometry?: {
    layer: number
    id?: number
    geojson: string
  }
  pendingLayer?: number
}

export interface InterfaceAction {
  setActivePanel: (panel?: availablePanels) => void
  setActiveLayer: (layer?: number) => void
  setActiveMap: (map?: number) => void
  setActiveGeometryID: (geometry?: number) => void
  setActiveGeometry: (geometry?: API.GEOMETRY.detail) => void
  setBBoxLock: (lock?: number[]) => void
  setEditorTool: (tool?: InterfaceStore['editorTool']) => void
  setPendingGeometry: (geojson?: InterfaceStore['pendingGeometry']) => void
}

export const useInterfaceStore = create<InterfaceStore & InterfaceAction>((set) => ({
  activePanel: 'layers',
  activeLayer: undefined,
  activeMap: undefined,
  setActivePanel: (panel?: availablePanels) => set({ activePanel: panel }),
  setActiveLayer: (layer?: number) => set({ activeLayer: layer }),
  setActiveMap: (map?: number) => set({ activeMap: map }),
  activeGeometryID: undefined,
  setActiveGeometryID: (geometry?: number) => set({ activeGeometryID: geometry }),
  bBoxLock: undefined,
  activeGeometry: undefined,
  setActiveGeometry: (geometry?: API.GEOMETRY.detail) => set({ activeGeometry: geometry }),
  setBBoxLock: (lock?: number[]) => set({ bBoxLock: lock }),
  editorTool: undefined,
  setEditorTool: (tool?: InterfaceStore['editorTool']) => set({ editorTool: tool }),
  setPendingGeometry: (geojson?: InterfaceStore['pendingGeometry']) => set({ pendingGeometry: geojson }),
}))
