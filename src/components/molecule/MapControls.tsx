'use client'

import MapControl from '@/components/atom/MapControl'
import {
  ArrowsInCardinal,
  Lock,
  MagnetStraight,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Stack,
  StackSimple,
} from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useOlStore } from '@/core/store/olStore'
import { useOL } from 'rlayers'
import { transformExtent } from 'ol/proj'
import { View } from 'ol'
import { useMemo } from 'react'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { usePathname } from 'next/navigation'

export default function MapControls() {
  const { activePanel, setActivePanel, setBBoxLock, bBoxLock, activeMap, magneticLock, setMagneticLock } =
    useInterfaceStore()
  const { view, setView } = useOlStore()
  const { map } = useOL()
  const adapter = useMemo(() => new ApiAdapter(), [])

  return (
    <div className="flex flex-col gap-2 p-4 pointer-events-auto">
      <MapControl
        Icon={MagnifyingGlassPlus}
        onClick={() => {
          const olView = map.getView()
          olView.animate({ zoom: view.zoom + 1, duration: 300 }, (finished) => {
            if (!finished) return setView({ ...view, zoom: view.zoom + 1, resolution: undefined })
          })
        }}
        label="+Zoom"
      />
      <MapControl
        Icon={MagnifyingGlassMinus}
        onClick={() => {
          const olView = map.getView()
          olView.animate({ zoom: view.zoom - 1, duration: 300 }, (finished) => {
            if (!finished) return setView({ ...view, zoom: view.zoom - 1, resolution: undefined })
          })
        }}
        label="-Zoom"
      />
      <MapControl
        Icon={Stack}
        active={activePanel === 'layers'}
        label={'Painel detalhado'}
        onClick={() => {
          setActivePanel(activePanel === 'layers' ? undefined : 'layers')
        }}
      />
      <MapControl
        Icon={StackSimple}
        active={activePanel === 'compactLayers'}
        label={'Painel simples'}
        onClick={() => {
          setActivePanel(activePanel === 'compactLayers' ? undefined : 'compactLayers')
        }}
      />
      <hr className="border-tertiary" />
      <MapControl
        Icon={ArrowsInCardinal}
        label={'Centralizar mapa'}
        onClick={() => {
          adapter.getMapBBox(activeMap!).then((response) => {
            const bbox = response.bbox.replace('BOX(', '').replace(')', '')
            const lonLatTuple = bbox.replace(',', ' ')
            const bBox = lonLatTuple.split(' ').map((c) => parseFloat(c))

            const LonLat = transformExtent(bBox, 'EPSG:4326', 'EPSG:3857')

            map.getView().fit(LonLat, {
              duration: 300,
            })
          })
        }}
      />
      <MapControl
        Icon={Lock}
        label={'Limitar movimento'}
        active={!!bBoxLock}
        onClick={() => {
          if (!!bBoxLock) {
            setBBoxLock(undefined)
            const newView = new View({
              ...view,
              extent: undefined,
              maxZoom: 18,
            })
            map.getView().dispose()
            map.setView(newView)
          } else {
            const currentExtent = map.getView().calculateExtent()
            setBBoxLock(transformExtent(currentExtent, 'EPSG:3857', 'EPSG:4326'))
            const newView = new View({
              ...view,
              extent: currentExtent,
              maxZoom: 18,
            })

            map.getView().dispose()
            newView.fit(currentExtent)
            map.setView(newView)
          }
        }}
      />
      <MapControl
        Icon={MagnetStraight}
        label={'Encaixe Inteligente'}
        active={!!magneticLock}
        onClick={() => {
          setMagneticLock(!magneticLock)
        }}
      />
    </div>
  )
}
