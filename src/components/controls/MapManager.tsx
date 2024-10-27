import MapControls from './MapControls'
import LayersPanel from './LayersPanel'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import GeometryPanel from './GeometryPanel'
import { AnimatePresence } from 'framer-motion'
import EditorControls from './EditorControls'
import PendingActionsDisplay from './PendingActionsDisplay'

export default function MapManager({ children }: { children?: React.ReactNode | React.ReactNode[] }) {
  const { activePanel } = useInterfaceStore()

  return (
    <div className="top-0 right-0 z-[50] absolute flex w-full h-full pointer-events-none select-none">
      {children}
      <AnimatePresence presenceAffectsLayout mode="popLayout">
        {(activePanel === 'layers' || activePanel === 'compactLayers') && <LayersPanel />}
      </AnimatePresence>
      <EditorControls />
      <PendingActionsDisplay />
      <MapControls />
      <AnimatePresence presenceAffectsLayout mode="popLayout">
        {activePanel === 'layers' && <GeometryPanel />}
      </AnimatePresence>
    </div>
  )
}
