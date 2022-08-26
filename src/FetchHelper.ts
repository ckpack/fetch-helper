export type RequestParams = URLSearchParams | Record<string, any> | undefined
export type TransformRequest = (init: FetchHelperInit, ctx: FetchHelper) => Promise<FetchHelperInit> | FetchHelperInit
export type TransformResponse = (response: Response, ctx: FetchHelper) => Promise<Response> | Response

const paramsSerializer = (params?: RequestParams) => new URLSearchParams(params).toString()

export const WITHOUT_BODY_METHODS = ['GET', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'] as const
export const WITH_BODY_METHODS = ['DELETE', 'PATCH', 'POST', 'PUT'] as const

export type RequestMethod = typeof WITHOUT_BODY_METHODS[number] | typeof WITH_BODY_METHODS[number] | Lowercase<typeof WITHOUT_BODY_METHODS[number]> | Lowercase<typeof WITH_BODY_METHODS[number]>

export type FetchHelperInput = RequestInfo
export interface FetchHelperInit extends RequestInit {
  baseURL?: string
  method?: RequestMethod
  params?: RequestParams
  paramsSerializer?: typeof paramsSerializer
  transformRequest?: TransformRequest
  transformResponse?: TransformResponse
  adapter?: (input?: RequestInfo | URL, init?: RequestInit) => Response
  [index: string]: any
}

const mergeHeaders = (header?: HeadersInit, header2?: HeadersInit) => {
  const base = new Headers(header)
  new Headers(header2).forEach((value, key) => {
    base.set(key, value)
  })
  return base
}

export const defaultTransformRequest: TransformRequest = (init) => {
  const body = init.body
  if (!body || body.constructor.name !== 'Object')
    return init

  init.headers = mergeHeaders(init.headers, {
    'Content-type': 'application/json',
  })
  init.body = JSON.stringify(body)
  return init
}

export class FetchHelper {
  defaultInit?: FetchHelperInit
  input?: RequestInfo
  init?: FetchHelperInit

  constructor(fetchConfig?: FetchHelperInit) {
    this.defaultInit = fetchConfig || {}
  }

  async request(input: FetchHelperInput, init?: FetchHelperInit): Promise<Response> {
    this.input = input
    const mergeInit: FetchHelperInit = { ...this.defaultInit, ...init, headers: mergeHeaders(this.defaultInit?.headers, init?.headers) }

    this.init = mergeInit.transformRequest ? await mergeInit.transformRequest(mergeInit, this) : mergeInit

    if (typeof this.input === 'string') {
      const inputURL = new URL(this.input, this.init.baseURL)

      const queryString = (this.init.paramsSerializer || paramsSerializer)(this.init.params)
      if (queryString)
        this.input = `${inputURL.href}${inputURL.search ? '&' : '?'}${queryString}`

      else
        this.input = inputURL.href
    }

    const response = await (this.init.adapter || fetch)(this.input, this.init)
    return mergeInit.transformResponse ? mergeInit.transformResponse(response, this) : response
  }
}
