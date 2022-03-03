import type { FetchConfig } from './fetch-helper';
import { FetchHelper } from './fetch-helper';

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

export default createInstance();
