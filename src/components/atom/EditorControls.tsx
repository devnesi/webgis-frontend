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
// eslint-disable-next-line react-hooks/rules-of-hooks

export default function EditorControls() {
  const { activeMap, activeLayer, setPendingGeometry, editorTool, setEditorTool, activeGeometry, pendingGeometry } =
    useInterfaceStore()

  const { map } = useOL()

  const maps = useMapStore((state) => state.maps)

  const layerType = useMemo(() => {
    if (!activeLayer) return 'N/a'
    const layer = maps[activeMap || 0]?.layers.find((l) => l.id_layer === activeLayer)
    if (!layer) return 'N/a'
    return layer.layer_type
  }, [activeLayer, activeMap, maps])

  const adapater = useMemo(() => new ApiAdapter(), [])

  const uploadEditedGeometry = () => {
    if (!pendingGeometry || !map) {
      return
    }

    if (pendingGeometry.id) {
      adapater.updateGeometry(pendingGeometry.id, pendingGeometry.geojson).then(() => {
        setPendingGeometry(undefined)
        map.getAllLayers().forEach((l) => {
          if (l instanceof VectorTileLayer) {
            l.getSource()?.refresh()
          }
        })
      })
    }

    if (!pendingGeometry.id && pendingGeometry.layer) {
      adapater.createGeometry(pendingGeometry.layer, pendingGeometry.geojson).then(() => {
        setPendingGeometry(undefined)
        map.getAllLayers().forEach((l) => {
          if (l instanceof VectorTileLayer) {
            l.getSource()?.refresh()
          }
        })
      })
    }

    // TODO: Refresh map view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  return (
    <>
      <div className="flex flex-col gap-2 mr-auto p-4 pointer-events-auto">
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
              disabled={layerType !== 'Point'}
              active={layerType === 'Point' && editorTool === 'Point'}
              onClick={() => {
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
              disabled={layerType !== 'LineString'}
              active={layerType === 'LineString' && editorTool === 'Line'}
              onClick={() => {
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
              disabled={layerType !== 'Polygon'}
              active={layerType === 'Polygon' && editorTool === 'Pen'}
              onClick={() => {
                setEditorTool(editorTool === 'Pen' ? undefined : 'Pen')
              }}
              stagger={{
                i: 5,
                n: 7,
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
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
        </AnimatePresence>
      </div>
      <div className="absolute flex justify-center items-end w-full h-full pointer-events-none">
        <button
          className="bg-black mb-12 p-4 rounded-full pointer-events-auto"
          onClick={() => {
            uploadEditedGeometry()
          }}>
          Salvar as bagaça
        </button>
      </div>
    </>
  )
}
