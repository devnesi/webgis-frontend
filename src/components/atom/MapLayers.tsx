import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMapStore } from '@/core/store/mapStore'
import { GeoJSON, MVT } from 'ol/format'
import { act, useCallback, useEffect, useMemo, useState } from 'react'
import { RFeature, RLayerVector, RLayerVectorTile, ROverlay } from 'rlayers'
import { RCircle, RFill, RStroke, RStyle } from 'rlayers/style'
import { Point, Polygon, LineString, MultiPolygon } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'

export default function MapLayers({ map }: { map?: API.RAW.Map & { layers: API.RAW.Layer[] } }) {
  const parser = useMemo(() => new MVT(), [])
  const adapter = useMemo(() => new ApiAdapter(), [])
  // const [flow, setFlow] = useState([])
  const {
    setActiveGeometryID,
    activeGeometryID,
    setActiveGeometry,
    activeGeometry,
    editorTool,
    setActiveLayer,
    pendingGeometry,
  } = useInterfaceStore()

  useEffect(() => {
    if (!activeGeometryID) {
      setActiveGeometry(undefined)
      setActiveGeometryID(undefined)
      return
    }

    if (activeGeometryID === activeGeometry?.id_geometry) {
      return
    }

    setActiveGeometry(undefined)
    ;(async () => {
      const geometry = await adapter.getGeometry(activeGeometryID)

      if (!geometry) {
        return alert('Geometria não encontrada')
      }

      setActiveGeometry(geometry)
    })()
  }, [activeGeometryID])

  return (
    <>
      {map?.layers
        .sort((a, b) => (a?.order || 1) * -1 - (b?.order || 1) * -1)
        .map((layer) => {
          return (
            layer.enabled && (
              <RLayerVectorTile
                key={`layer.${layer.id_layer}.render`}
                onPointerEnter={() => {}}
                url={`${process.env.NEXT_PUBLIC_BASEURL_VECTOR}layers/${layer.id_layer}/vectortiles/{z}/{x}/{y}.pbf/`}
                projection="EPSG:3857"
                // @ts-expect-error - Same attributes, different types
                format={parser}
                onClick={(e) => {
                  if (editorTool !== 'Select' || !!pendingGeometry) return
                  const geometryID = e.target.get('id_geometry')
                  const geometryLayerID = e.target.get('id_layer')
                  geometryLayerID && setActiveLayer(geometryLayerID)
                  return geometryID && setActiveGeometryID(geometryID === activeGeometryID ? undefined : geometryID)
                }}>
                <RStyle>
                  <RCircle radius={layer?.style?.radius || 5}>
                    <RFill color={layer?.style?.fill || '#007bff'} />
                  </RCircle>

                  <RStroke color={layer?.style?.stroke || '#007bff'} width={2} />
                  <RFill color={layer?.style?.fill || '#007bff4D'} />
                </RStyle>
              </RLayerVectorTile>
            )
          )
        })}
    </>
  )
}
