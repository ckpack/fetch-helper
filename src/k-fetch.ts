import type { Middleware } from './compose'
import { compose } from './compose'

export const responseTypes = {
  json: 'json',
  blob: 'blob',
  formData: 'formData',
  arrayBuffer: 'arrayBuffer',
  text: 'text'
}

export interface FetchConfig extends RequestInit {
  responseType?: keyof typeof responseTypes,
  interceptors?: {
    request?: Middleware[],
    response?: Middleware[],
  },
  timeout?: number,
}

export class KFetch {
  defaults: FetchConfig | undefined;
  constructor (fetchConfig?: FetchConfig) {
    this.defaults = fetchConfig
  }

  async request (resource: RequestInfo, requestConfig?: FetchConfig) :Promise<Response> {
    return new Promise(async (resolve, reject) => {
      const mergeConfig = { ...this.defaults, ...requestConfig }
      const composeConfig = await compose(mergeConfig?.interceptors?.request)(mergeConfig)
      let timeOut!: ReturnType<typeof setTimeout>;
      if (composeConfig.timeout) {
        timeOut = setTimeout(() => {
          clearTimeout(timeOut)
          reject(new Error(`Timeout(${composeConfig.timeout}ms): Fetch ${resource}`))
        }, composeConfig.timeout);
      }
      const response = await fetch(resource, composeConfig)
      clearTimeout(timeOut)
      resolve(compose(mergeConfig?.interceptors?.response)(response, composeConfig))
    })
  }
}
