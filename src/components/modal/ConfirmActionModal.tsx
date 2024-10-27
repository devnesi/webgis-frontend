'use client'

import { useInterfaceStore } from '@/core/store/interfaceStore'
import { X } from '@phosphor-icons/react'
import * as Portal from '@radix-ui/react-portal'
import clsx from 'clsx'

export interface ILayerSettingsModalProps {
  onClose?: () => void
  onConfirm?: () => void
  destructive?: boolean
  title: string
  description: string
}

export default function ConfirmActionModal({
  onClose,
  onConfirm,
  destructive,
  title,
  description,
}: ILayerSettingsModalProps) {
  return (
    <Portal.Root className="top-0 left-0 z-[99] fixed flex justify-center items-center bg-black/80 backdrop-blur-sm w-screen h-screen">
      <div className="flex flex-col gap-4 bg-secondary pb-4 rounded-md w-1/2 h-[60vh] h-max min-h-0">
        <div className="flex justify-between border-neutral-800 px-4 py-4 pb-2 border-b">
          <h3 className="mb-2 font-semibold text-lg">{title}</h3>
          <X size={24} className="hover:text-red-400 duration-100 cursor-pointer" onClick={onClose} />
        </div>
        <div className="p-4">{description}</div>
        <div className="flex justify-end items-center gap-2 px-4">
          <div
            className={clsx(
              'inline-flex justify-center items-center bg-transparent hover:bg-black disabled:opacity-50 px-4 py-2 rounded-md h-10 font-semibold text-sm text-white hover:text-white transition duration-300 focus-visible:outline-none cursor-pointer disabled:pointer-events-none'
            )}
            onClick={onClose}>
            Cancelar
          </div>
          <div
            className={clsx(
              'inline-flex justify-center items-center bg-green-400 hover:bg-black disabled:opacity-50 px-4 py-2 rounded-md h-10 font-semibold text-black text-sm hover:text-white transition duration-300 focus-visible:outline-none cursor-pointer disabled:pointer-events-none',
              {
                '!bg-red-400': destructive,
              }
            )}
            onClick={onConfirm}>
            Confirmar
          </div>
        </div>
      </div>
    </Portal.Root>
  )
}
