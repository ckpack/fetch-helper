import { describe, expect, test } from 'vitest'
import { FetchHelper, defaultTransformRequest } from '../src/FetchHelper'

const fetchHelper = new FetchHelper({
  transformRequest: defaultTransformRequest,
})
describe('FetchHelper', () => {
  test('request', async () => {
    const res = await fetchHelper.request('https://jsonplaceholder.typicode.com/comments?id=1')
    expect((await res.json())[0].id).toEqual(1)
  })

  test('request - post', async () => {
    const res = await fetchHelper.request('https://jsonplaceholder.typicode.com/posts', {
      method: 'post',
      body: { body: 'body', userId: 1 } as any,
    })
    expect(await res.text()).contains('body')
  })
})
