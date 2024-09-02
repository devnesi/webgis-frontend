'use client'

import { toLonLat } from 'ol/proj'
import clsx from 'clsx'
import { useMapStore } from '@/core/store/mapStore'
import { useOlStore } from '@/core/store/olStore'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMemo } from 'react'

export interface IDevMapState {
  extraData?: { [key: string]: string | number }
}

export default function DevMapState({ extraData }: IDevMapState) {
  const view = useOlStore((state) => state.view)
  const { activeLayer, activeMap, activePanel, activeGeometryID, activeGeometry, bBoxLock, editorTool } =
    useInterfaceStore()
  const maps = useMapStore((state) => state.maps)
  const layerType = useMemo(() => {
    if (!activeLayer) return 'N/a'
    const layer = maps[activeMap || 0]?.layers.find((l) => l.id_layer === activeLayer)
    if (!layer) return 'N/a'
    return layer.layer_type
  }, [activeLayer, activeMap, maps])

  return (
    <div
      className={clsx(
        'bottom-4 left-1/2 absolute border-zinc-800 bg-zinc-900 border rounded-md text-white text-xs -translate-x-1/2 overflow-hidden',
        {
          hidden: process.env.NODE_ENV !== 'development',
        }
      )}>
      <div className="backdrop-blur-sm p-4 w-full h-full">
        <div>
          Center:
          <strong className="mx-1">
            [
            {`${toLonLat(view.center)[1].toFixed(3)}°,
                ${toLonLat(view.center)[0].toFixed(3)}°`}
            ]
          </strong>
        </div>
        <div>
          Zoom level: <strong className="mx-1">{Math.round(view.zoom)}</strong>
        </div>
        <div>
          Resolution:
          <strong className="mx-1">{view.resolution && view.resolution.toFixed(2)}m/pixel</strong>
        </div>
        <div>
          Downloaded maps:
          <strong className="mx-1">{Object.keys(maps).length}</strong>
        </div>
        <div>
          Downloaded layers:
          <strong className="mx-1">
            {Object.values(maps)
              .map((map) => map.layers.length)
              .reduce((p, c) => p + c, 0)}
          </strong>
        </div>
        <div>
          Active map:
          <strong className="mx-1">{activeMap || 'n/a'}</strong>
        </div>
        <div>
          Layers on active map:
          <strong className="mx-1">{maps[activeMap || 0]?.layers.length}</strong>
        </div>
        <div>
          Enabled layers on active map:
          <strong className="mx-1">{maps[activeMap || 0]?.layers.filter((m) => m.enabled).length}</strong>
        </div>
        <div>
          active layer:
          <strong className="mx-1">{activeLayer || 'N/a'}</strong>
        </div>
        <div>
          active layer type:
          <strong className="mx-1">{activeLayer ? layerType : 'N/a'}</strong>
        </div>
        <div>
          active geometry:
          <strong className="mx-1">{activeGeometryID || 'N/a'}</strong>
        </div>
        <div>
          Locked bBox?
          <strong className="mx-1">{bBoxLock || 'No'}</strong>
        </div>
        <div>
          Active drawing tool
          <strong className="mx-1">{editorTool || 'No'}</strong>
        </div>
        {extraData &&
          Object.keys(extraData).map((k, i) => {
            return (
              <div key={`${k}.${i}`}>
                {k} is
                <strong className="mx-1">{extraData[k]}</strong>
              </div>
            )
          })}
      </div>
    </div>
  )
}
