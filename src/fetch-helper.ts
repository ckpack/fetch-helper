import type { RequestMiddleware, ResponseMiddleware } from './compose';
import { compose } from './compose';

export interface FetchConfig extends RequestInit {
  interceptors?: {
    request?: RequestMiddleware[],
    response?: ResponseMiddleware[],
  },
  timeout?: number,
}

export class FetchHelper {
  defaults: FetchConfig | undefined;

  constructor(fetchConfig?: FetchConfig) {
    this.defaults = fetchConfig;
  }

  async request(fetchInput: RequestInfo, fetchInit?: FetchConfig) :Promise<Response> {
    return new Promise(async (resolve, reject) => {
      const mergeFetchInit = { ...this.defaults, ...fetchInit };
      const composeFetchInit = await compose(mergeFetchInit?.interceptors?.request)(mergeFetchInit);
      let timeOut!: ReturnType<typeof setTimeout>;
      if (composeFetchInit.timeout) {
        timeOut = setTimeout(() => {
          clearTimeout(timeOut);
          reject(new Error(`Timeout(${composeFetchInit.timeout}ms): Fetch ${fetchInput}`));
        }, composeFetchInit.timeout);
      }
      const response = await fetch(fetchInput, composeFetchInit);
      clearTimeout(timeOut);
      resolve(await compose(composeFetchInit?.interceptors?.response)(response, composeFetchInit));
    });
  }
}
