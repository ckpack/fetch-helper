type Params = Record<string, any>;

export type TransformRequest =  (init?:FetchHelperInit, ctx?: FetchHelper) => Promise<FetchHelperInit> | FetchHelperInit;
export type TransformResponse = (response?: Response, ctx?: FetchHelper) => Promise<Response> | Response | any;


const paramsSerializer = (params?: Params) => `${new URLSearchParams(params)}`;
export type ParamsSerializer = typeof paramsSerializer;

export interface FetchHelperInit extends RequestInit {
  baseURL?: string,
  params?: Params,
  paramsSerializer?: ParamsSerializer,
  transformRequest?: TransformRequest,
  transformResponse?: TransformResponse,
  adapter?: (input: RequestInfo, init?: FetchHelperInit) => Promise<Response>,
  [index: string]: any;
}

const absUrlReg = new RegExp('^(?:[a-z]+:)?//', 'i');

export class FetchHelper {
  baseInit?: FetchHelperInit;

  input?: RequestInfo;

  init?: FetchHelperInit;

  constructor(fetchConfig?: FetchHelperInit) {
    this.baseInit = fetchConfig;
  }

  async request(input: RequestInfo, init?: FetchHelperInit) :Promise<Response> {
    const mergeInit = { ...this.baseInit, ...init };
    this.input = input;
    this.init =  mergeInit.transformRequest ? await mergeInit.transformRequest(mergeInit, this) : mergeInit;
    this.input = (typeof this.input === 'string' && !absUrlReg.test(`${this.input}`) ) ? `${this.init.baseURL || ''}${input}` : this.input;
    const searchParams = (this.init.paramsSerializer || paramsSerializer)(this.init.params);
    const response = await (this.init.adapter || fetch)(`${this.input}${searchParams && `?${searchParams}`}`, this.init);
    return mergeInit.transformResponse ? mergeInit.transformResponse(response, this) : response;
  }
}
