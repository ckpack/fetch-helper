# fetch-helper

`fetch-helper`是对 [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) API的简单封装, 所以只支持在浏览器中使用，如果需要在node环境中使用，请添加`fetch-node`依赖。

```js
import fetch from 'node-fetch';
globalThis.fetch = fetch;
```

## 参数

> Promise<Response> fetch(input[, Fetchinit]);

`fetch-helper`除了支持原生[fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch)的所有配置项参数还添加了以下参数

+ `timeout`: `timeout?: number`,超时时间（单位毫秒），默认不设置超时时间
+ `interceptors`: ``, 请求拦截器，该参数包含两个属性
  + `request`: `(fetchConfig: FetchConfig) => FetchConfig []`, 请求触发前触发，你可以用来修改请求参数
  + `response`: `(response: Response, fetchConfig: FetchConfig) => unknown []`, 请求触发后触发，你可以用来修改返回结果

如下面是一个获取修改`headers`,并将返回结果转为`json`的例子

```js
const fetchHelper = FetchHelper(`some url`, {
  // fetch配置项所有可选的参数
  interceptors: {
    request: [(config) => {
      config.headers = new Headers({
        'Authorization': localStorage.getItem('token')
      });
      return config;
    }],
    response: [(response, config) => {
      return response.json();
    }]
  }
});
```

## 返回值

异步返回一个 [Response](https://developer.mozilla.org/zh-CN/docs/Web/API/Response) 对象。

## 其他

你可以使用`create`方法创建一个自定义配置的新实例。

```js
const featch = FetchHelper.create({
  interceptors: {
    request: [(config) => {
      config.headers = new Headers({
        'Authorization': localStorage.getItem('token')
      });
      return config;
    }],
    response: [(response, config) => {
      return response.json();
    }]
  }
});

featch(`some url`);
```
