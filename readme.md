web-worker
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

Caveats
===

- script imports need to be turned into absolute links, this will import ones inside comments
- not all errors inside of iframes will be caught
- browsers that support workers but don't support blob workers don't get real workers