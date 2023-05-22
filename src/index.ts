import type { FetchHelperInit, FetchHelperInput, RequestParams } from './FetchHelper.js';
import { FetchHelper, WITHOUT_BODY_METHODS, WITH_BODY_METHODS } from './FetchHelper.js';

export * from './FetchHelper.js';

const defaultConfig: FetchHelperInit = {};

export type WithoutBodyMethod<T = Response> = (input: FetchHelperInput, params?: RequestParams, options?: FetchHelperInit) => Promise<T>;
export type WithBodyMethod<T = Response> = (input: FetchHelperInput, body?: BodyInit | Object, options?: FetchHelperInit) => Promise<T>;
export type InputBodyMethod<T = Response> = (options: FetchHelperInit & {
  input: FetchHelperInput
}) => Promise<T>;

export function createInstance<T = Response>(defaultConfig?: FetchHelperInit) {
  const context = new FetchHelper(defaultConfig);

  const instance = context.request.bind(context) as typeof context.request & {
    create: typeof createInstance
    request: InputBodyMethod<T>
    get: WithoutBodyMethod<T>
    head: WithoutBodyMethod<T>
    options: WithoutBodyMethod<T>
    connect: WithoutBodyMethod<T>
    trace: WithoutBodyMethod<T>
    delete: WithBodyMethod<T>
    patch: WithBodyMethod<T>
    post: WithBodyMethod<T>
    put: WithBodyMethod<T>
    default: FetchHelperInit
  };

  instance.default = defaultConfig || {};

  instance.create = (createConfig?: FetchHelperInit) => createInstance<T>({
    ...defaultConfig,
    ...instance.default,
    ...createConfig,
  });

  WITHOUT_BODY_METHODS.map(val => val.toLowerCase() as Lowercase<typeof val>).forEach((value) => {
    instance[value] = (input, params, options) => instance<T>(input, { ...defaultConfig, params, method: value, ...options });
  });
  WITH_BODY_METHODS.map(val => val.toLowerCase() as Lowercase<typeof val>).forEach((value) => {
    instance[value] = (input, body: any, options) => instance<T>(input, { ...defaultConfig, body, method: value, ...options });
  });
  instance.request = options => instance<T>(options.input, { ...defaultConfig, ...options });

  return instance;
}

const instance = createInstance(defaultConfig);
export default instance;
