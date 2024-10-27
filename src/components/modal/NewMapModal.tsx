'use client'

import * as Portal from '@radix-ui/react-portal'
import { UploadSimple, X } from '@phosphor-icons/react'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { useMemo, useRef, useState } from 'react'
import { useMapStore } from '@/core/store/mapStore'
import { ApiAdapter } from '@/core/adapter/apiAdapter'
export interface ILayerSettingsModalProps {
  onClose?: () => void
  title: string
  onConfirm?: () => void
}

export default function NewMapModal({ onClose, title }: ILayerSettingsModalProps) {
  const { setActiveMap } = useInterfaceStore()
  const { maps, setMaps } = useMapStore()
  const mapNameInput = useRef<HTMLInputElement>(null)

  const adapater = useMemo(() => new ApiAdapter(), [])

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
                ref={mapNameInput}
                className="block border-0 border-white/10 bg-transparent file:my-1 p-0 focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-muted-foreground/90 focus:outline-none sm:leading-7"
              />
            </div>
          </div>
          <div
            className="flex items-center gap-2 bg-primary hover:bg-accent mr-4 ml-auto px-4 py-2 rounded-md duration-100 cursor-pointer"
            onClick={() => {
              if (!mapNameInput?.current?.value) {
                return
              }

              adapater
                .createMap({
                  name: mapNameInput.current.value,
                })
                .then((map) => {
                  setMaps({
                    ...maps,
                    [map.id_map]: { ...map, layers: [] },
                  })
                  setActiveMap(map.id_map)
                  onClose?.()
                })
                .catch((e) => {
                  console.log('erro', e)

                  onClose?.()
                })
            }}>
            <UploadSimple /> Salvar
          </div>
        </div>
      </div>
    </Portal.Root>
  )
}
