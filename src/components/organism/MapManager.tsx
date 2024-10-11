import MapControls from '../molecule/MapControls'
import LayersPanel from '../molecule/LayersPanel'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import GeometryPanel from '../molecule/GeometryPanel'
import { AnimatePresence } from 'framer-motion'
import EditorControls from '../molecule/EditorControls'
import LayerEditor from '../molecule/LayerEditor'
import GeometrySettingsModal from '../molecule/GeometrySettingsModal'
import PendingActionsDisplay from '../molecule/PendingActionsDisplay'

export default function MapManager({ children }: { children?: React.ReactNode | React.ReactNode[] }) {
  const { activePanel } = useInterfaceStore()

  return (
    <div className="top-0 right-0 z-[50] absolute flex w-full h-full pointer-events-none select-none">
      {children}
      <EditorControls />
      <PendingActionsDisplay />
      <MapControls />
      <AnimatePresence presenceAffectsLayout mode="popLayout">
        {(activePanel === 'layers' || activePanel === 'compactLayers') && <LayersPanel />}
      </AnimatePresence>
      <AnimatePresence presenceAffectsLayout mode="popLayout">
        {activePanel === 'layers' && <GeometryPanel />}
      </AnimatePresence>
    </div>
  )
}
