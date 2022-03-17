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

> If you are using a node version greater than `v17.5.0`, you can directly enable the `fetch` API with the --experimental-fetch CLI flag

## API Documentation

### fetchHelper

> Promise<Response> fetchHelper(input[, init]);

+ `input`: the requested url or [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object
+ `init`: a configuration item object, including all the settings for the request, except all the configuration items that support native [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch) Parameters also added the following parameters
  + `baseURL`: this value will be prepended to `input` unless `input` is an absolute address or not a `string`
  + `params`: URL parameters sent with the request, must be a plain object or a `URLSearchParams` object
  + `paramsSerializer`: allows custom serialization of `params` parameter functions
  + `transformRequest`: allows changing request parameters before
  + `transformResponse`: allows to change response data before
  + `adapter`: allows custom handling of `fetch` requests, which makes testing easier.

> `ctx` is the context of the current request instance, through which you can get or modify the current request's `input`, `init` and other instance parameters

Returns a [`Response`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) of a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) /en-US/docs/Web/API/Response) object.

````js
import fetchHelper from '@ckpack/fetch-helper';

fetchHelper('/sub-url', {
  baseURL: 'https://example.com',
  params: {
    foo: 'bar',
  },
});
// => fetch('https://example.com/sub-url?foo=bar')
````

### create(init])

You can use the `create` method to create an instance with a default config object

````js
import fetchHelper from '@ckpack/fetch-helper';
const fetchInstance = fetchHelper.create({
  method: 'GET',
  mode: 'cors',
  transformResponse(response) {
    return response.json();
  },
});

fetchInstance(`some url`);
````

## example

### Convert the returned result to `json`

````js
const fetchHelper = fetchHelper(`some url`, {
  transformResponse(response) {
    return response.json();
  },
});
// The returned result will be converted to json
````

### Set the request's `baseURL`

````js
const fetchInstance = fetchHelper.create({
    baseURL: 'http://some.url',
});

fetchInstance('/sub-url');
// => http://some.url/sub-url
````

### Set request `timeout`

````js
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
// automatically cancel the request after six seconds
````

### Custom `adapter`

````js
const res = await fetchHelper('https://jsonplaceholder.typicode.com/comments', {
  adapter: () => ({ id: 1 }),
});
// return the result directly without fetch => { id: 1 }
````

For more examples, please refer to [`@ckpack/fetch-helper`](./__test__/index.test.js)