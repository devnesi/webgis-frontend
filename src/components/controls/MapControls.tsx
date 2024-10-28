'use client'

import MapControl from '@/components/controls/MapControl'
import {
  ArrowsInCardinal,
  Lock,
  MagnetStraight,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Share,
  ShareFat,
  SignOut,
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
          setActivePanel(activePanel === 'layers' ? 'compactLayers' : 'layers')
        }}
      />
      <MapControl
        Icon={ShareFat}
        label={'Compartilhar mapa'}
        disabled={!activeMap || isNaN(activeMap)}
        onClick={() => {
          const url = `${window.location.origin}/map/${activeMap}`
          navigator.clipboard.writeText(url)
        }}
      />
      <hr className="border-tertiary" />
      <MapControl
        Icon={ArrowsInCardinal}
        label={'Centralizar mapa'}
        disabled={!activeMap || isNaN(activeMap)}
        onClick={() => {
          adapter.getMapBBox(activeMap!).then((response) => {
            if (!response.bbox) {
              return
            }

            const bbox = response.bbox.replace('BOX(', '').replace(')', '')
            const lonLatTuple = bbox.replace(',', ' ')
            const bBox = lonLatTuple.split(' ').map((c) => parseFloat(c))

            const LonLat = transformExtent(bBox, 'EPSG:4326', 'EPSG:3857')

            map.getView().fit(LonLat, {
              duration: 300,
              maxZoom: 18,
            })
          })
        }}
      />
      <MapControl
        Icon={Lock}
        label={'Limitar movimento'}
        active={!!bBoxLock}
        disabled={!activeMap || isNaN(activeMap)}
        onClick={() => {
          if (!!bBoxLock) {
            setBBoxLock(undefined)
            const newView = new View({
              ...view,
              extent: undefined,
            })
            map.getView().dispose()
            map.setView(newView)
          } else {
            const currentExtent = map.getView().calculateExtent()
            setBBoxLock(transformExtent(currentExtent, 'EPSG:3857', 'EPSG:4326'))
            const newView = new View({
              ...view,
              extent: currentExtent,
            })

            map.getView().dispose()
            newView.fit(currentExtent)
            map.setView(newView)
          }
        }}
      />
      <MapControl
        Icon={MagnetStraight}
        disabled={!activeMap || isNaN(activeMap)}
        label={'Encaixe Inteligente'}
        active={!!magneticLock}
        onClick={() => {
          setMagneticLock(!magneticLock)
        }}
      />
      <MapControl
        className="mt-auto"
        Icon={SignOut}
        label={'Desconectar'}
        onClick={() => {
          window.location.href = '/signout'
        }}
      />
    </div>
  )
}
