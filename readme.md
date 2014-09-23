web-worker [![Build Status](https://travis-ci.org/calvinmetcalf/web-worker.svg)](https://travis-ci.org/calvinmetcalf/web-worker)
====

Harness the power of web workers from within JavaScript libraries.  Allows you to either load a worker via a blob url or load the script in the same process via an iframe.  As of Internet Explorer 12 all major browsers will support blob urls.  This will allow you to package up JavaScript libraries that include worker components without needing to worry about cross origin issues.

API
===

if using browserify

```js
var webWorker = require('web-worker');
```

then give it a string or an array of strings

```js
var worker = webWorker([
  'self.onmessage = function (e) {',
  '  if (e.data === "ping") {',
  '   self.postMessage("pong")',
  '  }',
  '};'
]);
worker.onmessage = function (e) {
  console.log('message received', e.data);
  worker.terminate();
}
worker.postMessage('ping');
```

The API of postMessege is 

```js
worker.postMessage(object);
worker.postMessage(object, array);
worker.postMessage(object, port);
```

It always takes a first parameter of an object, this is what is to be transfered to the worker (or back).

Caveats
===

- script imports need to be turned into absolute links to work from within blob workers and to load them in iframes. To do so we statically analyze them and put them at the top of the page, this means that even if they are inside of comments they will be loaded and programic use of `importScripts` is impossible from within the iframe and in the blob worker will cause it to not be made absolute.
- not all errors inside of iframes will be caught
- browsers that support workers but don't support blob workers will get an iframe shim instead of a real worker.


Using Web Workers
===

Web Workers can be powerful but not if used poorly, some tips:

- Creating a worker is not free, it's actually a fairly expensive operation.  So you should create a few workers that you can reuse as opposed to creating a large number of single use workers that you can create and destroy.
- You shouldn't have more workers then you have cores on the computer it's running on.  Some browsers have `navigator.hardwareConcurrency` and there is a [polyfill](https://github.com/oftn/core-estimator).
- Workers are very good at speeding up operation which have a lot of computation and either a minimal amount of data in and out or that take buffers as input and output, for quick operation which involve a large amount of data, serializing and copying the data may take much longer then the actual 
- Latency and performance are not the same things. Doing an operation in a worker might cause the amount of time that the operation takes from start to finish to be longer, but since they are off the main thread, the biggest benefit of workers is not massively parallelized data processing (though you can sometimes do that), but moving things off of the main thread so that the page doesn't freeze.
- Using array buffers which may be transfered 