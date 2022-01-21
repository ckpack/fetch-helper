export type Middleware = (...args:any) => any;

export function compose (middleware:any[] = []) {
  return <T, U>(params:T, params2?: U): T => {
    return middleware.reduce(async (previousValue, currentValue) => {
      return currentValue(await previousValue, params2)
    }, params)
  }
}
