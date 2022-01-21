/* eslint-env jest */
import fetch from 'node-fetch';
import FetchHelper from '../src'

global.fetch = fetch as any;

console.log(fetch)
// globalThis.fetch = fetch;
describe(__filename, () => {
  test('FetchHelper', async () => {
    const res = FetchHelper('baidu.com');
  });
});
