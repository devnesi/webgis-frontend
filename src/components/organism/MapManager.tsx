import MapControls from '../molecule/MapControls'
import LayersPanel from '../molecule/LayersPanel'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import GeometryPanel from '../molecule/GeometryPanel'
import { AnimatePresence } from 'framer-motion'
import EditorControls from '../atom/EditorControls'
import LayerEditor from '../molecule/LayerEditor'

export default function MapManager() {
  const { activeLayer, activePanel, activeGeometryID: activeGeometry } = useInterfaceStore()

  return (
    <div className="top-0 right-0 z-[50] absolute flex w-full h-full pointer-events-none">
      <EditorControls />
      <MapControls />
      <AnimatePresence presenceAffectsLayout mode="popLayout">
        {activePanel === 'layers' && <LayersPanel />}
      </AnimatePresence>
      <AnimatePresence presenceAffectsLayout mode="popLayout">
        {(activeLayer || activeGeometry) && <GeometryPanel />}
      </AnimatePresence>
    </div>
  )
}
