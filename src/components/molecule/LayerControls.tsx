'use client'

import { CloudArrowUp, FloppyDisk, TrashSimple } from '@phosphor-icons/react'
import MapControl from '../atom/MapControl'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMemo } from 'react'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useOL } from 'rlayers'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'

export default function LayerControls() {
  const { pendingGeometry, setPendingGeometry, setActiveGeometry, setEditorTool, setActiveGeometryID, activeGeometry } =
    useInterfaceStore()
  const { map } = useOL()

  const adapater = useMemo(() => new ApiAdapter(), [])

  function clearPendingLayers() {
    setPendingGeometry(undefined)
    setActiveGeometryID(undefined)
    setEditorTool('Select')
    map.getAllLayers().forEach((l) => {
      console.log('LAYER: ', l)
      if (l instanceof VectorTileLayer || l instanceof VectorLayer) {
        l.getSource()?.refresh()
      }
    })
  }

  return (
    <div className="top-0 left-0 flex justify-center gap-2 p-2 h-min pointer-events-none grow">
      {pendingGeometry && (
        <MapControl
          Icon={CloudArrowUp}
          label={'Salvar'}
          disabled={false}
          active={false}
          className="hover:border-green-600 hover:bg-green-600/60 hover:border text-green-400 hover:text-black"
          text="Salvar Alteração"
          onClick={() => {
            if (!pendingGeometry) return

            if (pendingGeometry.id) {
              adapater.updateGeometry(pendingGeometry.id, pendingGeometry.geojson).then(clearPendingLayers)
            }

            if (!pendingGeometry.id && pendingGeometry.layer) {
              adapater.createGeometry(pendingGeometry.layer, pendingGeometry.geojson).then(clearPendingLayers)
            }
          }}
        />
      )}
      {activeGeometry && (
        <MapControl
          Icon={TrashSimple}
          label={'Remover Geometria [DEL]'}
          disabled={false}
          active={false}
          text="Remover Geometria"
          className="hover:bg-red-600/60 hover:border hover:border-red-600 text-red-400 hover:text-black"
          onClick={() => {
            if (!activeGeometry) return
            adapater.deleteGeometry(activeGeometry.id_geometry).then(clearPendingLayers)
          }}
        />
      )}
    </div>
  )
}
