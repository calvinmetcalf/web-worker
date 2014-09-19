'use strict';
module.exports = worker;
var template = require('./iframe.hbs');
var Promise = require('lie');
function worker (script) {
  if (typeof global.Worker === 'undefined') {
    return new IWorker(script);
  }
  if (!Array.isArray(script)) {
    script = [script];
  }
  // is this still neccisary?
  var URL = global.URL || global.webkitURL;
  try {
    return new Worker(URL.createObjectURL(new Blob(script, {type: 'text/javascript'})));
  } catch(e) {
    return new IWorker(script);
  }
}
//much of the iframe stuff inspired by https://github.com/padolsey/operative
//most things besides the names have since been changed
function createIframe(script, codeword, fullfill){
  var iFrame = document.createElement('iframe');
  iFrame.style.display = 'none';
  document.body.appendChild(iFrame);
  var movedImports = moveImports(script);
  var  text = template({
    script: movedImports.script,
    codeword: codeword
  });
  appendScript(iFrame, movedImports, text, fullfill, codeword);
}
function IWorker(script) {
  var codeword = 'web-worker-calvinmetcalf' + Math.random();
  this._promise = makeIframe(script, codeword);
  this.onnmessage = this.onnerror = void 0;
  var self = this;
  global.addEventListener('message', function(e) {
    if (!e.data.slice) {
      return;
    }
    if(e.data.slice(0, codeword.length + 5) === (codeword + 'error') && typeof self.onerror === 'function'){
      self.onerror({data:JSON.parse(e.data.slice(codeword.length + 5))});
      return;
    }
    if(e.data.slice(0, codeword.length) === codeword && typeof self.onmessage === 'function'){
      self.onmessage({data:JSON.parse(e.data.slice(codeword.length))});
    }
  });
}

IWorker.prototype.postMessage = function(data){
  this._promise.then(function(iFrame){
    iFrame.contentWindow.postMessage(JSON.stringify(data),'*');
  });
};
IWorker.prototype.addEventListener = function (ev, func) {
  if (ev === 'message') {
    this.onmessage = func;
  } else if (ev === 'message') {
    this.onerror = func;
  }

};
IWorker.prototype.terminate=function(){
  this._promise.then(function(iFrame){
    document.body.removeChild(iFrame);
  });
};
function appendScript(win, scripts, main, fullfill, codeword){
  var doc = win.contentWindow.document;
  doc.open();
  doc.write('<script src="' + scripts.join('"></script><script src="') + '"></script>');
  global[codeword] = function () {
    global[codeword] = null;
    var script = doc.createElement('script');
    if (script.text !== undefined) {
      script.text = main;
    } else {
      script.innerHTML = main;
    }
    doc.documentElement.appendChild(script);
    fullfill(win);
  };
  doc.write('<script>window.top["'+ codeword +'"]()</script>');
  doc.close();
}

function makeIframe(script, codeword){
  return new Promise(function (fullfill, reject) {
    if (document.readyState === 'complete'){
      createIframe(script, codeword, fullfill);
    } else{ 
      global.addEventListener('load', function () {
        createIframe(script, codeword, fullfill);
      }, false);
    }
  });
}
function moveImports(string){
  var rest = string;
  var match = true;
  var matches = {};
  function loopFunc(a, b){
    if(b){
      b.split(',').forEach(function(cc){
        matches[makeUrl(cc.match(/\s*[\'\"](\S*)[\'\"]\s*/)[1])] = true; // trim whitespace, add to matches
      });
    }
  }
  while(match){
    match = rest.match(/(importScripts\(.*?\)[;|,]?)/);
    rest = rest.replace(/(importScripts\(\s*(?:[\'\"].*?[\'\"])?\s*\)[;|,]?)/,'\n');
    if(match){
      match[0].replace(/importScripts\(\s*([\'\"].*?[\'\"])?\s*\)[;|,]?/g, loopFunc);
    }
  }
  matches = Object.keys(matches);
  return {
    imports: matches, 
    script: rest
  };
}

function makeUrl(fileName) {
  var link = document.createElement('link');
  link.href = fileName;
  return link.href;
}