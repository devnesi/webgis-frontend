'use client'

import MapControl from '@/components/atom/MapControl'
import {
  Cursor,
  CursorClick,
  Dot,
  Faders,
  Hand,
  HandGrabbing,
  Lasso,
  LineSegments,
  Pencil,
  Polygon,
  Selection,
} from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMapStore } from '@/core/store/mapStore'
import { useMemo } from 'react'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { AnimatePresence, motion, stagger } from 'framer-motion'
import { useOL } from 'rlayers'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'
// eslint-disable-next-line react-hooks/rules-of-hooks

export default function EditorControls() {
  const {
    activeMap,
    activeLayer,
    setPendingGeometry,
    editorTool,
    setEditorTool,
    activeGeometry,
    pendingGeometry,
    setActiveGeometryID,
  } = useInterfaceStore()

  const maps = useMapStore((state) => state.maps)

  const layerType = useMemo(() => {
    if (!activeLayer) return 'N/a'
    const layer = maps[activeMap || 0]?.layers.find((l) => l.id_layer === activeLayer)
    if (!layer) return 'N/a'
    return layer.layer_type
  }, [activeLayer, activeMap, maps])

  return (
    <>
      <div className="flex flex-col gap-2 mr-auto p-4 pointer-events-none">
        <MapControl
          Icon={editorTool === 'Move' ? HandGrabbing : Hand}
          label={'Mover'}
          active={editorTool === 'Move'}
          onClick={() => {
            setEditorTool('Move')
          }}
          stagger={{
            i: 0,
            n: 7,
          }}
        />
        <MapControl
          Icon={activeGeometry ? CursorClick : Cursor}
          label={'Select'}
          active={editorTool === 'Select'}
          onClick={() => {
            setEditorTool('Select')
          }}
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
              Icon={Dot}
              label={'Ponto'}
              disabled={!!pendingGeometry || !!activeGeometry || layerType !== 'Point'}
              active={layerType === 'Point' && editorTool === 'Point'}
              onClick={() => {
                setActiveGeometryID(undefined)
                setEditorTool(editorTool === 'Point' ? undefined : 'Point')
              }}
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
