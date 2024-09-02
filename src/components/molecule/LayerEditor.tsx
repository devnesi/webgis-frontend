'use client'

import { useInterfaceStore } from '@/core/store/interfaceStore'
import { Collection, Feature } from 'ol'
import { platformModifierKeyOnly } from 'ol/events/condition'
import { GeoJSON } from 'ol/format'
import { Snap } from 'ol/interaction'
import { features } from 'process'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MapBrowserEvent, RInteraction, RLayerVector, RStyle, RFeature, useOL } from 'rlayers'

export interface ILayersEditorProps {}

export default function LayerEditor({}: ILayersEditorProps) {
  const { editorTool, setEditorTool, activeGeometry } = useInterfaceStore()
  const { map } = useOL()
  const vectorLayer = useRef<RLayerVector>(null)
  const modifyRef = useRef(null)
  const GeometryJsonObject = useMemo(() => {
    if (!activeGeometry) {
      return null
    }

    return new GeoJSON({
      featureProjection: 'EPSG:3857',
      featureClass: Feature,
    }).readFeatures(activeGeometry?.geom)
  }, [activeGeometry])

  useEffect(() => {
    if (!GeometryJsonObject || !vectorLayer.current || !modifyRef) {
      return
    }

    const snap = new Snap({
      source: vectorLayer.current?.source,
    })
    map.addInteraction(snap)
  }, [map, GeometryJsonObject, modifyRef])
  return (
    <RLayerVector zIndex={9999} ref={vectorLayer}>
      <RStyle.RStyle>
        <RStyle.RStroke color="#eb8432" width={3} />
        <RStyle.RFill color="rgba(235, 132, 50, 0.75)" />
      </RStyle.RStyle>

      {activeGeometry?.geom &&
        GeometryJsonObject?.map((feature) => {
          return <RFeature key={`Feature.${feature.getId()}`} feature={feature} />
        })}

      <RInteraction.RDraw
        type={'Polygon'}
        condition={() => editorTool === 'Lasso' || editorTool === 'Pen'}
        freehandCondition={() => editorTool === 'Lasso'}
        snapTolerance={64}
        onDrawEnd={() => {
          setEditorTool('Selection')
        }}
      />
      <RInteraction.RDraw type={'Point'} condition={() => editorTool === 'Point'} />
      <RInteraction.RDraw type={'LineString'} condition={() => editorTool === 'Line'} />

      <RInteraction.RModify
        ref={modifyRef}
        condition={() => editorTool === 'Selection'}
        deleteCondition={useCallback((e: MapBrowserEvent<UIEvent>) => platformModifierKeyOnly(e), [])}
      />
    </RLayerVector>
  )
}
