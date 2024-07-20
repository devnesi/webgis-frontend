'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { ArrowsDownUp, PlusCircle, Table, Textbox, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LineString, Polygon } from 'ol/geom'

export default function GeometryPanel() {
  const { activeGeometryID, activeGeometry, setActiveLayer, setActiveGeometryID, activeLayer } = useInterfaceStore()
  const [isFormListOpen, setFormListOpen] = useState<boolean>(false)
  const [activeForm, setActiveForm] = useState<API.RAW.form | null>(null)
  // const [temporaryGeometry, setTemporaryGeometry] = useState<API.GEOMETRY.detail | null>()
  const adapter = useMemo(() => new ApiAdapter(), [])
  const forms: API.LAYER.listForms = {
    forms: [
      {
        id_form: 123,
        name: 'formulario 1',
        fields: [
          {
            id_field: 1,
            name: 'campo',
            value_string: 'abc',
          },
        ],
      },
    ],
  }

  const geometryArea = useMemo(() => {
    if (activeGeometry?.geom?.type === 'Polygon') {
      // @ts-expect-error - Different types, same properties
      return new Polygon(activeGeometry?.geom?.coordinates)?.transform('EPSG:4326', 'EPSG:3857')?.getArea()
    }

    return 0
  }, [activeGeometry])

  const geometryPerimeter = useMemo(() => {
    if (activeGeometry?.geom?.type === 'Polygon') {
      // @ts-expect-error - Different types, same properties
      const polygon = new Polygon(activeGeometry?.geom?.coordinates)?.transform('EPSG:4326', 'EPSG:3857')
      // @ts-expect-error - Different types, same properties
      const exteriorRing = new LineString(polygon?.getLinearRing(0)?.getCoordinates())

      return exteriorRing.getLength()
    }

    if (activeGeometry?.geom?.type === 'LineString' || activeGeometry?.geom?.type === 'Line') {
      return new LineString(activeGeometry?.geom?.coordinates)?.transform('EPSG:4326', 'EPSG:3857')?.getLength()
    }

    return 0
  }, [activeGeometry])

  useEffect(() => {
    if (!activeLayer) return

    // adapter.getLayerForm(activeLayer).then((result) => {
    //   console.log(result)
    // })
  }, [activeLayer])

  return (
    <motion.div
      className="w-full flex flex-col bg-secondary border-l border-white/10"
      key="geometry-panel"
      transition={{
        duration: 0.2,
        bounce: false,
      }}
      initial={{
        width: 0,
        minWidth: 0,
      }}
      animate={{
        x: 0,
        minWidth: '350px',
      }}
      exit={{
        width: 0,
        minWidth: 0,
      }}>
      <div className="flex justify-between w-full p-4 border-b border-white/10">
        <span className="font-semibold text-sm text-white/60">
          {activeGeometryID
            ? `Geometria [${activeGeometryID}]`
            : activeLayer
            ? `Camada [${activeLayer}]`
            : 'Nenhum objeto selecionado'}
        </span>
        <X
          className="cursor-pointer hover:text-red-400 duration-200"
          onClick={() => {
            if (!activeGeometryID && activeLayer) {
              setActiveLayer(undefined)
            }
            if (activeGeometryID) {
              setActiveGeometryID(undefined)
            }
          }}
        />
      </div>
      <div className="flex gap-2 justify-between items-center overflow-hidden w-full p-4">
        <span className="w-1/2 text-sm">Área</span>
        <strong className="w-1/2 font-semibold text-right  text-xs">{geometryArea?.toFixed(2)}m²</strong>
      </div>
      <div className="flex gap-2 justify-between items-center overflow-hidden w-full p-4">
        <span className="w-1/2 text-sm">Perímetro</span>
        <strong className="w-1/2 font-semibold text-right  text-xs">{geometryPerimeter?.toFixed(2)}m</strong>
      </div>
      <DropdownMenu.Root open={isFormListOpen} onOpenChange={setFormListOpen}>
        <DropdownMenu.Trigger asChild>
          <div className="flex justify-between items-center w-full border-y border-tertiary bg-secondary p-4 text-sm cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <Table weight="duotone" /> {activeForm ? activeForm.name : 'Selecione um formulário'}
            </span>
            <ArrowsDownUp />
          </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <AnimatePresence>
            {isFormListOpen && (
              <DropdownMenu.Content className="w-full z-[52] min-w-[350px] shadow-2xl" sideOffset={0}>
                <motion.div
                  className="w-full h-full"
                  initial={{
                    opacity: 0.6,
                    y: '-20%',
                    translateY: -8,
                    scaleY: 0.6,
                  }}
                  transition={{
                    duration: 0.2,
                    bounce: false,
                  }}
                  animate={{ opacity: 1, translateY: 0, scaleY: 1, y: 0 }}
                  exit={{ opacity: 0.6, translateY: -8, scaleY: 0.6, y: '-20%' }}
                  key="map-list">
                  {forms.forms.map((form) => {
                    return (
                      <DropdownMenu.Item
                        className="px-4 cursor-pointer select-none py-2 border border-tertiary text-sm hover:bg-violet-600 duration-200 hover:text-primary focus:outline-none first:rounded-t last:rounded-b bg-secondary"
                        key={`map.select.${form.name}`}
                        onClick={() => {
                          setActiveForm(form)
                        }}>
                        <span className="flex items-center gap-2">
                          <Textbox weight="duotone" /> {form.name || 'Sem nome'}
                        </span>
                      </DropdownMenu.Item>
                    )
                  })}
                  <div className="px-4 cursor-pointer select-none py-2 border border-tertiary text-sm hover:bg-green-400 duration-200 hover:text-primary focus:outline-none first:rounded-t last:rounded-b bg-secondary flex items-center gap-2 text-green-400">
                    <PlusCircle weight="duotone" /> Criar novo formulário
                  </div>
                </motion.div>
              </DropdownMenu.Content>
            )}
          </AnimatePresence>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* LAYER FORM STRUCTURE | READ-ONLY */}
      <div className="h-full overflow-y-auto min-h-0">
        {activeForm?.fields.map((field) => {
          return (
            <div className="flex flex-col gap-2" key={`form.field.${field.id_field}`}>
              <div className="flex gap-2 justify-between items-center overflow-hidden w-full p-4">
                <span className="w-1/2 text-sm">{field.name}</span>
                <strong className="w-1/2 font-semibold text-right text-xs">
                  {field?.value_number || field?.value_string || 'Sem valor'}
                </strong>
              </div>
            </div>
          )
        })}
      </div>
      <hr className="border-white/10" />
      {activeForm && (
        <div className="flex justify-center items-center w-full p-2">
          <button className="text-white/60 text-sm font-semibold border-transparent border duration-200 hover:text-primary hover:bg-violet-400 rounded-md p-4 hover:border-white/20 w-full">
            Gerenciar formulário
          </button>
        </div>
      )}
    </motion.div>
  )
}
