'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { useMapStore } from '@/core/store/mapStore'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { ArrowsDownUp, CrosshairSimple, Eye, EyeSlash, GlobeHemisphereWest, MapTrifold } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useOL } from 'rlayers'
import { transformExtent } from 'ol/proj'
import { useState } from 'react'

export default function LayersPanel() {
  const { maps, setMaps } = useMapStore()
  const { activeMap, setActiveMap, setActiveLayer, activeLayer } = useInterfaceStore()
  const [isMapListOpen, setMapListOpen] = useState<boolean>(false)
  const { map } = useOL()
  const mapLayers = maps[activeMap || 0]?.layers

  return (
    <motion.div
      className="w-full h-full bg-[#161616] flex flex-col z-[51] relative"
      key="layers-panel"
      transition={{
        duration: 0.2,
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
      <DropdownMenu.Root open={isMapListOpen} onOpenChange={setMapListOpen}>
        <DropdownMenu.Trigger asChild>
          <div className="flex justify-between items-center w-full border-b border-tertiary bg-secondary p-4 text-sm cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <GlobeHemisphereWest weight="duotone" /> {maps[activeMap || 0]?.name || 'Selecione um mapa'}
            </span>
            <ArrowsDownUp />
          </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <AnimatePresence>
            {isMapListOpen && (
              <DropdownMenu.Content className="w-full z-[52] min-w-[300px] shadow-2xl" sideOffset={0}>
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
                        className="px-4 cursor-pointer select-none py-2 border border-tertiary text-sm hover:bg-violet-600 duration-200 hover:text-primary focus:outline-none first:rounded-t last:rounded-b bg-secondary"
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

      <div className="flex flex-col w-full">
        {mapLayers
          ?.sort((a, b) => (a?.order || 1) * -1 - (b?.order || 1) * -1)
          .map((layer) => {
            return (
              <div
                className={clsx('flex border-b border-tertiary rounded items-center w-full h-12', {
                  'bg-violet-600/5': layer.id_layer === activeLayer,
                })}
                key={`layer.${layer.id_layer}.map.${activeMap}`}>
                <div
                  className="flex items-center justify-center h-full aspect-square bg-secondary p-2 cursor-pointer hover:bg-tertiary duration-200"
                  onClick={() => {
                    setMaps({
                      ...maps,
                      [activeMap!]: {
                        ...maps[activeMap!],
                        layers: maps[activeMap!].layers.map((l) => {
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
                  }}>
                  {layer.enabled ? <Eye weight="duotone" /> : <EyeSlash weight="duotone" />}
                </div>
                <div
                  className={clsx(
                    'px-2 text-xs w-full overflow-hidden text-ellipsis h-full flex items-center gap-2 cursor-pointer hover:bg-tertiary duration-200',
                    {
                      'text-violet-400': layer.id_layer === activeLayer,
                    }
                  )}
                  onClick={() => {
                    setActiveLayer(activeLayer === layer.id_layer ? undefined : layer.id_layer)
                  }}>
                  <div className="w-4 h-full flex items-center justify-center">
                    <span
                      style={{
                        border: `solid 2px ${layer?.style?.stroke || '#007bff'}`,
                        backgroundColor: layer?.style?.fill || 'transparent',
                      }}
                      className={clsx({
                        'w-4 h-4': layer.layer_type === 'Polygon' || layer.layer_type === 'MultiPolygon',
                        'w-4 h-1': layer.layer_type === 'Line' || layer.layer_type === 'LineString',
                        'rounded-full w-2 h-2': layer.layer_type === 'Point',
                      })}
                    />
                  </div>
                  <span className=" whitespace-nowrap overflow-hidden text-ellipsis w-full">{layer.name}</span>
                </div>
                <div
                  className="flex items-center justify-center h-full aspect-square hover:bg-tertiary duration-200 cursor-pointer"
                  onClick={() => {
                    const adapter = new ApiAdapter()
                    adapter.getLayerBBox(layer.id_layer).then((response) => {
                      const bbox = response.bbox.replace('BOX(', '').replace(')', '')
                      const lonLatTuple = bbox.replace(',', ' ')
                      const bBox = lonLatTuple.split(' ').map((c) => parseFloat(c))

                      const extent = transformExtent(bBox, 'EPSG:4326', 'EPSG:3857')
                      map?.getView().fit(extent, { duration: 1000 })
                    })
                  }}>
                  <CrosshairSimple size={24} />
                </div>
              </div>
            )
          })}
      </div>
    </motion.div>
  )
}
