'use client'

import * as Portal from '@radix-ui/react-portal'
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful'
import { Palette, UploadSimple, X } from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMapStore } from '@/core/store/mapStore'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorLayer from 'ol/layer/Vector'
import { useOL } from 'rlayers'

export interface ILayerSettingsModalProps {
  onClose?: () => void
}

export default function LayerSettingsModal({ onClose }: ILayerSettingsModalProps) {
  const { activeMap, activeLayer, setEditorTool, setActiveGeometryID, setPendingGeometry } = useInterfaceStore()
  const { map } = useOL()
  const { maps, setMaps } = useMapStore()

  const [activeLayerData, setActiveLayerData] = useState<API.RAW.Layer | undefined>(undefined)
  const [layerEditorFillColor, setLayerEditorFillColor] = useState(
    activeLayerData ? activeLayerData?.style?.fill || '#0193e6' : '#0193e6'
  )
  const [layerEditorStrokeColor, setLayerEditorStrokeColor] = useState(
    activeLayerData ? activeLayerData?.style?.stroke || '#00f0ff' : '#00f0ff'
  )
  const layerEditorNameInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!activeLayer) return
    const layer = maps[activeMap || 0]?.layers.find((l) => l.id_layer === activeLayer)
    if (!layer) return

    setLayerEditorFillColor(layer.style?.fill || '#0193e6')
    setLayerEditorStrokeColor(layer.style?.stroke || '#00f0ff')
    setActiveLayerData(layer)
  }, [activeLayer, setActiveLayerData, maps, activeMap, setLayerEditorFillColor, setLayerEditorStrokeColor])
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
          <h3 className="px-2 text-lg">{activeLayerData?.name || 'Unknown?'}</h3>
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
                defaultValue={activeLayerData?.name}
                ref={layerEditorNameInput}
                className="block border-0 border-white/10 bg-transparent file:my-1 p-0 focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-muted-foreground/90 focus:outline-none sm:leading-7"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 border-neutral-800 mx-4 p-2 border rounded-md">
            <h6 className="flex items-center gap-1 text-neutral-500 text-sm">
              <Palette /> Cor de preenchimento
            </h6>
            <HexAlphaColorPicker
              className="!w-full !max-w-none"
              color={layerEditorFillColor}
              onChange={setLayerEditorFillColor}
            />
            <HexColorInput
              className="border-neutral-500 bg-black/20 p-2 rounded"
              color={layerEditorFillColor}
              onChange={setLayerEditorFillColor}
            />
          </div>
          <div className="flex flex-col gap-2 border-neutral-800 mx-4 p-2 border rounded-md">
            <h6 className="flex items-center gap-1 text-neutral-500 text-sm">
              <Palette /> Cor de borda
            </h6>
            <HexAlphaColorPicker
              className="!w-full !max-w-none"
              color={layerEditorStrokeColor}
              onChange={setLayerEditorStrokeColor}
            />
            <HexColorInput
              className="border-neutral-500 bg-black/20 p-2 rounded"
              color={layerEditorStrokeColor}
              onChange={setLayerEditorStrokeColor}
            />
          </div>
          <div
            className="flex items-center gap-2 bg-primary hover:bg-accent mr-4 ml-auto px-4 py-2 rounded-md duration-100 cursor-pointer"
            onClick={() => {
              if (!activeLayerData) return

              adapater
                .updateLayerSpecification({
                  ...activeLayerData,
                  name: layerEditorNameInput.current?.value || activeLayerData.name,
                  style: {
                    fill: layerEditorFillColor,
                    stroke: layerEditorStrokeColor,
                  },
                })
                .then(() => {
                  onClose?.()
                  setMaps({
                    ...maps,
                    [activeMap!]: {
                      ...maps[activeMap!],
                      layers: maps[activeMap!].layers.map((l) => {
                        if (l.id_layer === activeLayer) {
                          return {
                            ...l,
                            name: layerEditorNameInput.current?.value || activeLayerData.name,
                            style: {
                              fill: layerEditorFillColor,
                              stroke: layerEditorStrokeColor,
                            },
                          }
                        }
                        return l
                      }),
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
