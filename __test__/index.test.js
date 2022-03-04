/* eslint-env jest */
import fetch from 'node-fetch';
import FetchHelper from '../es'

globalThis.fetch = fetch;

describe('FetchHelper', () => {
  test('FetchHelper', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/posts/1');
    expect(res.constructor.name).toEqual('Response');
  });
  test('FetchHelper: interceptors', async () => {
    const fetchHelper = FetchHelper.create({
      interceptors: {
        response: [(response, ctx) => {
          return response.json();
        }]
      }
    });
    const res = await fetchHelper('https://jsonplaceholder.typicode.com/posts/1');
    expect(res.constructor.name).toEqual('Object');
  });
});
