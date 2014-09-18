'use strict';
module.exports = worker;

function worker (script) {
  if (typeof global.Worker === 'undefined') {
    throw new Error('workers are not avialible and havn\'t done a shim yet');
  }
  if (!Array.isArray(script)) {
    script = [script];
  }
  // is this still neccisary?
  var URL = global.URL || global.webkitURL;
  return new Worker(URL.createObjectURL(new Blob(script, {type: 'text/javascript'})));
}