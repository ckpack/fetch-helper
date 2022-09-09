import type { FetchHelperInit, FetchHelperInput, RequestParams } from './FetchHelper.js';
import { FetchHelper, WITHOUT_BODY_METHODS, WITH_BODY_METHODS } from './FetchHelper.js';
export * from './FetchHelper.js';

const defaultConfig: FetchHelperInit = {};

export type WithoutBodyMethod = <T=Response>(input: FetchHelperInput, params?: RequestParams | Object, options?: FetchHelperInit) => Promise<T | undefined>;
export type WithBodyMethod = <T=Response>(input: FetchHelperInput, body?: BodyInit | Object, options?: FetchHelperInit) => Promise<T | undefined>;
export type InputBodyMethod = <T=Response>(options: FetchHelperInit & {
  input: FetchHelperInput
}) => Promise<T | undefined>;

export const createInstance = (defaultConfig?: FetchHelperInit) => {
  const context = new FetchHelper(defaultConfig);

  const instance = context.request.bind(context) as typeof context.request & {
    create: typeof createInstance
    request: InputBodyMethod
    get: WithoutBodyMethod
    head: WithoutBodyMethod
    options: WithoutBodyMethod
    connect: WithoutBodyMethod
    trace: WithoutBodyMethod
    delete: WithBodyMethod
    patch: WithBodyMethod
    post: WithBodyMethod
    put: WithBodyMethod
    default: FetchHelperInit
  };

  instance.default = defaultConfig || {};

  instance.create = (createConfig?: FetchHelperInit) => createInstance({
    ...defaultConfig,
    ...instance.default,
    ...createConfig,
  });

  WITHOUT_BODY_METHODS.map(val => val.toLowerCase() as Lowercase<typeof val>).forEach((value) => {
    instance[value] = (input, params, options) => instance(input, { ...defaultConfig, params, method: value, ...options });
  });
  WITH_BODY_METHODS.map(val => val.toLowerCase() as Lowercase<typeof val>).forEach((value) => {
    instance[value] = (input, body: any, options) => instance(input, { ...defaultConfig, body, method: value, ...options });
  });
  instance.request = options => instance(options.input, { ...defaultConfig, ...options });

  return instance;
};

const instance = createInstance(defaultConfig);
export default instance;
