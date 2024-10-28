import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { MVT } from 'ol/format'
import { useEffect, useMemo } from 'react'
import { RLayerVectorTile } from 'rlayers'
import { RCircle, RFill, RStroke, RStyle } from 'rlayers/style'
import { Feature } from 'ol'
import { Geometry } from 'ol/geom'
import { Layer } from 'ol/layer'
import { usePathname } from 'next/navigation'

export interface MapLayersProps {
  map: API.RAW.Map
  layers: API.RAW.Layer[]
}

// Interface for the feature information including layer data
interface FeatureInfo {
  feature: Feature<Geometry>
  layer: Layer
  order: number
}

export default function MapLayers({ layers }: MapLayersProps) {
  const parser = useMemo(() => new MVT(), [])
  const adapter = useMemo(() => new ApiAdapter(), [])
  const path = usePathname()

  let geometrySelected = false

  const {
    setActiveGeometryID,
    activeGeometryID,
    setActiveGeometry,
    activeGeometry,
    editorTool,
    setActiveLayer,
    pendingGeometry,
    setActivePanel,
    setEditorTool,
    activePanel,
    activeMap,
    activeLayer,
    setPendingGeometry,
  } = useInterfaceStore()

  useEffect(() => {
    setPendingGeometry(undefined)

    if (typeof activeGeometryID !== 'number') {
      setActiveGeometry(undefined)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGeometryID])

  useEffect(() => {
    if (!activeMap) {
      return
    }

    setActiveGeometryID(undefined)
    setPendingGeometry(undefined)
  }, [activeMap])

  return (
    <>
      {layers
        ?.filter((l) => l.enabled)
        ?.sort((a, b) => (b.order || 1) - (a.order || 1))
        .map((layer, i) => {
          if (!layer.enabled) return null

          return (
            layer.enabled &&
            layer.order && (
              <RLayerVectorTile
                key={`layer.${layer.id_layer}.render`}
                onPointerEnter={() => {}}
                url={`${process.env.NEXT_PUBLIC_BASEURL_VECTOR}layers/${layer.id_layer}/vectortiles/{z}/{x}/{y}.pbf/`}
                zIndex={i}
                projection="EPSG:3857"
                // @ts-expect-error - Same attributes, different types
                format={parser}
                onClick={(e) => {
                  if (editorTool !== 'Select' || !!pendingGeometry || geometrySelected) return
                  geometrySelected = true

                  if (activeGeometryID === e.target.get('id_geometry')) {
                    geometrySelected = false
                    setActiveGeometryID(undefined)
                    return
                  }

                  if (path.startsWith('/editor')) {
                    setEditorTool('Edit')
                  }

                  const geometryID = e.target.get('id_geometry')
                  const geometryLayerID = e.target.get('id_layer')
                  geometryLayerID && setActiveLayer(geometryLayerID)
                  geometryID && !activePanel && setActivePanel('layers')
                  return geometryID && setActiveGeometryID(geometryID)
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
