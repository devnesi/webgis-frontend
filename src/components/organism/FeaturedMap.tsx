'use client'

import { useEffect, useMemo } from 'react'
import BaseMap from '../atom/BaseMap'
import MapLayers from '../atom/MapLayers'
import MapManager from './MapManager'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useMapStore } from '@/core/store/mapStore'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import LayerEditor from '../molecule/LayerEditor'

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
        setActiveMap(Number(Object.keys(newMapList)[0]))
      }
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMap])

  return (
    <>
      <BaseMap>
        <MapLayers map={maps[activeMap || 0]} />
        <MapManager />
        <LayerEditor />
      </BaseMap>
      {children}
    </>
  )
}
