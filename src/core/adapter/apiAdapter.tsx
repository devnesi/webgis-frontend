import axios, { AxiosInstance } from 'axios'
import { GeoJSON } from 'ol/format'

export class ApiAdapter {
  private _client: AxiosInstance
  private _token: string = process.env.NEXT_PUBLIC_OVERRIDETOKEN || ''
  public _baseURL: string = process.env.NEXT_PUBLIC_BASEURL || ''

  constructor() {
    this._client = axios.create({
      baseURL: this._baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this._token}`,
      },
    })
  }

  public async getAvailableLayers(map?: number) {
    const result = await this._client.get<API.LAYER.list>('/layers/', {
      params: {
        map,
      },
    })

    return result.data
  }

  public async getAvailableMaps() {
    const result = await this._client.get<API.MAP.list>('/maps/')

    return result.data
  }

  public getLayer(layerId: number) {
    return {}
  }

  public async getGeometry(geometryID: number) {
    const result = await this._client.get<API.GEOMETRY.detail>(`/geometries/${geometryID}/`)

    return result.data
  }

  public async getLayerBBox(layer_id: number) {
    const result = await this._client.get<API.GEOMETRY.getBBox>(`/layers/${layer_id}/bbox/`)

    return result.data
  }

  public async getMapBBox(map_id: number) {
    const result = await this._client.get<API.GEOMETRY.getBBox>(`/maps/${map_id}/bbox/`)

    return result.data
  }

  public async getGeometryFormAndValues(geometry_id: number) {
    const result = await this._client.get<API.GEOMETRY.listForms>(`/geometries/${geometry_id}/values/`)

    return result.data
  }

  public async updateForm(geometryID: number, formData: API.RAW.BatchFormValues) {
    try {
      const result = await this._client.post(`/geometries/${geometryID}/infos/`, formData)

      return result.data
    } catch (e) {
      console.error(e)
    }
  }

  public async createGeometry(layerID: number, geom: string) {
    try {
      const result = await this._client.post('/geometries/', { geom: JSON.parse(geom), layer: layerID })

      return result.data
    } catch (e) {
      console.error(e)
    }
  }

  public async updateGeometry(geometryID: number, geom: string) {
    try {
      const result = await this._client.put(`/geometries/${geometryID}/`, { geom: JSON.parse(geom) })

      return result.data
    } catch (e) {
      console.error(e)
    }
  }

  public async deleteGeometry(geometryID: number) {
    try {
      const result = await this._client.delete(`/geometries/${geometryID}/`)

      return result.data
    } catch (e) {
      console.error(e)
    }
  }

  public async updateLayerSpecification(layerSpecification: API.RAW.Layer) {
    try {
      const result = await this._client.patch<API.RAW.Layer>(
        `/layers/${layerSpecification.id_layer}/`,
        layerSpecification
      )

      return result.data
    } catch (e) {
      console.error(e)
    }
  }
}
