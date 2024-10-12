import { Browser } from '@/components/atom/Browser'
import LimitedMap from '@/components/organism/LimitedMap'
import { ApiAdapter } from '@/core/adapter/apiAdapter'

export interface HomeProps {
  params: {
    mapId: string
  }
}

export default async function Home({ params }: HomeProps) {
  const mapId = params.mapId
  const adapter = new ApiAdapter()
  const mapData = await adapter.getMap(Number(mapId))
  const layersData = await adapter.getAvailableLayers(Number(mapId))

  return (
    <Browser>
      <LimitedMap map={mapData} layers={layersData} />
    </Browser>
  )
}
