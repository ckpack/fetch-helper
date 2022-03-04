import type { RequestMiddleware, ResponseMiddleware } from './compose';
import { compose } from './compose';

export interface FetchHelperInit extends RequestInit {
  interceptors?: {
    request?: RequestMiddleware[],
    response?: ResponseMiddleware[],
  };
  [index: string]: any;
}

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
    this.init = await compose(this, mergeInit?.interceptors?.request)(mergeInit);
    const response = await fetch(this.input, this.init);
    return compose(this, this.init?.interceptors?.response)(response);
  }
}
