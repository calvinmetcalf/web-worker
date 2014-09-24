'use strict';
var template = require('./iframe.hbs');
var Promise = require('lie');
var moveImports = require('./moveimports');

module.exports = IWorker;
function createIframe(script, codeword, fullfill){
  var iFrame = document.createElement('iframe');
  iFrame.style.display = 'none';
  document.body.appendChild(iFrame);
  var movedImports = moveImports(script);
  var  text = template({
    script: movedImports.script,
    codeword: codeword
  });
  appendScript(iFrame, movedImports.imports, text, fullfill, codeword);
}
function IWorker(script) {
  var self = this;
  var codeword = 'web_worker_calvinmetcalf' + Math.random().toString().slice(2);
  this._promise = makeIframe(script, codeword);
  this._promise.catch(function (e) {
    self.onerror(e);
  });
  this.onnmessage = void 0;
  global.addEventListener('message', function(e) {
    if (!e.data.slice) {
      return;
    }
    if(e.data.slice(0, codeword.length + 5) === (codeword + 'close')){
      self.terminate();
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
  var self = this;
  this._promise.then(function(iFrame){
    iFrame.contentWindow.__onmessage(JSON.stringify(data),'*');
  });
};
IWorker.prototype.addEventListener = function (ev, func) {
  if (ev === 'message') {
    this.onmessage = func;
  } else if (ev === 'message') {
    this.onerror = func;
  }

};
IWorker.prototype.onerror = function (e) {
  throw e;
};
IWorker.prototype.terminate=function(){
  this._promise.then(function(iFrame){
    document.body.removeChild(iFrame);
  });
};
function appendScript(win, scripts, main, fullfill, codeword){
  var doc = win.contentWindow.document;
  doc.open();
  if (scripts.length) {
    doc.write('<script src="' + scripts.join('"></script><script src="') + '"></script>');
  }
  doc[codeword] = function () {
    doc[codeword] = null;
    var script = doc.createElement('script');
    if (script.text !== undefined) {
      script.text = main;
    } else {
      script.innerHTML = main;
    }
    doc.documentElement.appendChild(script);
    fullfill(win);
  };
  doc.write('<script>window.document.'+ codeword + '()</script>');
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