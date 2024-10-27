'use client'

import MapControl from '@/components/controls/MapControl'

import {
  Cursor,
  CursorClick,
  Dot,
  Hand,
  HandGrabbing,
  LineSegments,
  Pencil,
  Polygon,
  Swatches,
  TrashSimple,
} from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMapStore } from '@/core/store/mapStore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, stagger } from 'framer-motion'
import { useOL } from 'rlayers'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { usePathname } from 'next/navigation'
import LayerSettingsModal from '../modal/LayerSettingsModal'
import ConfirmActionModal from '../modal/ConfirmActionModal'

export default function EditorControls() {
  const {
    activeMap,
    activeLayer,
    editorTool,
    setEditorTool,
    activeGeometry,
    pendingGeometry,
    setActiveGeometryID,
    setPendingGeometry,
    setActiveGeometry,
  } = useInterfaceStore()

  const { map } = useOL()
  const { maps, setMaps } = useMapStore()
  const [previousTool, setPreviousTool] = useState<typeof editorTool>(undefined)
  const [showLayerEditor, setShowLayerEditor] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const adapater = useMemo(() => new ApiAdapter(), [])
  const path = usePathname()

  const layerType = useMemo(() => {
    if (typeof activeLayer !== 'number') return 'N/a'
    const layer = maps[activeMap || 0]?.layers.find((l) => l.id_layer === activeLayer)
    if (!layer) return 'N/a'
    return layer.layer_type
  }, [activeLayer, activeMap, maps])

  const swapTool = useCallback(
    (newtool: typeof editorTool) => {
      setPreviousTool(editorTool)
      setEditorTool(newtool)
    },
    [setPreviousTool, setEditorTool, editorTool]
  )

  function clearLayers(includeEdittingCanvas?: boolean) {
    setPendingGeometry(undefined)
    setActiveGeometryID(undefined)
    setEditorTool('Select')
    map.getAllLayers().forEach((l) => {
      if (includeEdittingCanvas) {
        return l.getSource()?.refresh()
      }
      if (l instanceof VectorTileLayer || l instanceof VectorLayer) {
        l.getSource()?.refresh()
      }
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      // check if the currently focused element is an input
      if (document.activeElement instanceof HTMLInputElement) {
        return
      }

      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        if (!pendingGeometry) return

        if (pendingGeometry.id) {
          adapater.updateGeometry(pendingGeometry.id, pendingGeometry.geojson).then(() => {
            clearLayers(true)
            setActiveGeometryID(undefined)
            setActiveGeometry(undefined)
          })
        }

        if (!pendingGeometry.id && pendingGeometry.layer) {
          adapater.createGeometry(pendingGeometry.layer, pendingGeometry.geojson).then(() => {
            clearLayers(true)
            setActiveGeometryID(undefined)
            setActiveGeometry(undefined)
          })
        }
      }
      switch (e.key) {
        case ' ': {
          if (editorTool !== 'Move') {
            swapTool('Move')
          }
          break
        }
        case 'Escape': {
          if (activeGeometry) {
            setActiveGeometryID(undefined)
            setActiveGeometry(undefined)
          }
          if (pendingGeometry) {
            clearLayers(true)
            setPendingGeometry(undefined)
          }
          break
        }
        case 's': {
          setEditorTool('Select')
          break
        }
        case 'e': {
          if (!path.startsWith('/editor')) {
            return
          }
          setEditorTool('Edit')
          break
        }
        case 'p': {
          if (!path.startsWith('/editor')) {
            return
          }
          if (layerType === 'Polygon') {
            setEditorTool('Pen')
          }
          break
        }
        case 'P': {
          if (!path.startsWith('/editor')) {
            return
          }
          if (layerType === 'Point') {
            setEditorTool('Point')
          }
        }
        case 'l': {
          if (!path.startsWith('/editor')) {
            return
          }
          if (layerType === 'LineString') {
            setEditorTool('Line')
          }
          break
        }
        case 'Delete': {
          if (!path.startsWith('/editor')) {
            return
          }
          if (activeGeometry) {
            adapater.deleteGeometry(activeGeometry.id_geometry).then(() => {
              clearLayers(true)
              setActiveGeometryID(undefined)
              setActiveGeometry(undefined)
            })
          }
          break
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorTool, previousTool, setEditorTool, pendingGeometry, activeGeometry]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) {
        return
      }

      switch (e.key) {
        case ' ': {
          if (editorTool === 'Move') {
            setEditorTool(previousTool)
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorTool, previousTool, setEditorTool]
  )

  // Keyboard shortcuts
  useEffect(() => {
    if (!window) {
      return
    } // this is not clientside?

    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [editorTool, handleKeyPress, handleKeyUp])
  const route = usePathname()
  const activeLayerObj = useMemo(() => {
    const mapLayers = maps[activeMap || 0]?.layers
    if (typeof activeLayer !== 'number' || !mapLayers) return

    return mapLayers.find((l) => l.id_layer === activeLayer)
  }, [activeMap, activeLayer, maps])

  return (
    <>
      {showLayerEditor && (
        <LayerSettingsModal
          onClose={() => {
            setShowLayerEditor(false)
          }}
        />
      )}
      {showConfirmDelete && (
        <ConfirmActionModal
          onClose={() => {
            setShowConfirmDelete(false)
          }}
          destructive
          title={`Apagar camada "${activeLayerObj?.name || activeLayer}" ?`}
          description="Ao confirmar, todos os dados associados a esta camada serão apagados permanentemente. Deseja continuar?"
          onConfirm={() => {
            if (typeof activeLayer !== 'number') {
              return
            }

            setShowConfirmDelete(false)
            adapater.deleteLayer(activeLayer).then(() => {
              const currentLayers = maps[activeMap || 0]?.layers
              if (!currentLayers || !activeMap) return

              const layersWithoutActive = currentLayers.filter((l) => l.id_layer !== activeLayer)

              setMaps({
                ...maps,
                [activeMap]: {
                  ...maps[activeMap],
                  layers: layersWithoutActive,
                },
              })
              setShowConfirmDelete(false)
            })
          }}
        />
      )}
      <div className="flex flex-col gap-2 mr-auto p-4 w-min pointer-events-none">
        <MapControl
          side="right"
          Icon={editorTool === 'Move' || editorTool === undefined ? HandGrabbing : Hand}
          label={'Mover'}
          active={editorTool === 'Move' || editorTool === undefined}
          onClick={() => {
            setEditorTool('Move')
          }}
          stagger={{
            i: 0,
            n: 7,
          }}
          shortcut="_"
        />
        <MapControl
          side="right"
          Icon={activeGeometry ? CursorClick : Cursor}
          label={'Selecionar'}
          active={editorTool === 'Select'}
          onClick={() => {
            setEditorTool('Select')
          }}
          shortcut="S"
          stagger={{
            i: 1,
            n: 7,
          }}
        />

        {route.startsWith('/editor') && (
          <>
            <AnimatePresence>
              {activeLayer && (
                <MapControl
                  key="editor.tool.edit"
                  side="right"
                  Icon={Pencil}
                  label={'Editar'}
                  active={editorTool === 'Edit'}
                  disabled={!activeGeometry}
                  shortcut="E"
                  onClick={() => {
                    setEditorTool(editorTool === 'Edit' ? undefined : 'Edit')
                  }}
                />
              )}

              {activeLayer && (
                <motion.hr
                  key="editor.tool.hr.1"
                  transition={{
                    duration: 0.05,
                    bounce: false,
                    delay: stagger(0.1, {})(1.5, 7),
                  }}
                  initial={{
                    y: '-50%',
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: '-100%',
                    opacity: 0,
                  }}
                  className="border-tertiary"
                />
              )}

              {activeLayer && (
                <>
                  <MapControl
                    key="editor.tool.layerEditor"
                    side="right"
                    Icon={Swatches}
                    label={'Customizar camada'}
                    active={showLayerEditor}
                    disabled={typeof activeLayer !== 'number'}
                    shortcut="Shift+C"
                    onClick={() => {
                      setShowLayerEditor(!showLayerEditor)
                    }}
                  />
                  <MapControl
                    key="editor.tool.layerDelete"
                    side="right"
                    Icon={TrashSimple}
                    label={'Apagar Camada'}
                    className="hover:border-white hover:!bg-red-500 border !border-red-400 text-red-400 hover:text-white"
                    disabled={typeof activeLayer !== 'number'}
                    onClick={() => {
                      setShowConfirmDelete(true)
                    }}
                  />
                </>
              )}

              {activeLayer && (
                <motion.hr
                  key="editor.tool.divider.2"
                  transition={{
                    duration: 0.05,
                    bounce: false,
                    delay: stagger(0.1, {})(1.5, 7),
                  }}
                  initial={{
                    y: '-50%',
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: '-100%',
                    opacity: 0,
                  }}
                  className="border-tertiary"
                />
              )}

              {activeLayer && (
                <MapControl
                  key="editor.tool.dot"
                  side="right"
                  Icon={Dot}
                  label={'Ponto'}
                  disabled={!!pendingGeometry || !!activeGeometry || layerType !== 'Point'}
                  active={layerType === 'Point' && editorTool === 'Point'}
                  onClick={() => {
                    setActiveGeometryID(undefined)
                    setEditorTool(editorTool === 'Point' ? undefined : 'Point')
                  }}
                  shortcut="Shift+P"
                  stagger={{
                    i: 3,
                    n: 7,
                  }}
                />
              )}

              {activeLayer && (
                <MapControl
                  key="editor.tool.line"
                  side="right"
                  Icon={LineSegments}
                  label={'Linha'}
                  disabled={!!pendingGeometry || !!activeGeometry || layerType !== 'LineString'}
                  active={layerType === 'LineString' && editorTool === 'Line'}
                  onClick={() => {
                    setActiveGeometryID(undefined)
                    setEditorTool(editorTool === 'Line' ? undefined : 'Line')
                  }}
                  stagger={{
                    i: 4,
                    n: 7,
                  }}
                  shortcut="L"
                />
              )}

              {activeLayer && (
                <MapControl
                  key="editor.tool.polygon"
                  side="right"
                  Icon={Polygon}
                  label={'Polígono'}
                  disabled={!!pendingGeometry || !!activeGeometry || layerType !== 'Polygon'}
                  active={layerType === 'Polygon' && editorTool === 'Pen'}
                  onClick={() => {
                    setActiveGeometryID(undefined)
                    setEditorTool(editorTool === 'Pen' ? undefined : 'Pen')
                  }}
                  stagger={{
                    i: 5,
                    n: 7,
                  }}
                  shortcut="P"
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  )
}
