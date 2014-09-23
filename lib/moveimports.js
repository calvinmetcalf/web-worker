'use strict';
//much of the iframe stuff inspired by https://github.com/padolsey/operative
//most things besides the names have since been changed
module.exports = moveImports;
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