/* eslint-env jest */
import fetch from 'node-fetch';
import FetchHelper from '@ckpack/fetch-helper';

globalThis.fetch = fetch;

describe('FetchHelper', () => {
  test('FetchHelper', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/comments?id=1');
    expect((await res.json())[0].id).toEqual(1);
  });
  test('FetchHelper.create', async () => {
    const fetchHelper = FetchHelper.create({
      baseURL: 'https://jsonplaceholder.typicode.com',
      transformResponse:(response) => {
        return response.json();
      }
    });
    const res = await fetchHelper('/comments?id=1');
    expect(res[0].id).toEqual(1);
  });
  test('params', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/comments', {
      params: {
        id: 1,
      }
    });
    expect((await res.json())[0].id).toEqual(1);
  });
  test('paramsSerializer', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/comments', {
      paramsSerializer:()=> `id=1`,
    });
    expect((await res.json())[0].id).toEqual(1);
  });
  test('transformRequest & transformResponse', async () => {
    const fetchHelper = FetchHelper.create({
      transformRequest: (init) =>{
        init.responseType = 'json';
        return init;
      },
      transformResponse:(response, ctx) => {
        return response[ctx.init.responseType]();
      }
    });
    const res = await fetchHelper('https://jsonplaceholder.typicode.com/comments?id=1');
    expect(res[0].id).toEqual(1);
  });
  test('adapter', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/comments', {
      adapter: () => ({ id: 1 }),
    });
    expect(res.id).toEqual(1);
  });
});
