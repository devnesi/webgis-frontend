'use client'

import { useInterfaceStore } from '@/core/store/interfaceStore'
import { X } from '@phosphor-icons/react'
import * as Portal from '@radix-ui/react-portal'

export interface ILayerSettingsModalProps {
  onClose?: () => void
}

export default function GeometryFormModal({ onClose }: ILayerSettingsModalProps) {
  const { activeGeometry } = useInterfaceStore()

  return (
    <Portal.Root className="top-0 left-0 z-[99] fixed flex justify-center items-center bg-black/80 backdrop-blur-sm w-screen h-screen">
      <div className="flex flex-col gap-4 bg-secondary pb-4 rounded-md w-1/2 h-[60vh] h-max min-h-0">
        <div className="flex justify-between border-neutral-800 px-4 py-4 pb-2 border-b">
          <h3 className="px-2 text-lg">{activeGeometry?.id_geometry || 'Unknown?'}</h3>
          <X size={24} className="hover:text-red-400 duration-100 cursor-pointer" onClick={onClose} />
        </div>
        <div className="flex flex-col gap-4 h-full overflow-y-auto">Baby</div>
      </div>
    </Portal.Root>
  )
}
