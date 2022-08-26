import { describe, expect, test } from 'vitest'
import FetchHelper from '../src/index'

describe('FetchHelper', () => {
  test('FetchHelper', async () => {
    const res = await FetchHelper.get('https://jsonplaceholder.typicode.com/comments?id=1')
    expect((await res.json())[0].id).toEqual(1)
  })
  test('FetchHelper.create', async () => {
    const fetchHelper = FetchHelper.create({
      baseURL: 'https://jsonplaceholder.typicode.com',
      transformResponse: (response) => {
        return response.json()
      },
    })
    const res = await fetchHelper('/comments?id=1')
    expect(res[0].id).toEqual(1)
  })
  test('params', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/comments', {
      params: {
        id: 1,
      },
    })
    expect((await res.json())[0].id).toEqual(1)
  })
  test('paramsSerializer', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/comments', {
      paramsSerializer: () => 'id=1',
    })
    expect((await res.json())[0].id).toEqual(1)
  })
  test('transformResponse', async () => {
    const fetchHelper = FetchHelper.create({
      transformResponse: (response, ctx) => {
        return response[ctx?.init?.responseType]()
      },
    })
    const res = await fetchHelper('https://jsonplaceholder.typicode.com/comments?id=1', {
      responseType: 'json',
    })
    expect(res[0].id).toEqual(1)
  })

  test('transformRequest & transformResponse', async () => {
    const fetchHelper = FetchHelper.create({
      transformRequest: (init) => {
        init.responseType = 'json'
        init.params = {
          id: 1,
        }
        return init
      },
      transformResponse: (response, ctx) => {
        return response[ctx?.init?.responseType]()
      },
    })
    const res = await fetchHelper('https://jsonplaceholder.typicode.com/comments')
    expect(res[0].id).toEqual(1)
  })

  test('adapter', async () => {
    const res = await FetchHelper('https://jsonplaceholder.typicode.com/comments', {
      adapter: () => new Response(JSON.stringify({ id: 1 })),
    })
    expect((await res.json()).id).toEqual(1)
  })

  test('post', async () => {
    const res = await FetchHelper.post('https://jsonplaceholder.typicode.com/posts', { body: 'body', userId: 1 })
    expect(await res.text()).contains('body')
  })
})
