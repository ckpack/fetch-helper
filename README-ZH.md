# fetch-helper

<h4 align="center">
  <a href="/README-ZH.md">中文</a>
  |
  <a href="/README.md">ENGLISH</a>
</h4>

`fetch-helper`是对 [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) API的轻量级封装, 只支持在浏览器中使用，如果需要在node环境中使用，请添加`fetch-node`全局依赖。

```js
import fetch from 'node-fetch';
globalThis.fetch = fetch;
```

> 如果你使用的node版本大于`v17.5.0`, 可以直接使用 --experimental-fetch CLI 标志启用`fetch` API

## API文档

### fetchHelper

> Promise<Response> fetchHelper(input[, init]);

+ `input`: 请求的url或者 [`Request`](https://developer.mozilla.org/zh-CN/docs/Web/API/Request) 对象
+ `init`: 一个配置项对象，包括所有对请求的设置, 除了支持原生[fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch)的所有配置项参数还添加了以下参数
  + `baseURL`: 该值将被添加到 `input` 之前, 除非`input`是绝对地址或者不是`string`
  + `params`: 与请求一起发送的 URL 参数, 必须是普通对象或 `URLSearchParams` 对象
  + `paramsSerializer`: 允许自定义序列化`params`参数函数
  + `transformRequest`: 允许在之前更改请求参数
  + `transformResponse`: 允许在之前更改响应数据
  + `adapter`: 允许自定义处理`fetch`请求，这使得测试更容易。

> `ctx`是当前请求实例的上下文, 通过该参数可以获取或者修改当前请求的`input`、`init`等实例参数

返回一个 [`Promise`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 的 [`Response`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response) 对象。

```js
import fetchHelper from '@ckpack/fetch-helper';

fetchHelper('/sub-url', {
  baseURL: 'https://example.com',
  params: {
    foo: 'bar',
  },
});
// => fetch('https://example.com/sub-url?foo=bar')
```

### create(init])

你可以使用`create`方法创建一个具有默认配置项对象的实例

```js
import fetchHelper from '@ckpack/fetch-helper';
const fetchInstance = fetchHelper.create({
  method: 'GET',
  mode: 'cors',
  transformResponse(response) {
    return response.json();
  },
});

fetchInstance(`some url`);
```

## 例子

### 将返回结果转为`json`

```js
const fetchHelper = fetchHelper(`some url`, {
  transformResponse(response) {
    return response.json();
  },
});
// 返回结果会被转为json
```

### 设置请求的`baseURL`

```js
const fetchInstance = fetchHelper.create({
    baseURL: 'http://some.url',
});

fetchInstance('/sub-url');
// => http://some.url/sub-url
```

### 设置请求`timeout`

```js
const fetchInstance = fetchHelper.create({
  transformRequest(config) {
    if(config.timeout){
      const controller = new AbortController();
      config.signal = controller.signal;
      setTimeout(()=> {controller.abort()}, config.timeout)
    }
    return config;
  },
});

fetchInstance('some url', {
  timeout: 6000,
});
// 六秒后自动取消请求
```

### 自定义的`adapter`

```js
const res = await fetchHelper('https://jsonplaceholder.typicode.com/comments', {
  adapter: () => ({ id: 1 }),
});
// 不经过fetch直接返回结果 => { id: 1 }
```

更多例子请参考 [`@ckpack/fetch-helper`](./__test__/index.test.js)
