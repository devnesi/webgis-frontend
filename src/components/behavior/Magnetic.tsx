'use client'

import { useInterfaceStore } from '@/core/store/interfaceStore'
import { WKT } from 'ol/format'
import Snap from 'ol/interaction/Snap'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorSource from 'ol/source/Vector'
import { useEffect } from 'react'
import { useOL } from 'rlayers'

export default function MagneticLayer() {
  const { map } = useOL()
  const { magneticLock } = useInterfaceStore()

  useEffect(() => {
    if (!map) {
      return
    }

    map
      .getInteractions()
      .getArray()
      .filter((i) => i instanceof Snap)
      .forEach((i) => map.removeInteraction(i))

    if (!magneticLock) {
      return
    }

    const vectorTileLayers = map.getAllLayers().filter((l) => l instanceof VectorTileLayer)

    for (const vtl of vectorTileLayers) {
      const featuresInExtent = vtl.getSource()?.getFeaturesInExtent(map.getView().calculateExtent())

      if (!featuresInExtent) {
        return
      }

      for (const renderFeature of featuresInExtent) {
        const wkt = renderFeature.getProperties().geomwkt as string
        if (!wkt) {
          console.error('No WKT found in renderFeature', renderFeature)
          continue
        }
        const featureFromWKT = new WKT().readFeature(wkt, {
          dataProjection: 'EPSG:3857',
          featureProjection: 'EPSG:3857',
        })

        const vectorSource = new VectorSource()
        vectorSource.addFeature(featureFromWKT)
        console.log('ADD INTERACTION USINGN NEW SOURCE')
        map.addInteraction(
          new Snap({
            source: vectorSource,
          })
        )
      }
    }
  }, [magneticLock, map.getView().calculateExtent()])

  return <></>
}
