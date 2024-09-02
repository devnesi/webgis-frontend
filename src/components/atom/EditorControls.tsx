'use client'

import MapControl from '@/components/atom/MapControl'
import { Dot, Hand, HandGrabbing, Lasso, LineSegments, Pencil, Polygon, Selection } from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMapStore } from '@/core/store/mapStore'
import { useMemo } from 'react'
import { ApiAdapter } from '@/core/adapter/apiAdapter'

export default function EditorControls() {
  const { activeMap, activeLayer, activePanel, editorTool, setEditorTool, activeGeometry } = useInterfaceStore()
  const maps = useMapStore((state) => state.maps)
  const layerType = useMemo(() => {
    if (!activeLayer) return 'N/a'
    const layer = maps[activeMap || 0]?.layers.find((l) => l.id_layer === activeLayer)
    if (!layer) return 'N/a'
    return layer.layer_type
  }, [activeLayer, activeMap, maps])

  return activePanel ? (
    <div className="flex flex-col gap-2 mr-auto p-4 pointer-events-auto">
      <MapControl
        Icon={editorTool === undefined ? HandGrabbing : Hand}
        label={'Mover'}
        active={editorTool === undefined}
        onClick={() => {
          setEditorTool(undefined)
        }}
      />
      <MapControl
        Icon={Pencil}
        label={'Editar'}
        active={editorTool === 'Selection'}
        disabled={!activeGeometry}
        onClick={() => {
          setEditorTool(editorTool === 'Selection' ? undefined : 'Selection')
        }}
      />
      <hr className="border-tertiary" />
      <MapControl
        Icon={Dot}
        label={'Ponto'}
        disabled={layerType !== 'Point'}
        active={layerType === 'Point' && editorTool === 'Point'}
        onClick={() => {
          setEditorTool(editorTool === 'Point' ? undefined : 'Point')
        }}
      />
      <hr className="border-tertiary" />
      <MapControl
        Icon={LineSegments}
        label={'Linha'}
        disabled={layerType !== 'LineString'}
        active={layerType === 'LineString' && editorTool === 'Line'}
        onClick={() => {
          setEditorTool(editorTool === 'Line' ? undefined : 'Line')
        }}
      />
      <hr className="border-tertiary" />
      <MapControl
        Icon={Lasso}
        label={'Laço'}
        disabled={layerType !== 'Polygon'}
        active={layerType === 'Polygon' && editorTool === 'Lasso'}
        onClick={() => {
          setEditorTool(editorTool === 'Lasso' ? undefined : 'Lasso')
        }}
      />
      <MapControl
        Icon={Polygon}
        label={'Polígono'}
        disabled={layerType !== 'Polygon'}
        active={layerType === 'Polygon' && editorTool === 'Pen'}
        onClick={() => {
          console.log('Polygoing')
          setEditorTool(editorTool === 'Pen' ? undefined : 'Pen')
        }}
      />
    </div>
  ) : null
}
