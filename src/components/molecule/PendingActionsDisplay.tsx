'use client'

import { usePathname } from 'next/navigation'
import MapControl from '../atom/MapControl'
import { useInterfaceStore } from '@/core/store/interfaceStore'

export default function PendingActionsDisplay() {
  const { pendingGeometry, activeGeometry } = useInterfaceStore()
  const route = usePathname()
  return route.startsWith('/editor') ? (
    <div className="flex justify-center gap-2 p-2 h-min text-sm pointer-events-none grow">
      {pendingGeometry && (
        <div className="flex items-center gap-2 bg-black px-2 py-1 rounded-md">
          <span className="bg-neutral-800 px-1 py-1 text-neutral-400 text-xs">Ctrl+S</span>Para salvar
        </div>
      )}
      {activeGeometry && (
        <>
          <div className="flex items-center gap-2 bg-black px-2 py-1 rounded-md">
            <span className="bg-neutral-800 px-1 py-1 text-neutral-400 text-xs">Esc</span>Para cancelar
          </div>
          <div className="flex items-center gap-2 bg-black px-2 py-1 rounded-md">
            <span className="bg-neutral-800 px-1 py-1 text-neutral-400 text-xs">Delete</span>Para excluir
          </div>
        </>
      )}
    </div>
  ) : null
}
