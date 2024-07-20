'use client'

import BaseMap from '../atom/BaseMap'
import MapLayers from '../atom/MapLayers'

export default function LimitedMap() {
  return (
    <BaseMap>
      <MapLayers />
    </BaseMap>
  )
}
