'use client'

import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useOlStore } from '@/core/store/olStore'
import { Collection } from 'ol'
import { boundingExtent } from 'ol/extent'
import { GeoJSON, MVT } from 'ol/format'
import { DragPan, Snap } from 'ol/interaction'
import VectorTileLayer from 'ol/layer/VectorTile'
import { fromLonLat } from 'ol/proj'
import { Source } from 'ol/source'
import VectorSource from 'ol/source/Vector'
import React, { ReactNode, useEffect, useMemo, useRef } from 'react'

import { RLayerVector, RMap, ROSMWebGL } from 'rlayers'

export default function BaseMap({ children }: { children?: ReactNode }): JSX.Element {
  const { view, setView } = useOlStore()
  const { activeLayer } = useInterfaceStore()
  const bBoxLock = useInterfaceStore((state) => state.bBoxLock)
  const map = useRef<RMap | null>(null)
  const parser = useMemo(() => new MVT(), [])

  useEffect(() => {
    const activeMap = map.current
    if (!activeMap) return

    const interactions = activeMap.ol.getInteractions().getArray()
    console.table(
      interactions.map((i) => {
        return {
          instance: i.constructor.name,
          value: i,
        }
      })
    )

    // remove dragPan interaction
    const dragPan = interactions.find((i) => i instanceof DragPan)
    if (dragPan) activeMap.ol.removeInteraction(dragPan)

    // Create new dragPan without kinetics
    const dragPanNoKinetics = new DragPan()

    // Add interaction to map
    activeMap.ol.addInteraction(dragPanNoKinetics)
  }, [map])

  return (
    <RMap
      width={'100%'}
      height={'100vh'}
      initial={view}
      view={[view, setView]}
      maxZoom={28}
      noDefaultControls
      projection="EPSG:3857"
      ref={map}
      extent={bBoxLock && boundingExtent([fromLonLat([2.25, 48.81]), fromLonLat([2.42, 48.9])])}>
      <ROSMWebGL properties={{ label: 'OSM' }} />

      {children}
    </RMap>
  )
}
