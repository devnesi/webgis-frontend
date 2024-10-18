'use client'

import { Collection, Feature, VectorTile } from 'ol'
import { WKT } from 'ol/format'
import { Geometry } from 'ol/geom'
import Snap from 'ol/interaction/Snap'
import VectorLayer from 'ol/layer/Vector'
import VectorTileLayer from 'ol/layer/VectorTile'
import RenderFeature, { toFeature } from 'ol/render/Feature'
import VectorSource from 'ol/source/Vector'
const featureCache = new Map<string, Feature<Geometry>>()
import { useEffect, useRef, useState } from 'react'
import { RFeature, RLayerVector, useOL, useRLayersComponent } from 'rlayers'

export default function MagneticLayer() {
  const { map } = useOL()

  useEffect(() => {
    /*
    console.log('entrooooou')
    if (!map) {
      return
    }

    map
      .getInteractions()
      .getArray()
      .filter((i) => i instanceof Snap)
      .forEach((i) => map.removeInteraction(i))

    const vectorTileLayers = map.getAllLayers().filter((l) => l instanceof VectorTileLayer)

    for (const vtl of vectorTileLayers) {
      const view = map.getView()
      const featuresInExtent = vtl.getSource()?.getFeaturesInExtent(map.getView().calculateExtent())

      if (!featuresInExtent) {
        return
      }

      for (const renderFeature of featuresInExtent) {
        const wkt = renderFeature.getProperties().geomwkt as string
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
    }*/
  }, [map.getView().calculateExtent()])

  return <></>
}
