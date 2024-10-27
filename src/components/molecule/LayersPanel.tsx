'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { useMapStore } from '@/core/store/mapStore'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { ArrowsDownUp, ArrowsInCardinal, Eye, EyeSlash, GlobeHemisphereWest, MapTrifold } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useOL } from 'rlayers'
import { transformExtent } from 'ol/proj'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ReactSortable } from 'react-sortablejs'

export function LayerRow({
  layer,
  onLayerVisibilityChange,
}: {
  layer: API.RAW.Layer
  onLayerVisibilityChange: (visibility: boolean) => void
}) {
  const { activeMap, setActiveLayer, activeLayer, setEditorTool, setActiveGeometryID } = useInterfaceStore()
  const { map } = useOL()
  const adapter = useMemo(() => new ApiAdapter(), [])
  const route = usePathname()

  return (
    <div
      className={clsx('flex items-center border-tertiary border-b rounded w-full h-12 group', {
        'bg-accent/5': layer.id_layer === activeLayer,
      })}>
      <div
        className="group-hover:bg-accent/5 flex justify-center items-center bg-secondary hover:!bg-tertiary p-2 h-full duration-200 cursor-pointer aspect-square peer"
        onClick={() => {
          if (typeof activeMap === 'number') {
            onLayerVisibilityChange(!layer.enabled)
          }

          if (route.startsWith('/editor')) {
            adapter
              .updateLayerSpecification({
                ...layer,
                enabled: !layer.enabled,
              })
              .then(() => {
                if (layer.enabled) {
                  setActiveLayer(undefined)
                  setActiveGeometryID(undefined)
                }
              })
              .catch((e) => {
                console.error('Failed to change layer status on backend - Are you logged in?', e)
              })
          }
        }}>
        {layer.enabled ? <Eye weight="duotone" /> : <EyeSlash weight="duotone" className="text-white/40" />}
      </div>
      <div
        className={clsx(
          'group-hover:bg-accent/5 flex items-center gap-2 px-2 w-full h-full text-ellipsis text-xs duration-200 cursor-pointer overflow-hidden peer',
          {
            'text-accent': layer.id_layer === activeLayer,
          }
        )}
        onClick={() => {
          setEditorTool(undefined)
          setActiveLayer(activeLayer === layer.id_layer ? undefined : layer.id_layer)
          setActiveGeometryID(undefined)
        }}>
        <div className="flex justify-center items-center w-4 h-full">
          <span
            style={{
              border: `solid 2px ${layer?.style?.stroke || '#007bff'}`,
              backgroundColor: layer?.style?.fill || 'transparent',
            }}
            className={clsx({
              'w-4 h-4': layer.layer_type === 'Polygon',
              'w-4 h-1': layer.layer_type === 'LineString',
              'rounded-full w-2 h-2': layer.layer_type === 'Point',
            })}
          />
        </div>
        <span
          className={clsx('w-full text-ellipsis whitespace-nowrap overflow-hidden', {
            'text-white/40': !layer.enabled,
          })}>
          {layer.name}
        </span>
      </div>
      <div
        className="group-hover:bg-accent/5 flex justify-center items-center hover:!bg-tertiary h-full text-white/40 hover:text-white duration-200 cursor-pointer aspect-square"
        onClick={() => {
          const adapter = new ApiAdapter()
          adapter.getLayerBBox(layer.id_layer).then((response) => {
            const bbox = response.bbox.replace('BOX(', '').replace(')', '')
            const lonLatTuple = bbox.replace(',', ' ')
            const bBox = lonLatTuple.split(' ').map((c) => parseFloat(c))

            const extent = transformExtent(bBox, 'EPSG:4326', 'EPSG:3857')
            map?.getView().fit(extent, { duration: 300 })
          })
        }}>
        <ArrowsInCardinal size={24} />
      </div>
    </div>
  )
}

export default function LayersPanel() {
  const { maps } = useMapStore()
  const { setMaps } = useMapStore()
  const { activeMap, setActiveMap } = useInterfaceStore()
  const [isMapListOpen, setMapListOpen] = useState<boolean>(false)
  const adapater = useMemo(() => new ApiAdapter(), [])
  const [layers, setLayers] = useState<(API.RAW.Layer & { id: number })[]>([])

  useEffect(() => {
    const mapLayers = maps[activeMap || 0]?.layers
    const layersWithID = mapLayers?.map((l) => {
      return { ...l, id: l.id_layer }
    })
    layersWithID?.sort((a, b) => (a?.order || 1) - (b?.order || 1))
    setLayers(layersWithID || [])
  }, [activeMap])

  const doChangeListOrder = (ls: (API.RAW.Layer & { id: number })[]) => {
    if (!layers.every((element, index) => element === ls[index])) {
      adapater.updateLayersOrders({
        orders: ls.map((l, i) => {
          console.log('INDEX', i + 1)
          return { id_layer: l.id_layer, order: i + 1, name: l.name }
        }),
      })
    }

    setLayers(ls)
  }

  return (
    <motion.div
      className="relative z-[51] flex flex-col bg-[#161616] w-full h-full pointer-events-auto select-none"
      key="layers-panel"
      transition={{
        duration: 0.2,
        delay: 0.15,
        bounce: false,
      }}
      initial={{
        width: 0,
        opacity: 0,
        minWidth: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
        minWidth: '300px',
      }}
      exit={{
        width: 0,
        opacity: 0,
        minWidth: 0,
      }}>
      {Object.keys(maps).length > 1 && (
        <DropdownMenu.Root open={isMapListOpen} onOpenChange={setMapListOpen}>
          <DropdownMenu.Trigger asChild>
            <div className="flex justify-between items-center bg-secondary p-4 border-tertiary border-b w-full text-sm cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <GlobeHemisphereWest weight="duotone" /> {maps[activeMap || 0]?.name || 'Selecione um mapa'}
              </span>
              <ArrowsDownUp />
            </div>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <AnimatePresence>
              {isMapListOpen && (
                <DropdownMenu.Content className="z-[52] shadow-2xl w-full min-w-[300px]" sideOffset={0}>
                  <motion.div
                    className="w-full h-full"
                    initial={{
                      opacity: 0.6,
                      y: '-20%',
                      translateY: -8,
                      scaleY: 0.6,
                    }}
                    transition={{
                      duration: 0.2,
                      bounce: false,
                    }}
                    animate={{ opacity: 1, translateY: 0, scaleY: 1, y: 0 }}
                    exit={{ opacity: 0.6, translateY: -8, scaleY: 0.6, y: '-20%' }}
                    key="map-list">
                    {Object.values(maps).map((map) => {
                      return (
                        <DropdownMenu.Item
                          className="bg-secondary hover:bg-accent px-4 py-2 border border-tertiary first:rounded-t last:rounded-b text-sm hover:text-primary duration-200 cursor-pointer select-none focus:outline-none"
                          key={`map.select.${map.id_map}`}
                          onClick={() => {
                            setActiveMap(map.id_map)
                          }}>
                          <span className="flex items-center gap-2">
                            <MapTrifold weight="duotone" /> {map.name || 'Sem nome'}
                          </span>
                        </DropdownMenu.Item>
                      )
                    })}
                  </motion.div>
                </DropdownMenu.Content>
              )}
            </AnimatePresence>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}

      <div className="flex flex-col w-full">
        <ReactSortable list={layers} setList={doChangeListOrder}>
          {layers.map((layer) => {
            return (
              <LayerRow
                layer={layer}
                key={`layer.${layer.id_layer}.map.${activeMap}`}
                onLayerVisibilityChange={(vis) => {
                  if (activeMap) {
                    setMaps({
                      ...maps,
                      [activeMap]: {
                        ...maps[activeMap],
                        layers: layers.map((l) => {
                          if (l.id_layer === layer.id_layer) {
                            return {
                              ...l,
                              enabled: !l.enabled,
                            }
                          }
                          return l
                        }),
                      },
                    })
                    setLayers(
                      layers.map((l) => {
                        if (l.id_layer === layer.id_layer) {
                          return {
                            ...l,
                            enabled: !l.enabled,
                          }
                        }
                        return l
                      })
                    )
                  }
                }}
              />
            )
          })}
        </ReactSortable>
      </div>
    </motion.div>
  )
}
