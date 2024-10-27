'use client'

import { ApiAdapter } from '@/core/adapter/apiAdapter'
import BaseMap from './BaseMap'
import MapLayers from './rendering/MapLayers'
import LayerEditor from './rendering/SelectedLayers'
import MapManager from './controls/MapManager'
import { useMapStore } from '@/core/store/mapStore'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useEffect } from 'react'
import LayerSelector from './rendering/SelectedLayers'

export interface LimitedMapProps {
  map: API.RAW.Map
  layers: API.RAW.Layer[]
}

export default function LimitedMap({ map, layers }: LimitedMapProps) {
  const { maps, setMaps } = useMapStore()
  const { setActiveMap, activeMap } = useInterfaceStore()

  useEffect(() => {
    const newMapList: typeof maps = {}
    newMapList[map.id_map] = { ...map, layers }

    setMaps(newMapList)
    setActiveMap(map.id_map)

    return () => {
      setActiveMap(undefined)
      setMaps([])
    }
  }, [map, layers, setMaps, setActiveMap])

  const renderMap = maps[activeMap || 0]
  return (
    <BaseMap>
      <MapLayers map={renderMap} layers={renderMap?.layers} />
      <LayerSelector />
      <MapManager />
    </BaseMap>
  )
}
