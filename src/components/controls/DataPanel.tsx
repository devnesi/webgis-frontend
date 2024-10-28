'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { ApiAdapter } from '@/core/adapter/apiAdapter'
import { useInterfaceStore } from '@/core/store/interfaceStore'
import { ArrowsDownUp, PlusCircle, Table, Textbox, TrashSimple } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LineString, Polygon } from 'ol/geom'
import { debounce, DebouncedFunction } from '@/core/utils/debounce'
import clsx from 'clsx'
import { Coordinate } from 'ol/coordinate'
import GeometryFormModal from '../modal/GeometryFormModal'
import GeometryFormManagementModal from '../modal/GeometryFormManagementModal'
import GeometryFormNewFieldModal from '../modal/GeometryFormNewFieldModal'
import ConfirmActionModal from '../modal/ConfirmActionModal'
import { usePathname } from 'next/navigation'

export default function DataPanel() {
  const path = usePathname()
  const { activeGeometryID, activeGeometry, setActiveGeometryID, activeLayer, activeMap, setActiveLayer } =
    useInterfaceStore()
  const [isFormListOpen, setFormListOpen] = useState<boolean>(false)
  const [activeForm, setActiveForm] = useState<API.RAW.Form | null>(null)
  const [forms, setForms] = useState<API.LAYER.listForms>([])
  const [fieldValues, setFieldValues] = useState<{
    [key: number]: Array<
      API.RAW.FormField & { debounce: DebouncedFunction<any[], (form: API.RAW.Form, field: API.RAW.FormField) => void> }
    >
  }>([])
  const [showFormCreator, setShowFormCreator] = useState<boolean>(false)
  const [showFormManager, setShowFormManager] = useState<boolean>(false)
  const [showNewFieldModal, setShowNewFieldModal] = useState<boolean>(false)
  const [showConfirmDeleteFieldModal, setShowConfirmDeleteFieldModal] = useState<boolean>(false)
  const [showConfirmDeleteLayerModal, setShowConfirmDeleteLayerModal] = useState<boolean>(false)
  const [pendingFieldToDelete, setPendingFieldToDelete] = useState<API.RAW.FormField | null>(null)
  const adapter = useMemo(() => new ApiAdapter(), [])
  const activeFormInputRef = useRef<HTMLInputElement | null>(null)

  const geometryArea = useMemo(() => {
    if (activeGeometry?.geom?.type === 'Polygon') {
      return new Polygon(activeGeometry?.geom?.coordinates as unknown as Array<Array<Coordinate>>)
        ?.transform('EPSG:4326', 'EPSG:3857')
        ?.getArea()
    }

    return 0
  }, [activeGeometry])

  const geometryPerimeter = useMemo(() => {
    if (activeGeometry?.geom?.type === 'Polygon') {
      const polygon = new Polygon(activeGeometry?.geom?.coordinates as unknown as Array<Array<Coordinate>>)?.transform(
        'EPSG:4326',
        'EPSG:3857'
      )
      const exteriorRing = new LineString(polygon?.getLinearRing(0)?.getCoordinates() as unknown as Array<Coordinate>)

      return exteriorRing.getLength()
    }

    if (activeGeometry?.geom?.type === 'LineString') {
      return new LineString(activeGeometry?.geom?.coordinates)?.transform('EPSG:4326', 'EPSG:3857')?.getLength()
    }

    return 0
  }, [activeGeometry])

  const fieldUpdateDebounces = debounce((fieldID: number, name: string) => {
    if (!activeForm || !fieldID) return
    adapter.updateField(fieldID, { name, formID: activeForm!.id_form }).then(() => {
      const formObject = forms.find((f) => f.id_form === activeForm.id_form)
      if (!formObject) return

      const fieldIndex = formObject.fields.findIndex((f) => f.id_field === fieldID)
      if (fieldIndex < 0) return

      formObject.fields[fieldIndex].name = name
      setForms([...forms])
    })
  }, 300)

  const updateFormNameDebounces = debounce((name: string) => {
    if (!activeForm || !activeMap || !name || typeof activeLayer !== 'number') return

    adapter.updateFormName(activeForm.id_form, { name: name, layer: activeLayer }).then(() => {
      setActiveForm({
        ...activeForm,
        name,
      })
      setForms((prev) => {
        const formIndex = prev.findIndex((f) => f.id_form === activeForm.id_form)
        if (formIndex < 0) return prev

        const newForm = prev[formIndex]
        newForm.name = name
        prev[formIndex] = newForm

        return [...prev]
      })
    })
  }, 300)

  const currentFormFields = useMemo<Array<API.RAW.FormField>>(() => {
    if (!activeForm) return []

    return forms.find((f) => f.id_form === activeForm.id_form)?.fields || []
  }, [activeForm, forms])

  useEffect(() => {
    setActiveForm(null)
    if (typeof activeLayer !== 'number' || pendingFieldToDelete) return
    ;(async () => {
      try {
        const forms = await adapter.getLayerForms(activeLayer)
        setForms(forms)
        if (forms.length > 0) {
          setActiveForm(forms[0])
        }
      } catch (e) {
        console.error(e)
      }
    })()
  }, [activeLayer, adapter, pendingFieldToDelete])

  useEffect(() => {
    if (typeof activeGeometryID !== 'number' || forms.length < 1 || pendingFieldToDelete) return
    setFieldValues({})
    ;(async () => {
      try {
        const fieldValues: {
          [key: number]: Array<API.RAW.FormField & { debounce: DebouncedFunction<any[], (form: API.RAW.Form) => void> }>
        } = {}
        const formsAndValues = await adapter.getGeometryFormAndValues(activeGeometryID)
        formsAndValues.forms.forEach((form) => {
          fieldValues[form.id_form] = []
          form.fields_values.forEach((field) => {
            fieldValues[form.id_form].push({
              ...field,
              debounce: debounce((form: API.RAW.Form, field: API.RAW.FormField) => {
                setFieldValues((prev) => {
                  const formFieldsAndValues = fieldValues[form.id_form]

                  if (!activeGeometryID) {
                    return prev
                  }

                  const newFieldAndValues = {
                    ...prev,
                    [form.id_form]: formFieldsAndValues.map((fv) => {
                      if (fv.id_field === field.id_field) {
                        return {
                          ...fv,
                          value_string: field.value_string,
                        }
                      }

                      return fv
                    }),
                  }
                  const fieldIndex = formFieldsAndValues.findIndex((f) => f.id_field === field.id_field)
                  adapter.updateFormValues(activeGeometryID, {
                    forms: [
                      {
                        ...form,
                        fields_values: [newFieldAndValues[form.id_form][fieldIndex]],
                      },
                    ],
                  })

                  return newFieldAndValues
                })
              }, 300),
            })
          })
        })
        setFieldValues(fieldValues)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [forms, activeGeometryID, adapter, pendingFieldToDelete])

  useEffect(() => {
    if (activeMap) {
      setForms([])
      setActiveForm(null)
      setFieldValues({})
    }
  }, [activeMap])

  useEffect(() => {
    if (!activeFormInputRef.current) {
      return
    }
    activeFormInputRef.current.value = activeForm?.name || 'Sem nome'
  }, [activeForm])

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
      {typeof activeGeometryID !== 'number' && typeof activeLayer !== 'number' && (
        <div className="flex justify-center items-center p-4 w-full h-full">
          <span className="text-white/60">Nenhum objeto selecionado</span>
        </div>
      )}
      {showFormCreator && (
        <GeometryFormModal
          onClose={() => {
            setShowFormCreator(false)
          }}
          onConfirm={(name) => {
            if (!activeLayer) {
              return
            }

            adapter
              .createForm({
                name: name,
                layer: activeLayer,
              })
              .then((f) => {
                setForms([...forms, { ...f, fields: [] }])
                setShowFormCreator(false)
                setActiveForm(f)
                setActiveGeometryID(undefined)
              })
          }}
        />
      )}
      {showFormManager && (
        <GeometryFormManagementModal
          onClose={() => {
            setShowFormManager(false)
          }}
        />
      )}
      {showConfirmDeleteFieldModal && pendingFieldToDelete && (
        <ConfirmActionModal
          destructive
          title="Excluir campo"
          description="Excluir este campo é uma ação irreversível. Deseja continuar?"
          onClose={() => {
            setShowConfirmDeleteFieldModal(false)
          }}
          onConfirm={() => {
            if (!pendingFieldToDelete) return

            adapter
              .deleteField(pendingFieldToDelete.id_field)
              .then(() => {
                setPendingFieldToDelete(null)
                setShowConfirmDeleteFieldModal(false)
              })
              .catch(() => {
                setPendingFieldToDelete(null)
              })
          }}
        />
      )}
      {showConfirmDeleteLayerModal && (
        <ConfirmActionModal
          destructive
          title="Excluir camada"
          description="Excluir est\a camada é uma ação irreversível. Deseja continuar?"
          onClose={() => {
            setShowConfirmDeleteLayerModal(false)
          }}
          onConfirm={() => {
            if (!pendingFieldToDelete) return

            adapter
              .deleteLayer(pendingFieldToDelete.id_field)
              .then(() => {
                setActiveLayer(undefined)
              })
              .catch(() => {
                setPendingFieldToDelete(null)
              })
          }}
        />
      )}
      {showNewFieldModal && activeForm && (
        <GeometryFormNewFieldModal
          formId={activeForm.id_form}
          onConfirm={(name) => {
            adapter
              .createFormField({
                name,
                form: activeForm.id_form,
              })
              .then((d) => {
                setShowNewFieldModal(false)
                setForms((prev) => {
                  const formIndex = prev.findIndex((f) => f.id_form === activeForm.id_form)
                  if (formIndex < 0) return prev

                  const newForm = prev[formIndex]
                  newForm.fields.push(d)
                  prev[formIndex] = newForm

                  return [...prev]
                })
              })
              .catch(console.error)
          }}
          onClose={() => {
            setShowNewFieldModal(false)
          }}
        />
      )}

      {(activeGeometryID || activeLayer) && (
        <DropdownMenu.Root open={isFormListOpen} onOpenChange={setFormListOpen}>
          <DropdownMenu.Trigger asChild>
            <div className="flex justify-between items-center border-y bg-secondary p-4 border-tertiary w-full text-sm cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <Table weight="duotone" /> Formulários
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
                    {forms?.map((form) => {
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
                    {path.startsWith('/editor') && (
                      <div
                        className="flex items-center gap-2 bg-secondary hover:bg-green-400 px-4 py-2 border border-tertiary first:rounded-t last:rounded-b text-green-400 text-sm hover:text-primary duration-200 cursor-pointer select-none focus:outline-none"
                        onClick={() => {
                          setShowFormCreator(true)
                        }}>
                        <PlusCircle weight="duotone" /> Criar novo formulário
                      </div>
                    )}
                  </motion.div>
                </DropdownMenu.Content>
              )}
            </AnimatePresence>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}

      {typeof activeGeometryID === 'number' && typeof activeLayer === 'number' && (
        <input
          ref={activeFormInputRef}
          disabled={!path.startsWith('/editor')}
          className="block focus:border-1 focus:border-accent bg-primary/30 file:my-1 px-2 py-1 p-0 border border-transparent rounded-md focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-white/60 sm:leading-7 focus:outline-none"
          defaultValue={activeForm?.name || 'Sem nome'}
          placeholder={'Sem nome'}
          type={'text'}
          onChange={(e) => {
            updateFormNameDebounces(e.target.value)
          }}
        />
      )}

      {/* LAYER FORM STRUCTURE */}
      {forms.length > 0 && activeForm && !activeGeometry && typeof activeLayer === 'number' && (
        <>
          <span className="my-2 px-4 text-white/40 text-xs">Campos</span>
          <div className="min-h-0 overflow-y-auto">
            {currentFormFields?.map((field) => {
              return (
                <div
                  className="relative flex justify-between items-center gap-2 border-white/10 bg-secondary px-4 py-2 border-b w-full overflow-hidden"
                  key={`form.field.${field.id_field}`}>
                  <input
                    className="block focus:border-1 focus:border-accent bg-primary/30 file:my-1 px-2 py-1 p-0 border border-transparent rounded-md focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-white/60 sm:leading-7 focus:outline-none"
                    defaultValue={field.name}
                    disabled={!path.startsWith('/editor')}
                    placeholder={'Sem valor'}
                    type={'text'}
                    onChange={(e) => {
                      fieldUpdateDebounces(field.id_field, e.target.value)
                    }}
                  />
                  {path.startsWith('/editor') && (
                    <button
                      className="flex justify-center items-center bg-primary/40 hover:bg-red-400 p-2 border border-red-400 rounded text-red-400 hover:text-primary duration-100"
                      onClick={() => {
                        setPendingFieldToDelete(field)
                        setShowConfirmDeleteFieldModal(true)
                      }}>
                      <TrashSimple size={16} weight="duotone" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {activeForm && path.startsWith('/editor') && (
            <div className="flex justify-center items-center p-2 w-full">
              <button
                className="flex items-center gap-2 hover:border-white/20 hover:bg-accent p-2 border border-transparent rounded-md w-full font-semibold text-sm text-white/60 hover:text-primary duration-200"
                onClick={() => {
                  setShowNewFieldModal(true)
                }}>
                <PlusCircle /> Adicionar novo campo
              </button>
            </div>
          )}
        </>
      )}
      {forms && typeof activeGeometryID === 'number' && activeForm && fieldValues[activeForm.id_form] && (
        <div>
          {fieldValues[activeForm.id_form].map((field) => {
            return (
              <div className="flex flex-col gap-2" key={`form.field.${field.id_field}`}>
                <div className="flex justify-between items-center gap-2 px-4 py-2 w-full overflow-hidden">
                  <span className="w-1/2 text-sm">{field.name}</span>
                  <input
                    className="block focus:border-1 focus:border-accent bg-primary/30 file:my-1 px-2 py-1 p-0 border border-transparent rounded-md focus:ring-0 focus:ring-teal-500 w-full text-foreground text-sm placeholder:text-white/60 sm:leading-7 focus:outline-none"
                    defaultValue={field?.value_string || undefined}
                    placeholder={field?.value_string ?? 'Sem valor'}
                    type={field?.type === 'Number' ? 'number' : 'text'}
                    disabled={typeof activeGeometryID !== 'number' || !path.startsWith('/editor')}
                    onChange={(e) => {
                      field.debounce(activeForm, {
                        ...field,
                        value_string: e.target.value,
                      })
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
      {typeof activeGeometryID === 'number' && (
        <div className="border-white/20 border-y mt-auto">
          <div className="flex justify-between items-center gap-2 p-4 w-full overflow-hidden">
            <span className="w-1/2 text-sm">Área Projetada</span>
            <strong className="text-right w-1/2 font-semibold text-xs">{geometryArea?.toFixed(2)}m²</strong>
          </div>
          <div className="flex justify-between items-center gap-2 p-4 w-full overflow-hidden">
            <span className="w-1/2 text-sm">Perímetro Projetado</span>
            <strong className="text-right w-1/2 font-semibold text-xs">{geometryPerimeter?.toFixed(2)}m</strong>
          </div>
        </div>
      )}
      {activeForm && !activeGeometry && path.startsWith('/editor') && (
        <div
          className={clsx('w-full', {
            'mt-auto': !activeGeometry,
          })}>
          <div
            onClick={() => {
              adapter.deleteForm(activeForm.id_form).then(() => {
                setForms(forms.filter((f) => f.id_form !== activeForm.id_form))
                setActiveForm(null)
              })
            }}
            className="flex justify-center items-center gap-2 border-white/10 hover:bg-red-400/20 mt-auto p-2 border hover:border-red-400 w-full text-white/60 cursor-pointer">
            <TrashSimple /> Apagar Formulário
          </div>
        </div>
      )}
    </motion.div>
  )
}
