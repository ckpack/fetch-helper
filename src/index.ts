import type { FetchConfig } from './k-fetch'
import { KFetch } from './k-fetch'

const defaultConfigt: FetchConfig = {
  mode: 'same-origin',
  method: 'GET',
  responseType: 'json',
  interceptors: {
    request: [],
    response: []
  }
}

function createInstance (defaultConfig?: FetchConfig) {
  const context = new KFetch(defaultConfig)
  const instance:typeof context.request & {
    create?: typeof createInstance
  } = context.request.bind(context)
  instance.create = (createConfig?: FetchConfig) => createInstance({
    ...defaultConfig,
    ...createConfig
  })
  return instance
}

export default createInstance(defaultConfigt)
