import { describe, expect, test } from 'vitest'
import { FetchHelper } from '../src/FetchHelper'
import { baseURL } from './config'

const fetchHelper = new FetchHelper({
  baseURL,
})
describe('FetchHelper', () => {
  test('request', async () => {
    const res = await fetchHelper.request('/comments?id=1')
    expect((await res.json())[0].id).toEqual(1)
  })

  test('request - post', async () => {
    const res = await fetchHelper.request('/posts', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ body: 'body', userId: 1 }),
    })
    expect(await res.text()).contains('body')
  })
})
