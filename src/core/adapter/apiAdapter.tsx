import axios, { AxiosInstance } from 'axios'

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

  public async getLayerForm(layer_id: number) {
    const result = await this._client.get<API.LAYER.listForms>(`/geom/${layer_id}/values/`)

    return result.data
  }
}
