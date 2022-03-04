import type { FetchHelperInit, FetchHelper } from './fetch-helper';

export type RequestMiddleware = (init:FetchHelperInit, ctx : FetchHelper) => FetchHelperInit | unknown;
export type ResponseMiddleware = (response: Response, ctx : FetchHelper) => Response | unknown;

export function compose(ctx : FetchHelper, middleware?: any[]) {
  return <T>(params:T): T => {
    return Array.isArray(middleware) ? middleware.reduce(async (previousValue: T, currentValue: any) => {
      return currentValue(await previousValue, ctx);
    }, params) : params;
  };
}
