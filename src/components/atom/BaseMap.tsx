'use client'

import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useOlStore } from '@/core/store/olStore'
import { get } from 'http'
import { boundingExtent } from 'ol/extent'
import { fromLonLat } from 'ol/proj'
import React, { ReactNode, useRef } from 'react'

import { RMap, ROSMWebGL } from 'rlayers'

export default function BaseMap({ children }: { children?: ReactNode }): JSX.Element {
  const { view, setView } = useOlStore()
  const bBoxLock = useInterfaceStore((state) => state.bBoxLock)
  const map = useRef<RMap | null>(null)

  return (
    <RMap
      width={'100%'}
      height={'100vh'}
      initial={view}
      view={[view, setView]}
      maxZoom={18}
      noDefaultControls
      projection="EPSG:3857"
      ref={map}
      extent={bBoxLock && boundingExtent([fromLonLat([2.25, 48.81]), fromLonLat([2.42, 48.9])])}>
      <ROSMWebGL properties={{ label: 'OSM' }} />
      {children}
    </RMap>
  )
}
