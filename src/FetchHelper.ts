export type RequestParams = ConstructorParameters<typeof URLSearchParams>[number] | number | number[][] | Record<string | number, number>;
export type TransformRequest = (init: FetchHelperInit, ctx: FetchHelper) => Promise<FetchHelperInit> | FetchHelperInit;
export type TransformResponse = <T = Response>(response: Response | undefined, error: Error | undefined, ctx: FetchHelper) => Promise<T>;

function paramsSerializer(params?: RequestParams) {
  return new URLSearchParams(params as ConstructorParameters<typeof URLSearchParams>[number]).toString();
}

export function mergeHeaders(header?: HeadersInit, header2?: HeadersInit) {
  const base = new Headers(header);
  new Headers(header2).forEach((value, key) => {
    base.set(key, value);
  });
  return base;
}

export const WITHOUT_BODY_METHODS = ['GET', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'] as const;
export const WITH_BODY_METHODS = ['DELETE', 'PATCH', 'POST', 'PUT'] as const;

export type RequestMethod = typeof WITHOUT_BODY_METHODS[number] | typeof WITH_BODY_METHODS[number] | Lowercase<typeof WITHOUT_BODY_METHODS[number]> | Lowercase<typeof WITH_BODY_METHODS[number]>;

export type FetchHelperInput = RequestInfo;

export interface FetchHelperInit extends RequestInit {
  baseURL?: string
  method?: RequestMethod
  params?: RequestParams
  paramsSerializer?: typeof paramsSerializer
  transformRequest?: TransformRequest
  transformResponse?: TransformResponse
  adapter?: (input?: RequestInfo | URL, init?: RequestInit) => Response
  handlerError?: (error?: any) => void
  handlerSuccess?: (response?: Response) => void
  [index: string]: any
}

export class FetchHelper {
  defaultInit?: FetchHelperInit;
  input?: RequestInfo;
  init?: FetchHelperInit;

  constructor(fetchConfig?: FetchHelperInit) {
    this.defaultInit = fetchConfig || {};
  }

  async request<T = Response>(input: FetchHelperInput, init?: FetchHelperInit) {
    this.input = input;
    const mergeInit: FetchHelperInit = { ...this.defaultInit, ...init, headers: mergeHeaders(this.defaultInit?.headers, init?.headers) };

    this.init = mergeInit.transformRequest ? await mergeInit.transformRequest(mergeInit, this) : mergeInit;

    if (typeof this.input === 'string') {
      const inputURL = new URL(this.input, this.init.baseURL);

      const queryString = (this.init.paramsSerializer || paramsSerializer)(this.init.params);
      if (queryString) {
        this.input = `${inputURL.href}${inputURL.search ? '&' : '?'}${queryString}`;
      } else {
        this.input = inputURL.href;
      }
    }

    let response: Response | undefined;
    let error: Error | undefined;
    try {
      response = await (this.init.adapter || fetch)(this.input, this.init);
      if (this.init.handlerSuccess) {
        this.init?.handlerSuccess(response);
      }
    } catch (e: any) {
      error = e;
      if (this.init.handlerError) {
        this.init?.handlerError(error);
      } else {
        throw error;
      }
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return mergeInit.transformResponse ? mergeInit.transformResponse<T>(response, error, this) : response as T;
    }
  }
}
