import type { FetchConfig } from './fetch-helper';
import { FetchHelper } from './fetch-helper';

const defaultConfigt: FetchConfig = {
  mode: 'same-origin',
  method: 'GET',
  responseType: 'json',
  interceptors: {
    request: [],
    response: [],
  },
};

function createInstance(defaultConfig?: FetchConfig) {
  const context = new FetchHelper(defaultConfig);
  const instance:typeof context.request & {
    create?: typeof createInstance
  } = context.request.bind(context);
  instance.create = (createConfig?: FetchConfig) => createInstance({
    ...defaultConfig,
    ...createConfig,
  });
  return instance;
}

export default createInstance(defaultConfigt);
