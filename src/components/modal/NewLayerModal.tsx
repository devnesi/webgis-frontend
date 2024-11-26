'use client'

import * as Portal from '@radix-ui/react-portal'
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful'
import { CheckCircle, Cube, Palette, UploadSimple, X } from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMemo, useRef, useState } from 'react'
import { useMapStore } from '@/core/store/mapStore'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'
import { useOL } from 'rlayers'
import clsx from 'clsx'

export interface ILayerSettingsModalProps {
  onClose?: () => void
  title: string
  onConfirm?: () => void
}

export default function NewLayerModal({ onClose, title }: ILayerSettingsModalProps) {
  const { activeMap, setEditorTool, setActiveGeometryID, setPendingGeometry } = useInterfaceStore()
  const { map } = useOL()
  const { maps, setMaps } = useMapStore()

  const [layerFillColor, setLayerFillColor] = useState('#0193e6')
  const [layerStrokeColor, setLayerStrokeColor] = useState('#00f0ff')
  const [layerType, setLayerType] = useState<API.RAW.Layer_type | null>(null)
  const layerNameInput = useRef<HTMLInputElement>(null)

  const adapater = useMemo(() => new ApiAdapter(), [])
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
    <Portal.Root className="top-0 left-0 z-[99] fixed flex justify-center items-center bg-black/80 backdrop-blur-sm w-screen h-screen">
      <div className="flex flex-col gap-4 bg-secondary pb-4 rounded-md w-1/2 h-[60vh] h-max min-h-0">
        <div className="flex justify-between border-neutral-800 px-4 py-4 pb-2 border-b">
          <h3 className="px-2 text-lg">{title}</h3>
          <X size={24} className="hover:text-red-400 duration-100 cursor-pointer" onClick={onClose} />
        </div>
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          <div className="relative border-neutral-800 focus-within:border-accent mx-4 px-3 pt-2.5 pb-1.5 border rounded-md focus-within:ring focus-within:ring-accent/30 duration-200 group">
            <div className="flex justify-between">
              <label className="group-focus-within:text-white font-medium text-gray-400 text-muted-foreground text-xs">
                Nome
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="name"
                name="name"
                ref={layerNameInput}
                className="block border-0 border-white/10 bg-transparent file:my-1 p-0 focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-muted-foreground/90 focus:outline-none sm:leading-7"
              />
            </div>
          </div>
          
          <div className='grid grid-cols-2'>
            <div className="flex flex-col gap-2 border-neutral-800 mx-4 p-2 border rounded-md">
              <h6 className="flex items-center gap-1 text-neutral-500 text-sm">
                <Palette /> Cor de preenchimento
              </h6>
              <HexAlphaColorPicker className="!w-full !max-w-none !h-42" color={layerFillColor} onChange={setLayerFillColor} />
              <HexColorInput
                className="border-neutral-500 bg-black/20 p-2 rounded"
                color={layerFillColor}
                onChange={setLayerFillColor}
              />
            </div>
            <div className="flex flex-col gap-2 border-neutral-800 mx-4 p-2 border rounded-md">
              <h6 className="flex items-center gap-1 text-neutral-500 text-sm">
                <Palette /> Cor de borda
              </h6>
              <HexAlphaColorPicker
                className="!w-full !max-w-none !h-42"
                color={layerStrokeColor}
                onChange={setLayerStrokeColor}
              />
              <HexColorInput
                className="border-neutral-500 bg-black/20 p-2 rounded"
                color={layerStrokeColor}
                onChange={setLayerStrokeColor}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2 border-neutral-800 mx-4 p-2 border rounded-md">
            <h6 className="flex items-center gap-1 text-neutral-500 text-sm">
              <Cube /> Tipo de camada
            </h6>
            <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
              {(['LineString', 'Point', 'Polygon'] as API.RAW.Layer_type[]).map((type) => {
                return (
                  <div
                    className={clsx(
                      'flex items-center gap-2 border-white/20 hover:bg-accent px-2 py-1 border hover:border-black rounded w-full text-white hover:text-black duration-100 cursor-pointer',
                      {
                        'bg-white !text-black': type === layerType,
                      }
                    )}
                    key={`type.selection.${type}`}
                    onClick={() => {
                      setLayerType(type)
                    }}>
                    {type === layerType && <CheckCircle weight="duotone" />} {type}
                  </div>
                )
              })}
            </div>
          </div>
          <div
            className="flex items-center gap-2 bg-primary hover:bg-accent mr-4 ml-auto px-4 py-2 rounded-md duration-100 cursor-pointer"
            onClick={() => {
              if (!layerNameInput?.current?.value || !layerType) {
                return
              }

              adapater
                .createLayer({
                  map: activeMap!,
                  layer_type: layerType,
                  name: layerNameInput.current.value,
                  style: {
                    fill: layerFillColor,
                    stroke: layerStrokeColor,
                  },
                })
                .then((data) => {
                  onClose?.()
                  if (!maps[data.map].layers) {
                    return
                  }

                  maps[data.map].layers.push(data)

                  setMaps({
                    ...maps,
                    [data.map]: {
                      ...maps[data.map],
                      layers: maps[data.map].layers,
                    },
                  })
                  clearLayers()
                })
            }}>
            <UploadSimple /> Salvar
          </div>
        </div>
      </div>
    </Portal.Root>
  )
}
