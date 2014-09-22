'use strict';
module.exports = worker;
var template = require('./iframe.hbs');
var Promise = require('lie');
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
  appendScript(iFrame, movedImports.imports, text, fullfill, codeword);
}
function IWorker(script) {
  var codeword = 'web_worker_calvinmetcalf' + Math.random().toString().slice(2);
  this._promise = makeIframe(script, codeword);
  this.onnmessage = this.onnerror = void 0;
  var self = this;
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
var trimWhitespace = /\s*[\'\"](\S*)[\'\"]\s*/;
var match1 = /(importScripts\(.*?\)[;|,]?)/;
var replace1 = /(importScripts\(\s*(?:\/\*)?\s*(?:[\'\"].*?[\'\"])?\s*(?:\*\/)?\s*\)[;|,]?)/;
var replace2 = /importScripts\(\s*([\'\"].*?[\'\"])?\s*\)[;|,]?/g;
function moveImports(string){
  var rest = string;
  var match = true;
  var matches = {};
  function loopFunc(a, b){
    if(b){
      // split it
      b.split(',').forEach(function(cc){
        // for each of the scripts
        // trim the white space
        // make it an absolute url
        // add it to the matches
        matches[makeUrl(cc.match(trimWhitespace)[1])] = true; // trim whitespace, add to matches
      });
    }
  }
  while(match){
    // find an instance of importScripts();
    match = rest.match(match1);
    // replace it with a new line
    rest = rest.replace(replace1,'\n');
    if(match){
      // then on that importScript do loopFunc on its contents
      match[0].replace(replace2, loopFunc);
    }
  }
  return {
    imports: Object.keys(matches), 
    script: rest
  };
}

function makeUrl(fileName) {
  var link = document.createElement('link');
  link.href = fileName;
  return link.href;
}