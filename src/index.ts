import type { FetchHelperInit } from './fetch-helper';
import { FetchHelper } from './fetch-helper';

function createInstance(defaultConfig?: FetchHelperInit) {
  const context = new FetchHelper(defaultConfig);
  const instance:typeof context.request & {
    create?: typeof createInstance
  } = context.request.bind(context);

  instance.create = (createConfig?: FetchHelperInit) => createInstance({
    ...defaultConfig,
    ...createConfig,
  });
  return instance;
}

export default createInstance();
