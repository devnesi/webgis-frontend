'use client'

import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { Feature } from 'ol'
import { click, platformModifierKeyOnly } from 'ol/events/condition'
import { GeoJSON } from 'ol/format'
import { Geometry } from 'ol/geom'
import { DrawEvent } from 'ol/interaction/Draw'
import VectorTileLayer from 'ol/layer/VectorTile'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapBrowserEvent, RInteraction, RLayerVector, RStyle, RFeature, useOL } from 'rlayers'

export interface ILayersEditorProps {}

export default function LayerEditor({}: ILayersEditorProps) {
  const {
    editorTool,
    setEditorTool,
    activeGeometry,
    activeLayer,
    setPendingGeometry,
    pendingGeometry,
    setActiveGeometryID,
  } = useInterfaceStore()
  const vectorLayer = useRef<RLayerVector>(null)
  const modifyRef = useRef(null)
  const isCtrlPressed = useCallback((e: MapBrowserEvent<UIEvent>) => platformModifierKeyOnly(e) && click(e), [])
  const GeometryJsonObject = useMemo(() => {
    if (!activeGeometry) {
      return null
    }

    return new GeoJSON({
      featureProjection: 'EPSG:3857',
      featureClass: Feature,
    }).readFeatures(activeGeometry?.geom)
  }, [activeGeometry])

  async function allowGeometryToBeSent(geom: Geometry) {
    if (!geom) {
      return console.error('Attempting to submit an empty geometry')
    }

    if (!activeLayer) {
      return console.error('User is drawing a geometry on void layer... this goes deeper.')
    }
    const geojson = new GeoJSON().writeGeometry(geom.clone().transform('EPSG:3857', 'EPSG:4326'))
    const layer = activeLayer
    const id = activeGeometry?.id_geometry

    setPendingGeometry({ layer, id, geojson: geojson })
  }

  return activeLayer ? (
    <RLayerVector zIndex={9999} ref={vectorLayer}>
      <RStyle.RStyle>
        <RStyle.RStroke color="#eb8432" width={3} />
        <RStyle.RFill color="rgba(235, 132, 50, 0.75)" />
        <RStyle.RIcon src="/point.png" />
      </RStyle.RStyle>
      {activeGeometry?.geom &&
        GeometryJsonObject?.map((feature) => {
          return <RFeature key={`Feature.${feature.getId()}`} feature={feature} />
        })}

      <RInteraction.RDraw
        type={'Polygon'}
        condition={() => !activeGeometry && !pendingGeometry && (editorTool === 'Lasso' || editorTool === 'Pen')}
        freehandCondition={() => !pendingGeometry && editorTool === 'Lasso'}
        snapTolerance={8}
        onDrawEnd={(e) => {
          setEditorTool('Edit')
          const geom = e.feature!.getGeometry()
          if (!geom) {
            return
          }
          allowGeometryToBeSent(geom)
        }}
      />
      <RInteraction.RDraw
        type={'Point'}
        snapTolerance={8}
        condition={() => !activeGeometry && !pendingGeometry && editorTool === 'Point'}
        onDrawEnd={(e) => {
          setEditorTool('Edit')
          const geom = e.feature!.getGeometry()
          if (!geom) {
            return
          }
          allowGeometryToBeSent(geom)
        }}
      />
      <RInteraction.RDraw
        type={'LineString'}
        snapTolerance={8}
        condition={() => !activeGeometry && !pendingGeometry && editorTool === 'Line'}
        onDrawEnd={(e) => {
          setEditorTool('Edit')
          const geom = e.feature!.getGeometry()
          if (!geom) {
            return
          }
          allowGeometryToBeSent(geom)
        }}
      />

      <RInteraction.RModify
        ref={modifyRef}
        condition={(e) => {
          return editorTool === 'Edit'
        }}
        onModifyEnd={(e) => {
          const geom = e.features.getArray()[0]?.getGeometry()
          if (!geom) {
            return console.error('User attempted successfully modified a non existent feature. congratulations.')
          }
          allowGeometryToBeSent(geom)
        }}
        deleteCondition={isCtrlPressed}
      />
    </RLayerVector>
  ) : null
}
