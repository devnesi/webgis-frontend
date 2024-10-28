type RView = {
  /** Center of the map */
  center: Coordinate
  /** Zoom level, 0 is the whole world, 28 is maximum resolution */
  zoom: number
  /**
   * Optional resolution in meters per pixel
   *
   * When set, it takes precedence over the zoom level
   *
   * @default zoom
   */
  resolution?: number
}

namespace API {
  namespace RAW {
    type Layer_type = 'Point' | 'Polygon' | 'LineString'

    type Layer = {
      id_layer: number
      name: string
      enabled: boolean
      layer_type: API.RAW.Layer_type
      created_at: string
      updated_at: string
      map: number
      order?: number
      style: {
        stroke?: string
        fill?: string
        radius?: number
      }
    }

    type Map = {
      id_map: number
      name: string
      enabled: boolean
      created_at: string
      updated_at: string
      user: number
    }

    type BBox = string

    type FormField = {
      id_field: number
      name: string
      type: 'String' | 'Number'
      value_string?: string
    }

    type BatchFormValues = {
      forms: {
        id_form: number
        name: string
        fields_values: FormField[]
      }[]
    }

    type Form = {
      id_form: number
      name: string
      fields_values: API.RAW.FormField[]
    }
  }

  export namespace LAYER {
    type list = API.RAW.Layer[]
    type listForms = (API.RAW.Form & { fields: API.RAW.FormField[] })[]
  }

  export namespace MAP {
    type list = API.RAW.Map[]
  }

  export namespace GEOMETRY {
    type detail = {
      id_geometry: number
      layer: number
      geom: {
        type: API.RAW.Layer_type
        coordinates: number[][]
      }
      created_at: string
      updated_at: string
    }

    type getBBox = {
      bbox: API.RAW.BBox
    }

    type listForms = API.RAW.BatchFormValues
  }
}
