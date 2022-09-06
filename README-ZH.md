# @ckpack/fetch-helper

<h4 align="center">
  <a href="/README-ZH.md">中文</a>
  |
  <a href="/README.md">ENGLISH</a>
</h4>

`@ckpack/fetch-helper`是对 [Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) API的轻量级封装。 需要在支持`Fetch`API的浏览器或者`Node.js`(版本小于v18.0.0)中使用.

## API文档

### fetchHelper<T=Response>(input: RequestInfo, init?: FetchHelperInit | undefined): Promise<T>

+ `input`: 请求的url或者 [`Request`](https://developer.mozilla.org/zh-CN/docs/Web/API/Request) 对象
+ `init`: 一个配置项对象，包括所有对请求的设置, 支持原生[fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch)的所有配置项参数,并添加了以下参数
  + `baseURL`: 如果传入的`input`不是绝对地址，该值将被添加到 `input` 之前,
  + `params`: 与请求一起发送的 URL 参数, 必须是普通对象或 `URLSearchParams` 对象
  + `paramsSerializer`: 设置自定义序列化`params`参数函数
  + `transformRequest`: 允许在请求发出之前更改请求参数
  + `transformResponse`: 允许在请求响应后更改响应数据
  + `adapter`: 允许自定义处理请求，这使得测试更容易。

返回一个 [`Promise`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 对象，默认是[`Response`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)类型，也可以通过`transformResponse`返回其他类型

```js
import fetchHelper from '@ckpack/fetch-helper';

// 等于 fetch('http://jsonplaceholder.typicode.com/comments?id=1')
fetchHelper('/comments', {
  baseURL: 'http://jsonplaceholder.typicode.com',
  params: {
    id: 1,
  },
});
```

### fetchHelper.create
使用自定义配置创建一个新的 `fetchHelper` 实例。

```js
const instance = fetchHelper.create({
  // 你也可以在此处设置其他参数
  baseURL: 'http://jsonplaceholder.typicode.com',
});
```
### fetchHelper.default

通过`default`属性永久修改请求实例配置:

```js
instance.default.baseURL = 'http://localhost:3000'
```

### fetchHelper[method]

为方便起见，为所有受支持的请求方法提供了别名。

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
## 例子

### 设置请求的配置

> create(defaultConfig?: FetchHelperInit)

你可以使用`create`方法创建一个具有默认配置项对象的实例


```js
import fetchHelper from '@ckpack/fetch-helper';

const instance = fetchHelper.create({
  // 你也可以在此处设置其他参数
  baseURL: 'http://jsonplaceholder.typicode.com',
});

// fetch('http://jsonplaceholder.typicode.com/comments?id=1')
instance(`/comments`, {
  params: {
    id: 1,
  },
});

// 通过default属性永久修改配置
// fetch('http://localhost:3000/comments?id=1')
instance.default.baseURL = 'http://localhost:3000'
instance(`/comments`, {
  params: {
    id: 1,
  },
});

// 通过参数临时修改配置
// fetch('http://localhost:3000/comments?id=1')
await instance(`/comments`, {
  baseURL: 'http://localhost:3000',
  params: {
    id: 1,
  },
});
```

### 设置请求`method`

你可以通过`method`参数设置请求方法，如 `GET`、`POST`
```js
await fetchHelper('http://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify({ firstName: 'Fred', lastName: 'Flintstone' }),
});

// 或者
await fetchHelper.post('http://jsonplaceholder.typicode.com/posts', JSON.stringify({ firstName: 'Fred', lastName: 'Flintstone' }), {
  headers: {
    'Content-type': 'application/json',
  },
});
```
### params

设置查询字符串(query string)，该参数序列化后被拼接到`url`后面
```js
// 等于 fetch('http://jsonplaceholder.typicode.com/comments?limit=10&page=2&ids=1%2C2%2C3')
fetchHelper('/comments', {
  baseURL: 'http://jsonplaceholder.typicode.com',
  params: {
    limit: 10,
    page: 2,
    ids: [1,2,3] // ids=1,2,3
  },
});
```

### paramsSerializer

`paramsSerializer` 是一个可选函数，负责序列化 `params`, 默认使用`new URLSearchParams(params).toString()`完成序列化

```js
// 等于 fetch('http://jsonplaceholder.typicode.com/comments?limit=10&page=2&ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3')
fetchHelper('/comments', {
  baseURL: 'http://jsonplaceholder.typicode.com',
  params: {
    limit: 10,
    page: 2,
    ids: [1,2,3] // ids[]=1&ids[]=2&ids[]=3
  },
  paramsSerializer: (params) => Qs.stringify(params, {arrayFormat: 'brackets'},
});
```

### transformRequest

通过`transformRequest`可以更改请求参数配置, 默认`fetch`通过`application/json`传参需要手动序列化`JSON.stringify(body)`,然后设置`Headers`中的`Content-type`为`application/json`, 你可以通过`transformRequest`简化该方式
```js
const resuest = fetchHelper.create({
  baseURL: 'http://jsonplaceholder.typicode.com',
  transformRequest(init){
    const { body } = init;
    if(typeof body === 'object' && !(body instanceof FormData || body instanceof URLSearchParams)) {
      const headers = new Headers(init.headers)
      headers.set('Content-type', 'application/json')
      init.headers = headers
      init.body = JSON.stringify(body)
    }
    return init;
  },
});

const res = await resuest.post('/posts', { firstName: 'Fred', lastName: 'Flintstone' })
```
### 通过`transformResponse`转换请求结果

```js
const fetchHelper = fetchHelper(`http://jsonplaceholder.typicode.com/comments`, {
  transformResponse(response) {
    return response.json();
  },
});
// 请求结果会被转为json
```

```ts
// 如果使用了TypeScript可以指定泛型类型
const fetchHelper = fetchHelper<{id: number}[]>(`http://jsonplaceholder.typicode.com/comments`, {
  transformResponse(response) {
    return response.json();
  },
});
// fetchHelper[0].id
```
### 设置请求`timeout`

```js
const instance = fetchHelper.create({
  transformRequest(config) {
    if(config.timeout){
      const controller = new AbortController();
      config.signal = controller.signal;
      setTimeout(()=> controller.abort('timeout'), config.timeout)
    }
    return config;
  },
});

await instance('http://jsonplaceholder.typicode.com/comments', {
  timeout: 6000,
});
// 六秒后自动取消请求
```

### 自定义`adapter`

```js
const fetchResponse = await fetchHelper(`http://jsonplaceholder.typicode.com/comments`, {
  params: {
    limit: 1,
    page: 2
  },
  adapter(input){
    return new Response(`${input}`);
  },
});

console.log(await fetchResponse.text())
// 不经过fetch直接返回结果: http://jsonplaceholder.typicode.com/comments?limit=1&page=2
```

更多例子请参考 [`@ckpack/fetch-helper`](./__test__)
