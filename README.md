# @ckpack/fetch-helper

<h4 align="center">
  <a href="/README-ZH.md">中文</a>
  |
  <a href="/README.md">ENGLISH</a>
</h4>

`@ckpack/fetch-helper` is a lightweight wrapper for the [Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) API. It needs to be used in a browser that supports `Fetch` API or `Node.js` (version less than v18.0.0).

## API Documentation

### fetchHelper<T=Response>(input: RequestInfo, init?: FetchHelperInit | undefined): Promise<T>

+ `input`: the requested url or [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object
+ `init`: a configuration item object, including all the settings for the request, supports all the configuration item parameters of the native [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) , and added the following parameters
  + `baseURL`: if the passed in `input` is not an absolute address, the value will be prepended to `input`,
  + `params`: URL parameters sent with the request, must be a plain object or a `URLSearchParams` object
  + `paramsSerializer`: set custom serializer `params` parameter function
  + `transformRequest`: allows changing request parameters before the request is made
  + `transformResponse`: allows changing response data after request response
  + `adapter`: Allows custom handling of requests, which makes testing easier.

Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) object, the default is [`Response`](https://developer. mozilla.org/en-US/docs/Web/API/Response) type, other types can also be returned through `transformResponse`

```js
import fetchHelper from '@ckpack/fetch-helper'

// equal to fetch('http://jsonplaceholder.typicode.com/comments?id=1')
fetchHelper('/comments', {
  baseURL: 'http://jsonplaceholder.typicode.com',
  params: {
    id: 1,
  },
})
```

### fetchHelper.create

Create a new `fetchHelper` instance with custom configuration.

```js
const instance = fetchHelper.create({
  // You can also set other parameters here
  baseURL: 'http://jsonplaceholder.typicode.com',
})
```
### fetchHelper.default

Permanently modify the request instance configuration via the `default` attribute:

```js
instance.default.baseURL = 'http://localhost:3000'
```

### fetchHelper[method]

For convenience, aliases are provided for all supported request methods.

```js
fetchHelper.request(config)
fetchHelper.get(url, params?, config?)
fetchHelper.head(url, params?, config?)
fetchHelper.options(url, params?, config?)
fetchHelper.connect(url, params?, config?)
fetchHelper.trace(url, params?, config?)
fetchHelper.delete(url, body?, config?)
fetchHelper.post(url, body?, config?)
fetchHelper.put(url, body?, config?)
fetchHelper.patch(url, body?, config?)
```
## example

### Set the requested configuration

> create(defaultConfig?: FetchHelperInit)

You can use the `create` method to create an instance with a default config object


```js
import fetchHelper from '@ckpack/fetch-helper'

const instance = fetchHelper.create({
  // You can also set other parameters here
  baseURL: 'http://jsonplaceholder.typicode.com',
})

// fetch('http://jsonplaceholder.typicode.com/comments?id=1')
instance('/comments', {
  params: {
    id: 1,
  },
})

// Permanently modify the configuration via the default property
// fetch('http://localhost:3000/comments?id=1')
instance.default.baseURL = 'http://localhost:3000'
instance('/comments', {
  params: {
    id: 1,
  },
})

// Temporarily modify the configuration by parameters
// fetch('http://localhost:3000/comments?id=1')
await instance('/comments', {
  baseURL: 'http://localhost:3000',
  params: {
    id: 1,
  },
})
```

### set request `method`

You can set the request method through the `method` parameter, such as `GET`, `POST`
```js
await fetchHelper('http://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify({ firstName: 'Fred', lastName: 'Flintstone' }),
})

// or
await fetchHelper.post('http://jsonplaceholder.typicode.com/posts', JSON.stringify({ firstName: 'Fred', lastName: 'Flintstone' }), {
  headers: {
    'Content-type': 'application/json',
  },
})
```
### set query string params

Set the query string (query string), the parameter is serialized and spliced ​​after `url`
```js
// equal to fetch('http://jsonplaceholder.typicode.com/comments?limit=10&page=2&ids=1%2C2%2C3')
fetchHelper('/comments', {
  baseURL: 'http://jsonplaceholder.typicode.com',
  params: {
    limit: 10,
    page: 2,
    ids: [1, 2, 3] // ids=1,2,3
  },
})
```
### paramsSerializer

`paramsSerializer` is an optional function responsible for serializing `params`, by default `new URLSearchParams(params).toString()` is used to complete serialization

```js
// equal to fetch('http://jsonplaceholder.typicode.com/comments?limit=10&page=2&ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3')
fetchHelper('/comments', {
  baseURL: 'http://jsonplaceholder.typicode.com',
  params: {
    limit: 10,
    page: 2,
    ids: [1,2,3] // ids[]=1&ids[]=2&ids[]=3
  },
  paramsSerializer: (params) => Qs.stringify(params, {arrayFormat: 'brackets'},
})
```

### transformRequest

The request parameter configuration can be changed through `transformRequest`. By default, `fetch` passes parameters through `application/json` and requires manual serialization of `JSON.stringify(body)`, and then set `Content-type` in `Headers` to `application` /json`, you can simplify this way with `transformRequest`
```js
const resuest = fetchHelper.create({
  baseURL: 'http://jsonplaceholder.typicode.com',
  transformRequest(init) {
    const { body } = init
    if (typeof body === 'object' && !(body instanceof FormData || body instanceof URLSearchParams)) {
      const headers = new Headers(init.headers)
      headers.set('Content-type', 'application/json')
      init.headers = headers
      init.body = JSON.stringify(body)
    }
    return init
  },
})

const res = await resuest.post('/posts', { firstName: 'Fred', lastName: 'Flintstone' })
```
### Transform the request result via `transformResponse`

```js
const fetchHelper = fetchHelper('http://jsonplaceholder.typicode.com/comments', {
  transformResponse(response) {
    return response.json()
  },
})
// The request result will be converted to json
```

```ts
// If TypeScript is used, generic types can be specified
const fetchHelper = fetchHelper<{ id: number }[]>('http://jsonplaceholder.typicode.com/comments', {
  transformResponse(response) {
    return response.json()
  },
})
// fetchHelper[0].id
```

### Set request `timeout`

```js
const instance = fetchHelper.create({
  transformRequest(config) {
    if (config.timeout) {
      const controller = new AbortController()
      config.signal = controller.signal
      setTimeout(() => controller.abort('timeout'), config.timeout)
    }
    return config
  },
})

await instance('http://jsonplaceholder.typicode.com/comments', {
  timeout: 6000,
})
// automatically cancel the request after six seconds
```

### Custom `adapter`

```js
const fetchResponse = await fetchHelper('http://jsonplaceholder.typicode.com/comments', {
  params: {
    limit: 1,
    page: 2
  },
  adapter(input) {
    return new Response(`${input}`)
  },
})

console.log(await fetchResponse.text())
// Return the result directly without fetching: http://jsonplaceholder.typicode.com/comments?limit=1&page=2
```

For more examples, please refer to [`@ckpack/fetch-helper`](./__test__)