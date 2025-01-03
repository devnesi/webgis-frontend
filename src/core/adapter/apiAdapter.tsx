import axios, { AxiosInstance } from 'axios'
import getUserToken from '../utils/gettoken'
import { setCookie, destroyCookie } from 'nookies'

export class ApiAdapter {
  private _client: AxiosInstance
  private _token: string = ''
  public _baseURL: string = process.env.NEXT_PUBLIC_BASEURL || ''
  public hasToken: boolean = false

  constructor() {
    this._token = process.env.NEXT_PUBLIC_OVERRIDETOKEN || getUserToken() || ''
    this.hasToken = !!this._token
    this._client = axios.create({
      baseURL: this._baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this._token ? `Token ${this._token}` : undefined,
      },
    })

    this._client.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        console.debug(
          `Error on request
| response: ${error?.response?.status || '?'}
| endpoint: ${error?.config?.baseURL}${error?.config?.url}
| mesage: ${error?.response?.data?.message || '?'}
`
        )
        if (error.response?.status === 401 || error.response?.status === 403) {
          destroyCookie(null, 'USER_AUTHENTICATION_TOKEN')
          window.location.replace('/')
          return Promise.reject(error)
        }
      }
    )
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

  public async getMap(mapId: number) {
    const result = await this._client.get<API.RAW.Map>(`/maps/${mapId}/`, {
      headers: {
        Authorization: null,
      },
    })

    return result.data
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

  public async getLayerForms(layer_id: number) {
    const result = await this._client.get<API.LAYER.listForms>('/forms/', {
      params: {
        layer: layer_id,
      },
    })

    return result.data
  }

  public async getLayerFormFields(form_id: number) {
    const result = await this._client.get<API.RAW.FormField[]>('/fields/', {
      params: {
        form: form_id,
      },
    })

    return result.data
  }

  public async updateFormValues(geometryID: number, formData: API.RAW.BatchFormValues) {
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

  public async updateLayersOrders(layers: { orders: Pick<API.RAW.Layer, 'id_layer' | 'order'>[] }) {
    try {
      const result = await this._client.post<API.RAW.Layer[]>('/layers/updateOrder/', layers)

      return result.data
    } catch (e) {
      console.error(e)
    }
  }

  public async login(username: string, password: string) {
    const result = await this._client.post<{ token: string }>('/login/', { username, password })

    setCookie(null, 'USER_AUTHENTICATION_TOKEN', result.data.token, {
      maxAge: 30 * 24 * 60 * 60,
    })

    return result.data
  }

  public async register(username: string, password: string, email: string) {
    const result = await this._client.post<{ token: string }>('/register/', { username, password, email })

    return result.data
  }

  public async deleteMap(mapID: number) {
    return await this._client.delete(`/maps/${mapID}/`)
  }

  public async deleteLayer(layerID: number) {
    const result = await this._client.delete(`/layers/${layerID}/`)

    return result.data
  }

  public async createLayer(body: {
    name: string
    map: number
    layer_type: API.RAW.Layer_type
    style: {
      fill: string
      stroke: string
    }
  }) {
    const result = await this._client.post<API.RAW.Layer>('/layers/', body)

    return result.data
  }

  public async createMap(body: { name: string }) {
    const result = await this._client.post<API.RAW.Map>('/maps/', body)

    return result.data
  }

  public async createForm(body: { name: string; layer: number }) {
    const result = await this._client.post<API.RAW.Form>('/forms/', body)

    return result.data
  }

  public async createFormField(body: { name: string; form: number }) {
    const result = await this._client.post<API.RAW.FormField>('/fields/', {
      ...body,
      type: 'String',
    })

    return result.data
  }

  public async deleteField(fieldID: number) {
    const result = await this._client.delete(`/fields/${fieldID}/`)

    return result.data
  }

  public async updateField(fieldID: number, body: { formID: number; name: string }) {
    const result = await this._client.put(`/fields/${fieldID}/`, {
      form: body.formID,
      name: body.name || 'Unnamed Field',
    })

    return result.data
  }

  public async deleteForm(formID: number) {
    return await this._client.delete(`/forms/${formID}/`)
  }

  public async updateFormName(formID: number, body: { name: string; layer: number }) {
    const result = await this._client.put(`/forms/${formID}/`, body)

    return result.data
  }

  public async updateMap(mapID: number, body: { name: string }) {
    const result = await this._client.put(`/maps/${mapID}/`, body)

    return result.data
  }
}
