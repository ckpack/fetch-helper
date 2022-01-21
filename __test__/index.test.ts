/* eslint-env jest */
import fetch from 'node-fetch';
// import FetchHelper from '../src/index'

console.log(fetch)
// globalThis.fetch = fetch;
describe(__filename, () => {
  test('FetchHelper', async () => {
    const res = await fetch('baidu.com');
    console.log(res);
  });
});
