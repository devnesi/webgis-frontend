'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { ArrowLineRight, ArrowsDownUp, PlusCircle, Table, Textbox, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LineString, Polygon } from 'ol/geom'
import { debounce } from '@/core/utils/debounce'
import clsx from 'clsx'

export default function GeometryPanel() {
  const { activeGeometryID, activeGeometry, setActivePanel, activeLayer, activePanel } = useInterfaceStore()
  const [isFormListOpen, setFormListOpen] = useState<boolean>(false)
  const [activeForm, setActiveForm] = useState<API.RAW.Form | null>(null)
  const [forms, setForms] = useState<API.GEOMETRY.listForms | null>(null)
  // const [temporaryGeometry, setTemporaryGeometry] = useState<API.GEOMETRY.detail | null>()
  const adapter = useMemo(() => new ApiAdapter(), [])
  // const forms: API.GEOMETRY.listForms = {
  //   forms: [
  //     {
  //       id_form: 123,
  //       name: 'formulario 1',
  //       fields: [
  //         {
  //           id_field: 1,
  //           name: 'campo',
  //           value_string: 'abc',
  //         },
  //       ],
  //     },
  //   ],
  // }

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

  const formUpdateDebounces = useMemo(
    () =>
      debounce((form: API.RAW.Form) => {
        if (!form || !activeGeometryID) return
        adapter.updateForm(activeGeometryID, {
          forms: [
            {
              id_form: form.id_form,
              name: form.name,
              fields_values: form.fields_values,
            },
          ],
        })
      }, 500),
    []
  )

  useEffect(() => {
    if (typeof activeGeometryID !== 'number') return
    ;(async () => {
      try {
        const formsAndValues = await adapter.getGeometryFormAndValues(activeGeometryID)
        setForms(formsAndValues)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [activeGeometryID])

  return (
    <motion.div
      className="relative z-[51] flex flex-col bg-[#161616] w-full h-full pointer-events-auto select-none"
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
      <div className="flex justify-between border-white/10 p-4 border-b w-full">
        <span className="font-semibold text-sm text-white/60">
          {activeGeometryID
            ? `Geometria [${activeGeometryID}]`
            : activeLayer
            ? `Camada [${activeLayer}]`
            : 'Nenhum objeto selecionado'}
        </span>
        <ArrowLineRight
          className="hover:text-red-400 duration-200 cursor-pointer"
          onClick={() => {
            // if (!activeGeometryID && activeLayer) {
            //   setActiveLayer(undefined)
            // }
            setActivePanel(activePanel !== 'compactLayers' ? 'compactLayers' : 'layers')
          }}
        />
      </div>
      <div className="flex justify-between items-center gap-2 p-4 w-full overflow-hidden">
        <span className="w-1/2 text-sm">Área</span>
        <strong className="text-right w-1/2 font-semibold text-xs">{geometryArea?.toFixed(2)}m²</strong>
      </div>
      <div className="flex justify-between items-center gap-2 p-4 w-full overflow-hidden">
        <span className="w-1/2 text-sm">Perímetro</span>
        <strong className="text-right w-1/2 font-semibold text-xs">{geometryPerimeter?.toFixed(2)}m</strong>
      </div>
      {/* LAYER FORM STRUCTURE */}
      {activeGeometry && (
        <>
          <DropdownMenu.Root open={isFormListOpen} onOpenChange={setFormListOpen}>
            <DropdownMenu.Trigger asChild>
              <div className="flex justify-between items-center border-y bg-secondary p-4 border-tertiary w-full text-sm cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <Table weight="duotone" /> {activeForm ? activeForm.name : 'Selecione um formulário'}
                </span>
                <ArrowsDownUp />
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <AnimatePresence>
                {isFormListOpen && (
                  <DropdownMenu.Content className="z-[52] shadow-2xl w-full min-w-[350px]" sideOffset={0}>
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
                      {forms?.forms?.map((form) => {
                        return (
                          <DropdownMenu.Item
                            className="bg-secondary hover:bg-accent px-4 py-2 border border-tertiary first:rounded-t last:rounded-b text-sm hover:text-primary duration-200 cursor-pointer select-none focus:outline-none"
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
                      <div className="flex items-center gap-2 bg-secondary hover:bg-green-400 px-4 py-2 border border-tertiary first:rounded-t last:rounded-b text-green-400 text-sm hover:text-primary duration-200 cursor-pointer select-none focus:outline-none">
                        <PlusCircle weight="duotone" /> Criar novo formulário
                      </div>
                    </motion.div>
                  </DropdownMenu.Content>
                )}
              </AnimatePresence>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <div className="h-full min-h-0 overflow-y-auto">
            {activeForm?.fields_values?.map((field) => {
              return (
                <div className="flex flex-col gap-2" key={`form.field.${field.id_field}`}>
                  <div className="flex justify-between items-center gap-2 p-4 w-full overflow-hidden">
                    <span className="w-1/2 text-sm">{field.name}</span>
                    <input
                      className="block focus:border-1 focus:border-accent bg-primary file:my-1 px-2 py-1 p-0 border border-transparent rounded-md focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-white/60 sm:leading-7 focus:outline-none"
                      defaultValue={field?.value_string || undefined}
                      placeholder={field?.value_string ?? 'Sem valor'}
                      type={field?.type === 'Number' ? 'number' : 'text'}
                      onChange={(e) => {
                        formUpdateDebounces({
                          ...activeForm,
                          fields_values: activeForm.fields_values.map((f) => {
                            if (f.id_field === field.id_field) {
                              return {
                                ...f,
                                value_string: e.target.value,
                              }
                            }

                            return f
                          }),
                        })
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <hr className="border-white/10" />
          {activeForm && (
            <div className="flex justify-center items-center p-2 w-full">
              <button className="hover:border-white/20 hover:bg-accent p-4 border border-transparent rounded-md w-full font-semibold text-sm text-white/60 hover:text-primary duration-200">
                Editar Formulário
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
