// import { atom } from 'jotai'

// export const userInterfacePreferences = atom<{
//   activePanel?: 'layers'
//   activeLayer?: number
//   activeMap?: number
// }>({})

import { create } from 'zustand'

export interface InterfaceStore {
  activePanel?: 'layers'
  activeLayer?: number
  activeMap?: number
  activeGeometryID?: number
  activeGeometry?: API.GEOMETRY.detail
  bBoxLock?: number[]
  editorTool?: 'Lasso' | 'Pen' | 'Circle' | 'Line' | 'Point' | 'Selection'
}

export interface InterfaceAction {
  setActivePanel: (panel?: 'layers') => void
  setActiveLayer: (layer?: number) => void
  setActiveMap: (map?: number) => void
  setActiveGeometryID: (geometry?: number) => void
  setActiveGeometry: (geometry?: API.GEOMETRY.detail) => void
  setBBoxLock: (lock?: number[]) => void
  setEditorTool: (tool?: InterfaceStore['editorTool']) => void
}

export const useInterfaceStore = create<InterfaceStore & InterfaceAction>((set) => ({
  activePanel: 'layers',
  activeLayer: undefined,
  activeMap: undefined,
  setActivePanel: (panel?: 'layers') => set({ activePanel: panel }),
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
}))
