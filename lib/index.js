'use strict';
var moveImports = require('./moveimports');
var IWorker = require('./iframe');

module.exports = worker;

function worker (script) {
   if (Array.isArray(script)) {
    script = script.join('\n');
  }
  if (typeof global.Worker === 'undefined' || global.___FORCE_IFRAME) {
    return new IWorker(script);
  }

  // is this still neccisary?
  var URL = global.URL || global.webkitURL;
  try {
    var brokenOut = moveImports(script);
    var outArray = [];
    if (brokenOut.imports.length) {
      outArray.push('importScripts(\'');
      outArray.push( brokenOut.imports.join('\',\''));
      outArray.push('\');\n');
    }
    outArray.push(brokenOut.script);
    return new Worker(URL.createObjectURL(new Blob(outArray, {type: 'text/javascript'})));
  } catch(e) {
    return new IWorker(script);
  }
}
