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
    type Layer_type = 'Point' | 'MultiPolygon' | 'Polygon' | 'LineString' | 'Line'

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

    type formField = {
      id_field: number
      name: string
      value_string?: string
      value_number?: number | string
    }

    type form = {
      id_form: number
      name: string
      fields: API.RAW.formField[]
    }
  }

  export namespace LAYER {
    type list = API.RAW.Layer[]
    type listForms = { forms: API.RAW.form[] }
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
  }
}
