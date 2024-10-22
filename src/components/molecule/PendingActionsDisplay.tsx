'use client'

import { usePathname } from 'next/navigation'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMemo } from 'react'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useOL } from 'rlayers'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'

export default function PendingActionsDisplay() {
  const { pendingGeometry, activeGeometry, setPendingGeometry, setActiveGeometryID, setEditorTool } =
    useInterfaceStore()
  const { map } = useOL()
  const route = usePathname()
  const adapater = useMemo(() => new ApiAdapter(), [])

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

  return route.startsWith('/editor') ? (
    <div className="flex justify-center gap-2 mt-auto p-2 h-min text-sm pointer-events-none grow">
      {pendingGeometry && (
        <div
          className="flex items-center gap-2 bg-black hover:bg-accent px-2 py-1 rounded-md whitespace-nowrap duration-100 cursor-pointer pointer-events-auto"
          onClick={() => {
            if (pendingGeometry.id) {
              adapater.updateGeometry(pendingGeometry.id, pendingGeometry.geojson).then(clearLayers)
            }

            if (!pendingGeometry.id && pendingGeometry.layer) {
              adapater.createGeometry(pendingGeometry.layer, pendingGeometry.geojson).then(clearLayers)
            }
          }}>
          <span className="bg-neutral-800 px-1 py-1 rounded min-w-max text-neutral-400 text-xs shr">Ctrl+S</span>
          Para salvar
        </div>
      )}
      {activeGeometry && (
        <>
          <div
            className="flex items-center gap-2 bg-black hover:bg-accent px-2 py-1 rounded-md whitespace-nowrap duration-100 cursor-pointer pointer-events-auto"
            onClick={() => {
              clearLayers()
            }}>
            <span className="bg-neutral-800 px-1 py-1 rounded text-neutral-400 text-xs">Esc</span>Para cancelar
          </div>
          <div
            className="flex items-center gap-2 bg-black hover:bg-accent px-2 py-1 rounded-md whitespace-nowrap duration-100 cursor-pointer pointer-events-auto"
            onClick={() => {
              if (activeGeometry) {
                adapater.deleteGeometry(activeGeometry.id_geometry).then(clearLayers)
              }
            }}>
            <span className="bg-neutral-800 px-1 py-1 rounded text-neutral-400 text-xs">Delete</span>Para excluir
          </div>
        </>
      )}
    </div>
  ) : null
}
