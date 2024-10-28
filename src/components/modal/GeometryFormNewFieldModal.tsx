'use client'

import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { UploadSimple, X } from '@phosphor-icons/react'
import * as Portal from '@radix-ui/react-portal'
import { useMemo, useRef } from 'react'

export interface IGeometryFormNewFieldModalProps {
  onClose?: () => void
  onConfirm?: (name: string) => void
  formId: number
}

export default function GeometryFormNewFieldModal({ onClose, formId, onConfirm }: IGeometryFormNewFieldModalProps) {
  const fieldNameInput = useRef<HTMLInputElement>(null)
  const adapter = useMemo(() => new ApiAdapter(), [])
  const { activeLayer } = useInterfaceStore()

  return (
    <Portal.Root className="top-0 left-0 z-[99] fixed flex justify-center items-center bg-black/80 backdrop-blur-sm w-screen h-screen">
      <div className="flex flex-col gap-4 bg-secondary pb-4 rounded-md w-1/2 h-max min-h-0 max-h-[60vh]">
        <div className="flex justify-between border-neutral-800 px-4 py-4 pb-2 border-b">
          <h3 className="mb-2 font-semibold text-lg">Novo campo</h3>
          <X size={24} className="hover:text-red-400 duration-100 cursor-pointer" onClick={onClose} />
        </div>

        <div className="relative border-neutral-800 focus-within:border-accent mx-4 px-3 pt-2.5 pb-1.5 border rounded-md focus-within:ring focus-within:ring-accent/30 duration-200 group">
          <div className="flex justify-between">
            <label className="group-focus-within:text-white font-medium text-gray-400 text-muted-foreground text-xs">
              Nome
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              name="name"
              ref={fieldNameInput}
              className="block border-0 border-white/10 bg-transparent file:my-1 p-0 focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-muted-foreground/90 focus:outline-none sm:leading-7"
            />
          </div>
        </div>
        <div
          className="flex items-center gap-2 bg-primary hover:bg-accent mr-4 ml-auto px-4 py-2 rounded-md duration-100 cursor-pointer"
          onClick={() => {
            if (!activeLayer || !fieldNameInput.current?.value) {
              return
            }

            onConfirm?.(fieldNameInput.current.value)
          }}>
          <UploadSimple /> Salvar
        </div>
      </div>
    </Portal.Root>
  )
}
