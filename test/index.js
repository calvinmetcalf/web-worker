'use strict';
var wWorker = require('../lib');
var test = require('prova');

test('tests', runTests);

test('other tests', runTests);
function runTests(t) {
  t.test('basic worker', function (t) {
    t.plan(1);
    var workerScript = [
    'self.onmessage = function (e) {',
    '  if (e.data.type === "ping") {',
    '   self.postMessage({type: "pong",msg:e.data.msg})',
    '  }',
    '};'
    ];
    var worker = wWorker(workerScript);
    var nonce = 'asdfasd';
    worker.onerror = function (e) {
      t.notOk(e, 'should not error');
      worker.terminate();
    };
    worker.onmessage = function (e) {
      t.equals(e.data.msg,nonce, 'correct return');
      worker.terminate();
    };
    worker.postMessage({type: 'foo', msg: 'bah'});
    worker.postMessage({type: 'ping', msg: nonce});
  });
  t.test('worker with imports', function (t) {
    t.plan(1);
    var workerScript = [
    'self.onmessage = function (e) {',
    '  if (e.data.type === "ping") {',
    '   importScripts(\'/assets/in/test/import.js\');',
    '   self.postMessage({type: "pong",msg:foo})',
    '  }',
    '};'
    ];
    var worker = wWorker(workerScript);
    var nonce = 'asdfasd';
    worker.onerror = function (e) {
      t.notOk(e, 'should not error');
      worker.terminate();
    };
    worker.onmessage = function (e) {
      t.equals(e.data.msg,'bar', 'correct return');
      worker.terminate();
    };
    worker.postMessage({type: 'foo', msg: 'bah'});
    worker.postMessage({type: 'ping', msg: nonce});
  });
  t.test('worker with imports2', function (t) {
    t.plan(1);
    var workerScript = [
    'self.onmessage = function (e) {',
    '  if (e.data.type === "ping") {',
    '   importScripts(/*\'/assets/in/test/import.js\'*/);',
    '   self.postMessage({type: "pong",msg:foo})',
    '  }',
    '};'
    ];
    var worker = wWorker(workerScript);
    var nonce = 'asdfasd';
    worker.onerror = function (e) {
      t.ok(e, 'should error');
      worker.terminate();
      global.___FORCE_IFRAME = true;
    };
    worker.onmessage = function (e) {
      t.notOk(e, 'should return');
      worker.terminate();
    };
    worker.postMessage({type: 'foo', msg: 'bah'});
    worker.postMessage({type: 'ping', msg: nonce});
  });
}