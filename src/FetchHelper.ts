export type RequestParams = ConstructorParameters<typeof URLSearchParams>[number] | number | number[][] | Record<string | number, number>;
export type TransformRequest = (p: { init: FetchHelperInit; input: FetchHelperInput; ctx: FetchHelper }) => Promise<FetchHelperInit> | FetchHelperInit;
export type TransformResponse = <T = Response>(p: { response: Response | undefined; error: Error | undefined; init: FetchHelperInit; input: FetchHelperInput; ctx: FetchHelper }) => Promise<T>;

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

  constructor(fetchConfig?: FetchHelperInit) {
    this.defaultInit = fetchConfig || {};
  }

  async request<T = Response>(input: FetchHelperInput, init?: FetchHelperInit) {
    const mergeInit: FetchHelperInit = { ...this.defaultInit, ...init, headers: mergeHeaders(this.defaultInit?.headers, init?.headers) };

    init = mergeInit.transformRequest ? await mergeInit.transformRequest({ init: mergeInit, input, ctx: this }) : mergeInit;

    if (typeof input === 'string') {
      const inputURL = new URL(input, init.baseURL);

      const queryString = (init.paramsSerializer || paramsSerializer)(init.params);
      if (queryString) {
        input = `${inputURL.href}${inputURL.search ? '&' : '?'}${queryString}`;
      } else {
        input = inputURL.href;
      }
    }

    let response: Response | undefined;
    let error: Error | undefined;
    try {
      response = await (init.adapter || fetch)(input, init);
      if (init.handlerSuccess) {
        init?.handlerSuccess(response);
      }
    } catch (e: any) {
      error = e;
      if (init.handlerError) {
        init?.handlerError(error);
      } else {
        throw error;
      }
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return mergeInit.transformResponse ? mergeInit.transformResponse<T>({ response, error, init, input, ctx: this }) : response as T;
    }
  }
}
