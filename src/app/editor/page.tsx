'use client'

import { Browser } from '@/components/behavior/EnsureIsBrowser'
import DevMapState from '@/components/rendering/DevMapState'
import FeaturedMap from '@/components/FeaturedMap'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import getUserToken from '@/core/utils/gettoken'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const currentToken = getUserToken()

    if (!currentToken) {
      return router.replace('/')
    }
  }, [router])

  return (
    <Browser>
      <FeaturedMap>
        <DevMapState />
      </FeaturedMap>
    </Browser>
  )
}
