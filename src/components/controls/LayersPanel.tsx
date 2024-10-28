'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { useMapStore } from '@/core/store/mapStore'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import {
  ArrowsDownUp,
  ArrowsInCardinal,
  Eye,
  EyeSlash,
  GlobeHemisphereWest,
  MapTrifold,
  PlusCircle,
  TrashSimple,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useOL } from 'rlayers'
import { transformExtent } from 'ol/proj'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ReactSortable } from 'react-sortablejs'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'
import ConfirmActionModal from '../modal/ConfirmActionModal'
import NewLayerModal from '../modal/NewLayerModal'
import NewMapModal from '../modal/NewMapModal'
import { debounce } from '@/core/utils/debounce'

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
          if (activeMap) {
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
            if (!response.bbox) return

            const bbox = response.bbox.replace('BOX(', '').replace(')', '')
            const lonLatTuple = bbox.replace(',', ' ')
            const bBox = lonLatTuple.split(' ').map((c) => parseFloat(c))

            const extent = transformExtent(bBox, 'EPSG:4326', 'EPSG:3857')
            map?.getView().fit(extent, { duration: 300, maxZoom: 18 })
          })
        }}>
        <ArrowsInCardinal size={24} />
      </div>
    </div>
  )
}

export default function LayersPanel() {
  const { maps, setMaps } = useMapStore()
  const { map } = useOL()
  const path = usePathname()
  const { activeMap, setActiveMap, setPendingGeometry, setActiveGeometryID, setEditorTool } = useInterfaceStore()
  const [isMapListOpen, setMapListOpen] = useState<boolean>(false)
  const adapater = useMemo(() => new ApiAdapter(), [])
  const [layers, setLayers] = useState<(API.RAW.Layer & { id: number })[]>([])
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
  const [showLayerCreate, setShowLayerCreate] = useState<boolean>(false)
  const [showNewMap, setShowNewMap] = useState<boolean>(false)
  const mapNameRef = useRef<HTMLInputElement>(null)
  const mapUpdateNameDebounces = debounce((name) => {
    if (!activeMap || !name) return

    adapater.updateMap(activeMap!, { name }).then(() => {
      setMaps({
        ...maps,
        [activeMap!]: {
          ...maps[activeMap!],
          name,
        },
      })
    })
  }, 500)

  useEffect(() => {
    const mapLayers = maps[activeMap || 0]?.layers
    const layersWithID = mapLayers?.map((l) => {
      return { ...l, id: l.id_layer }
    })
    layersWithID?.sort((a, b) => (a?.order || 1) - (b?.order || 1))
    setLayers(layersWithID || [])
    if (mapNameRef.current && activeMap) {
      mapNameRef.current.value = maps[activeMap]?.name || ''
    }
  }, [activeMap, maps])

  const doChangeListOrder = (ls: (API.RAW.Layer & { id: number })[]) => {
    if (!layers.every((element, index) => element === ls[index])) {
      adapater
        .updateLayersOrders({
          orders: ls.map((l, i) => {
            return { id_layer: l.id_layer, order: i + 1, name: l.name }
          }),
        })
        .then(() => {
          setMaps({
            ...maps,
            [activeMap!]: {
              ...maps[activeMap!],
              layers: ls.map((l, i) => {
                return { ...l, order: i + 1 }
              }),
            },
          })
        })
    }

    setLayers(ls)
  }

  function clearLayers(includeEdittingCanvas?: boolean) {
    setPendingGeometry(undefined)
    setActiveGeometryID(undefined)
    setEditorTool('Select')
    map.getAllLayers().forEach((l) => {
      if (includeEdittingCanvas) {
        return l.getSource()?.refresh()
      }
      if (l instanceof VectorTileLayer || l instanceof VectorLayer) {
        l.getSource()?.refresh()
      }
    })
  }

  return (
    <>
      {showConfirmDelete && (
        <ConfirmActionModal
          title={`Apagar "${maps[activeMap || 0]?.name}" ?`}
          destructive
          description="Ao confirmar, todas as informações contidas neste mapa serão apagadas permanentemente. Deseja continuar?"
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={() => {
            if (!activeMap) return

            adapater.deleteMap(activeMap).then(() => {
              delete maps[activeMap]
              setMaps(maps)
              setActiveMap(undefined)
              setShowConfirmDelete(false)
              localStorage.clear()
            })
          }}
        />
      )}
      {showLayerCreate && (
        <NewLayerModal
          title="Nova Camada"
          onClose={() => {
            setShowLayerCreate(false)
          }}
        />
      )}
      {showNewMap && (
        <NewMapModal
          title="Novo Mapa"
          onClose={() => {
            setShowNewMap(false)
          }}
        />
      )}
      <motion.div
        className="relative z-[51] flex flex-col bg-secondary w-full h-full pointer-events-auto select-none"
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
        {
          <DropdownMenu.Root open={isMapListOpen} onOpenChange={setMapListOpen}>
            <DropdownMenu.Trigger asChild>
              <div className="flex justify-between items-center bg-secondary p-4 border-tertiary border-b w-full text-sm cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <MapTrifold weight="duotone" /> Mapas disponíveis
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
                      {path.startsWith('/editor') && (
                        <DropdownMenu.Item
                          className="bg-secondary hover:bg-green-400 px-4 py-2 border border-tertiary first:rounded-t last:rounded-b text-sm hover:text-secondary duration-200 cursor-pointer select-none focus:outline-none text-green-400"
                          key={'map.select.new'}
                          onClick={() => {
                            setShowNewMap(true)
                          }}>
                          <span className="flex items-center gap-2">
                            <PlusCircle weight="duotone" /> Novo Mapa
                          </span>
                        </DropdownMenu.Item>
                      )}
                    </motion.div>
                  </DropdownMenu.Content>
                )}
              </AnimatePresence>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        }
        <div className="flex flex-col w-full h-full min-h-0">
          {activeMap && !isNaN(activeMap) ? (
            <input
              ref={mapNameRef}
              className="block focus:border-1 focus:border-accent bg-primary/30 file:my-1 px-2 py-1 p-0 border border-transparent rounded-md focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-white/60 sm:leading-7 focus:outline-none"
              defaultValue={maps[activeMap || 0]?.name}
              placeholder={'Sem nome'}
              type={'text'}
              disabled={!path.startsWith('/editor')}
              onChange={(e) => {
                if (!activeMap || !isNaN(activeMap)) return
                mapUpdateNameDebounces(e.target.value)
              }}
            />
          ) : null}
          <span className="my-2 px-4 text-white/40 text-xs">Camadas</span>
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
                      clearLayers()
                    }
                  }}
                />
              )
            })}
          </ReactSortable>
          {Object.keys(maps).length > 0 && activeMap && !isNaN(activeMap) && path.startsWith('/editor') && (
            <div
              className={clsx(
                'flex items-center gap-2 hover:bg-green-400 mt-2 px-4 rounded w-full h-10 text-sm text-white/40 hover:text-black duration-100 cursor-pointer group'
              )}
              onClick={() => {
                setShowLayerCreate(true)
              }}>
              <PlusCircle /> Nova camada
            </div>
          )}
          {maps[activeMap || 0] && path.startsWith('/editor') && (
            <>
              <div
                onClick={() => {
                  setShowConfirmDelete(true)
                }}
                className="flex justify-center items-center gap-2 border-white/10 hover:bg-red-400/20 mt-auto p-2 border hover:border-red-400 w-full text-white/60 cursor-pointer">
                <TrashSimple /> Apagar Mapa
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}
