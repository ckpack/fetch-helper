import type { FetchConfig } from './fetch-helper';

export type RequestMiddleware = (fetchConfig:FetchConfig) => FetchConfig;
export type ResponseMiddleware = (response: Response, fetchConfig:FetchConfig) => unknown;

export function compose(middleware:any = []) {
  return <T>(params:T, params2?: any): T => {
    return middleware.reduce(async (previousValue: T, currentValue: any) => {
      return currentValue(await previousValue, params2);
    }, params);
  };
}
