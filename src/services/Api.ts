/* eslint-disable no-console */
import axios, {AxiosInstance, AxiosError, AxiosResponse, AxiosRequestHeaders, AxiosRequestConfig} from 'axios'
import { EventBusName, onPushEventBus } from './EventBus'

const APIConfig = {
  // baseURL: 'https://be.tracks.label.community'
  baseURL: 'https://clesson-dev.duckdns.org:3000'
}

class API {
  expireToken: () => void
  updateAccessToken: (token: string) => void
  axios: AxiosInstance
  token: string
  refreshToken: string
  static checkToken: Promise<any> | undefined
  constructor() {
    this.expireToken = () => {}
    this.updateAccessToken = (token: string) => {}
    this.token = '' 

    this.refreshToken = ''
    this.axios = axios.create(APIConfig)
    this.axios.interceptors.response.use(this.interceptorResponses, (err) => this.handleErrors(err)) 
  }

  setToken(token: string, refreshToken: string) {
    this.token = token
    this.refreshToken = refreshToken
  }

  async getNewToken() {
    // console.log('GET NEW TOKEN ===>')
    try {
      const response = await axios.post(`${APIConfig.baseURL}/api/auth/refresh-token`,{refreshToken: this.refreshToken})
      const accessToken = response?.data?.content?.accessToken
      // console.log('accessToken ===>', accessToken)
      if (accessToken) {
        this.token = accessToken
        onPushEventBus({type: EventBusName.UPDATE_NEW_TOKEN, payload: accessToken })
        return accessToken
      } else {
        // console.log('ERROR REFRESH TOKEN ===>', response)
        this.expireToken()
      }
    } catch(err) {
      // console.log('ERROR REFRESH TOKEN ===>', err)
      this.expireToken()
    }
  }

  async handleErrors(error: AxiosError) {
    const { response, request, config } = error
    console.log('ERROR QUERY API ===>', { response, request, config, error })
    console.group(config?.url)
    console.groupEnd()
    console.log('RESPONSE CODE ====>',response?.status)
    
    if (response?.status === 403) {
      console.log('EXPIRE TOKEN ===>')
      API.checkToken = API.checkToken ? API.checkToken : this.getNewToken()

      const newToken = await API.checkToken
      if (newToken) {
        try {
          let newConFig: AxiosRequestConfig = {
            ...error.config,
            headers: {
              ...error.config.headers,
              Authorization: `Bearer ${newToken}`,
          }}
          return axios.request(newConFig)
        } catch(err) {
          this.expireToken()
        }
      }
    } else {
      return response
    }
  }

  interceptorResponses(response: AxiosResponse) {
    return response
  }

  async get({ url, headers, params }: {url: string, headers?: AxiosRequestHeaders, params?: any}) {
    return this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...headers,
      },
      params: params,
    })
  }
    

  async post({ url, body, headers}: {url: string, body: any, headers: AxiosRequestHeaders}) {
    return this.axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...headers,
      },
    })
  }

  async delete({ url, headers }: {url: string, headers: AxiosRequestHeaders }) {
    return this.axios.delete(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...headers,
      },
    })
  }

  async put({ url, body, headers }: {url: string, body: any, headers: AxiosRequestHeaders}) {
    return this.axios.put(url, body, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...headers,
      },
    })
  }
}

export const Api = new API()
