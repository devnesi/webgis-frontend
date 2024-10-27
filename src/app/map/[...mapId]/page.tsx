'use client'

import { Browser } from '@/components/behavior/EnsureIsBrowser'
import LimitedMap from '@/components/LimitedMap'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { CircleNotch } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export interface HomeProps {
  params: {
    mapId: string
  }
}

export default function Home({ params }: HomeProps) {
  const mapId = params.mapId
  const adapter = useMemo(() => new ApiAdapter(), [])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mapData, setMapData] = useState<API.RAW.Map | undefined>()
  const [layersData, setLayersData] = useState<API.LAYER.list>([])

  useEffect(
    () => {
      ;(async () => {
        try {
          const mdata = await adapter.getMap(Number(mapId))
          const ldata = await adapter.getAvailableLayers(Number(mapId))
          setMapData(mdata)
          setLayersData(ldata)
          setLoading(false)
        } catch (e) {
          setTimeout(() => {
            router.push('/')
          }, 4000)
        }
      })()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapId]
  )

  if (!mapData && loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-0 w-screen h-screen">
        <CircleNotch size={64} className="animate-spin" />
      </div>
    )
  }

  if (!mapData && !loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-0 w-screen h-screen text-lg">
        <span>Mapa não encontrado.</span>
        <span className="text-white/30">Você será redirecionado em 3s.</span>
      </div>
    )
  }

  return (
    <Browser>
      <LimitedMap map={mapData!} layers={layersData} />
    </Browser>
  )
}
