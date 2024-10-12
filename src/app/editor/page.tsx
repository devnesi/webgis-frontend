import { Browser } from '@/components/atom/Browser'
import DevMapState from '@/components/atom/DevMapState'
import FeaturedMap from '@/components/organism/FeaturedMap'

export default function Home() {
  return (
    <Browser>
      <FeaturedMap>
        <DevMapState />
      </FeaturedMap>
    </Browser>
  )
}
