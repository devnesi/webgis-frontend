import MapControls from '../molecule/MapControls'
import LayersPanel from '../molecule/LayersPanel'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import GeometryPanel from '../molecule/GeometryPanel'
import { motion, AnimatePresence } from 'framer-motion'

export default function MapManager() {
  const { activeLayer, activePanel, activeGeometryID: activeGeometry } = useInterfaceStore()

  return (
    <div className="absolute right-0 top-0 h-full flex z-[50]">
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
