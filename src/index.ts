import type { FetchHelperInit, FetchHelperInput, RequestParams } from './FetchHelper.js'
import { FetchHelper, WITHOUT_BODY_METHODS, WITH_BODY_METHODS, defaultTransformRequest } from './FetchHelper.js'

const defaultConfig: FetchHelperInit = {
  transformRequest: defaultTransformRequest,
}

export type WithoutBodyMethod = (input: FetchHelperInput, params?: RequestParams | Object) => Promise<Response>
export type WithBodyMethod = (input: FetchHelperInput, body?: BodyInit | Object) => Promise<Response>

export const createInstance = (defaultConfig?: FetchHelperInit) => {
  const context = new FetchHelper(defaultConfig)

  const instance = context.request.bind(context) as typeof context.request & {
    create: typeof createInstance
    get: WithoutBodyMethod
    head: WithoutBodyMethod
    options: WithoutBodyMethod
    connect: WithoutBodyMethod
    trace: WithoutBodyMethod
    delete: WithBodyMethod
    patch: WithBodyMethod
    post: WithBodyMethod
    put: WithBodyMethod
  }

  instance.create = (createConfig?: FetchHelperInit) => createInstance({
    ...defaultConfig,
    ...createConfig,
  })

  WITHOUT_BODY_METHODS.map(val => val.toLowerCase() as Lowercase<typeof val>).forEach((value) => {
    instance[value] = (input, params) => instance(input, { ...defaultConfig, params, method: value })
  })
  WITH_BODY_METHODS.map(val => val.toLowerCase() as Lowercase<typeof val>).forEach((value) => {
    instance[value] = (input, body: any) => instance(input, { ...defaultConfig, body, method: value })
  })

  return instance
}

export default createInstance(defaultConfig)
