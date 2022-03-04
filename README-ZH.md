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

>如果你使用的node版本大于`v17.5.0`, 可以直接使用 --experimental-fetch CLI 标志启用`fetch` API

## 参数

> Promise<Response> fetchHelper(input[, init]);

+ `input`: 请求的url或者 [`Request`](https://developer.mozilla.org/zh-CN/docs/Web/API/Request) 对象
+ `init`: 一个配置项对象，包括所有对请求的设置, 除了支持原生[fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch)的所有配置项参数还添加了以下参数
  + `interceptors`: 请求拦截器，该参数包含两个属性
    + `request`: 包含`(init, ctx) => init`类型的数组, 请求触发前触发，你可以通过返回一个新的配置项对象修改请求参数
    + `response`: 包含`(response, ctx) => response`类型的数组, 请求触发后触发，你可以用来修改返回的`response`

>`ctx`是当前请求实例的上下文, 通过该参数可以获取或者修改当前请求的`input`、`init`等实例参数

## 返回值

一个 [`Promise`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 的 [`Response`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response) 对象。

## 方法

### create(init])

你可以使用`create`方法创建一个具有默认配置项对象的实例

```js
const fetchInstance = fetchHelper.create({
  method: 'GET',
  mode: 'cors',
  interceptors: {
    response: [(response, config) => {
      return response.json();
    }]
  }
});

fetchInstance(`some url`);
```

## 例子

### 设置请求`header`

```js
fetchHelper(`some url`, {
  interceptors: {
    request: [(config) => {
      config.headers = new Headers({
        'Authorization': localStorage.getItem('token')
      });
      return config;
    }],
  }
});
```

### 将返回结果转为`json`

```js
const fetchHelper = fetchHelper(`some url`, {
  interceptors: {
    response: [(response) => {
      return response.json();
    }]
  }
});
```

### 自定义的`timeout`

```js
const fetchInstance = fetchHelper.create({
    interceptors: {
      request: [(config)=>{
        if(config.timeout){
          const controller = new AbortController();
          config.signal = controller.signal;
          setTimeout(()=> {controller.abort()}, config.timeout)
        }
        return config;
      }],
    }
});

fetchInstance('some url', {
  timeout: 6000,
});
```

### 自定义的`baseURL`

```js
const fetchInstance = fetchHelper.create({
    baseURL: 'http://some.url',
    interceptors: {
      request: [(config, ctx)=>{
        ctx.input = `${config.baseURL}${ctx.input}`;
        return config;
      }],
    }
});

fetchInstance('/sub-url');
```
