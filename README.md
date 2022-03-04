# fetch-helper

<h4 align="center">
  <a href="/README-ZH.md">中文</a>
  |
  <a href="/README.md">ENGLISH</a>
</h4>

`fetch-helper` is a lightweight wrapper for the [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) API, only supported in browsers, if needed For use in node environment, please add `fetch-node` global dependency.

````js
import fetch from 'node-fetch';
globalThis.fetch = fetch;
````

>If you are using a node version greater than `v17.5.0`, you can enable the `fetch` API directly with the --experimental-fetch CLI flag

## parameters

> Promise<Response> fetchHelper(input[, init]);

+ `input`: the requested url or [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object
+ `init`: a configuration item object, including all the settings for the request, except all the configuration items that support native [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) Parameters also added the following parameters
  + `interceptors`: request interceptors, this parameter contains two attributes
    + `request`: contains an array of type `(init, ctx) => init`, triggered before the request is triggered, you can modify the request parameters by returning a new configuration item object
    + `response`: contains an array of type `(response, ctx) => response`, triggered after the request is triggered, you can use it to modify the returned `response`

>`ctx` is the context of the current request instance, through which you can get or modify the current request's `input`, `init` and other instance parameters

## return value

A [`Response`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) [`Response`](https://developer.mozilla.org/ en-US/docs/Web/API/Response) object.

## method

### create(init])

You can use the `create` method to create an instance with a default config object

````js
fetchHelper.create({
  method: 'GET',
  mode: 'cors',
  interceptors: {
    response: [(response, config) => {
      return response.json();
    }]
  }
});

fetchInstance(`some url`);
````

## example

### Set request `header`

````js
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
````

### Convert the returned result to `json`

````js
fetchHelper(`some url`, {
  interceptors: {
    response: [(response) => {
      return response.json();
    }]
  }
});
````

### Custom `timeout`

````js
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
````

### custom `baseURL`

````js
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
````
