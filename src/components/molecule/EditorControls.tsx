'use client'

import MapControl from '@/components/atom/MapControl'
import * as Portal from '@radix-ui/react-portal'
import {
  Cursor,
  CursorClick,
  Dot,
  Hand,
  HandGrabbing,
  LineSegments,
  Palette,
  Pencil,
  Polygon,
  Swatches,
  UploadSimple,
  X,
} from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMapStore } from '@/core/store/mapStore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, stagger } from 'framer-motion'
import { useOL } from 'rlayers'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { HexAlphaColorPicker } from 'react-colorful'
// eslint-disable-next-line react-hooks/rules-of-hooks

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
  } = useInterfaceStore()

  const { map } = useOL()
  const maps = useMapStore((state) => state.maps)
  const [previousTool, setPreviousTool] = useState<typeof editorTool>(undefined)
  const [showLayerEditor, setShowLayerEditor] = useState(false)
  const adapater = useMemo(() => new ApiAdapter(), [])
  const [activeLayerData, setActiveLayerData] = useState<API.RAW.Layer | undefined>(undefined)

  const [layerEditorFillColor, setLayerEditorFillColor] = useState(
    activeLayerData ? activeLayerData?.style?.fill || '#0193e6' : '#0193e6'
  )
  const [layerEditorStrokeColor, setLayerEditorStrokeColor] = useState(
    activeLayerData ? activeLayerData?.style?.stroke || '#00f0ff' : '#00f0ff'
  )
  const layerEditorNameInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!activeLayer) return
    const layer = maps[activeMap || 0]?.layers.find((l) => l.id_layer === activeLayer)
    if (!layer) return

    setLayerEditorFillColor(layer.style?.fill || '#0193e6')
    setLayerEditorStrokeColor(layer.style?.stroke || '#00f0ff')
    setActiveLayerData(layer)
  }, [activeLayer, setActiveLayerData, maps, activeMap, setLayerEditorFillColor, setLayerEditorStrokeColor])

  const layerType = useMemo(() => {
    if (!activeLayer) return 'N/a'
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
      if (includeEdittingCanvas ? l instanceof VectorLayer : l instanceof VectorTileLayer || l instanceof VectorLayer) {
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
        console.log('Saving geometry', pendingGeometry)

        if (!pendingGeometry) return

        if (pendingGeometry.id) {
          adapater.updateGeometry(pendingGeometry.id, pendingGeometry.geojson).then(clearLayers)
        }

        if (!pendingGeometry.id && pendingGeometry.layer) {
          adapater.createGeometry(pendingGeometry.layer, pendingGeometry.geojson).then(clearLayers)
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
          }
          clearLayers(true)
          break
        }
        case 's': {
          setEditorTool('Select')
          break
        }
        case 'e': {
          setEditorTool('Edit')
          break
        }
        case 'p': {
          if (layerType === 'Polygon') {
            setEditorTool('Pen')
          }
          break
        }
        case 'P': {
          if (layerType === 'Point') {
            setEditorTool('Point')
          }
        }
        case 'l': {
          if (layerType === 'LineString' || layerType === 'Line') {
            setEditorTool('Line')
          }
          break
        }
        case 's': {
          setEditorTool('Select')
          break
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorTool, previousTool, setEditorTool, pendingGeometry]
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

  return (
    <>
      {showLayerEditor && (
        <Portal.Root className="top-0 left-0 z-[99] fixed flex justify-center items-center bg-black/80 backdrop-blur-sm w-screen h-screen">
          <div className="flex flex-col gap-4 bg-secondary pb-4 rounded-md w-1/2 h-[60vh] h-full min-h-0">
            <div className="flex justify-between border-neutral-800 px-4 py-4 pb-2 border-b">
              <h3 className="px-2 text-lg">{activeLayerData?.name || 'Unknown?'}</h3>
              <X
                size={24}
                className="hover:text-red-400 duration-100 cursor-pointer"
                onClick={() => {
                  setShowLayerEditor(false)
                }}
              />
            </div>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              <div className="relative border-neutral-800 focus-within:border-accent mx-4 px-3 pt-2.5 pb-1.5 border rounded-md focus-within:ring focus-within:ring-accent/30 duration-200 group">
                <div className="flex justify-between">
                  <label className="group-focus-within:text-white font-medium text-gray-400 text-muted-foreground text-xs">
                    Nome
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="name"
                    name="name"
                    defaultValue={activeLayerData?.name}
                    ref={layerEditorNameInput}
                    className="block border-0 border-white/10 bg-transparent file:my-1 p-0 focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-muted-foreground/90 focus:outline-none sm:leading-7"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 border-neutral-800 mx-4 p-2 border rounded-md">
                <h6 className="flex items-center gap-1 text-neutral-500 text-sm">
                  <Palette /> Cor de preenchimento
                </h6>
                <HexAlphaColorPicker
                  className="!w-full !max-w-none"
                  color={layerEditorFillColor}
                  onChange={setLayerEditorFillColor}
                />
              </div>
              <div className="flex flex-col gap-2 border-neutral-800 mx-4 p-2 border rounded-md">
                <h6 className="flex items-center gap-1 text-neutral-500 text-sm">
                  <Palette /> Cor de borda
                </h6>
                <HexAlphaColorPicker
                  className="!w-full !max-w-none"
                  color={layerEditorStrokeColor}
                  onChange={setLayerEditorStrokeColor}
                />
              </div>
              <div
                className="flex items-center gap-2 bg-primary hover:bg-accent mr-4 ml-auto px-4 py-2 rounded-md duration-100 cursor-pointer"
                onClick={() => {
                  if (!activeLayerData) return

                  adapater
                    .updateLayerSpecification({
                      ...activeLayerData,
                      name: layerEditorNameInput.current?.value || activeLayerData.name,
                      style: {
                        fill: layerEditorFillColor,
                        stroke: layerEditorStrokeColor,
                      },
                    })
                    .then(() => {
                      setShowLayerEditor(false)
                      clearLayers(true)
                    })
                }}>
                <UploadSimple /> salvar
              </div>
            </div>
          </div>
        </Portal.Root>
      )}
      <div className="flex flex-col gap-2 mr-auto p-4 w-min pointer-events-none">
        <MapControl
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
        <AnimatePresence>
          {activeLayer && (
            <MapControl
              Icon={Pencil}
              label={'Editar'}
              active={editorTool === 'Edit'}
              disabled={!activeLayer}
              shortcut="E"
              onClick={() => {
                setEditorTool(editorTool === 'Edit' ? undefined : 'Edit')
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {activeLayer && (
            <motion.hr
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
        </AnimatePresence>
        <AnimatePresence>
          {activeLayer && (
            <MapControl
              Icon={Swatches}
              label={'Customizar camada'}
              active={showLayerEditor}
              disabled={!activeLayer}
              shortcut="Shift+C"
              onClick={() => {
                setShowLayerEditor(!showLayerEditor)
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {activeLayer && (
            <motion.hr
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
        </AnimatePresence>
        <AnimatePresence>
          {activeLayer && (
            <MapControl
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
        </AnimatePresence>
        <AnimatePresence>
          {activeLayer && (
            <MapControl
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
        </AnimatePresence>
        <AnimatePresence>
          {activeLayer && (
            <MapControl
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
        {/* <AnimatePresence>
          {activeLayer && (
            <MapControl
              Icon={Faders}
              label={'Configurações'}
              disabled={!activeLayer}
              active={false}
              stagger={{
                i: 6,
                n: 7,
              }}
              onClick={() => {
                // TODO: Open layer config modal
              }}
            />
          )}
        </AnimatePresence> */}
      </div>
      {/* <div className="top-4 absolute flex justify-center items-start w-full h-min pointer-events-none">
        <button
          className="bg-black mb-12 p-4 rounded-full pointer-events-auto"
          onClick={() => {

          }}>
          Salvar as bagaça
        </button>
      </div> */}
    </>
  )
}
