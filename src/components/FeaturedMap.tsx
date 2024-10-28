'use client'

import { useEffect, useMemo } from 'react'
import BaseMap from './BaseMap'
import MapLayers from './rendering/MapLayers'
import { DndContext } from '@dnd-kit/core'
import MapManager from './controls/MapManager'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useMapStore } from '@/core/store/mapStore'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import LayerSelector from './rendering/SelectedLayers'
import MagneticLayer from './behavior/Magnetic'

export default function FeaturedMap({ children }: { children?: React.ReactNode | React.ReactNode[] }) {
  const { maps, setMaps } = useMapStore()
  const { activeMap, setActiveMap } = useInterfaceStore()

  const adapter = useMemo(() => {
    return new ApiAdapter()
  }, [])

  useEffect(() => {
    ;(async () => {
      const availableMaps = await adapter.getAvailableMaps()
      const newMapList: typeof maps = {}

      for (const map of availableMaps) {
        const layers = await adapter.getAvailableLayers(map.id_map)
        newMapList[map.id_map] = {
          ...map,
          layers,
        }
      }

      setMaps(newMapList)
      if (!activeMap) {
        setActiveMap(parseInt(localStorage.getItem('lastMap') || '0') || Number(Object.keys(newMapList)[0]))
      }
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMap])

  const map = useMemo(() => maps[activeMap || 0], [activeMap, maps])

  return (
    <>
      <BaseMap>
        <DndContext>
          <MapLayers map={map} layers={map?.layers || []} />
        </DndContext>
        <MapManager>{children}</MapManager>
        <LayerSelector />
        <MagneticLayer />
      </BaseMap>
    </>
  )
}
