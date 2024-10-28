'use client'

import { useInterfaceStore } from '@/core/store/interfaceStore'
import { MapEvent, View } from 'ol'
import { ObjectEvent } from 'ol/Object'
import { useEffect, useRef } from 'react'
import { useOL } from 'rlayers'

export default function RememberUserView() {
  const { map } = useOL()
  const { activeMap } = useInterfaceStore()
  const wasFiredOnce = useRef(false)

  useEffect(() => {
    if (!map || !activeMap) return

    const event = (e: MapEvent) => {
      if (!wasFiredOnce.current) {
        wasFiredOnce.current = true
        return
      }

      const view = map.getView()
      if (!view) return

      const currentCenter = view.getCenter()
      localStorage?.setItem('lastViewPos', JSON.stringify(currentCenter))
      localStorage?.setItem('lastViewZoom', (view.getZoom() || 10).toString())
      localStorage?.setItem('lastMap', (activeMap || '').toString())
    }

    map.on('moveend', event)

    return () => {
      map.un('moveend', event)
    }
  }, [map, activeMap])

  useEffect(() => {
    if (!map || !activeMap) return

    const lastViewCenter = localStorage?.getItem('lastViewPos')
    const lastViewZoom = localStorage?.getItem('lastViewZoom') || '10'

    if (!lastViewCenter) return
    const newView = new View({
      center: JSON.parse(lastViewCenter),
      zoom: parseFloat(lastViewZoom),
    })

    map.getView().dispose()
    setTimeout(() => {
      map.setView(newView)
    }, 0)
  }, [activeMap])

  return <></>
}
