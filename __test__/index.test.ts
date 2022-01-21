/* eslint-env jest */
import fetch from 'node-fetch';
// import kFetch from '../src/index'

console.log(fetch)
// globalThis.fetch = fetch;
describe(__filename, () => {
  test('kFetch', async () => {
    const res = await fetch('baidu.com');
    console.log(res);
  });
});
