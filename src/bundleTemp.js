// @todo add polyfill on use only
// @todo embed packem version
module.exports = initialBundleContent => `/* Main Bundle | Packem v0.1.0 (${new Date().toUTCString()}) */

;(function() {
  var __packemModules = {};\
${initialBundleContent}
  
  window.__packem = {
    // unfetch@4.1.0
    fetch: function(e,n){return n=n||{},new Promise(function(t,s){var r=new XMLHttpRequest,o=[],u=[],i={},a=function(){return{ok:2==(r.status/100|0),statusText:r.statusText,status:r.status,url:r.responseURL,text:function(){return Promise.resolve(r.responseText)},json:function(){return Promise.resolve(JSON.parse(r.responseText))},blob:function(){return Promise.resolve(new Blob([r.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var c in r.open(n.method||"get",e,!0),r.onload=function(){r.getAllResponseHeaders().replace(/^(.*?):[^\\S\\n]*([\\s\\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t}),t(a())},r.onerror=s,r.withCredentials="include"==n.credentials,n.headers)r.setRequestHeader(c,n.headers[c]);r.send(n.body||null)})},
    import: function(url, modId) {
      var module = { exports : {} };
      if (__packemModules[modId]) {
        __packemModules[modId](__packem.require, __packem.import, module, module.exports);
        return new Promise(function(resolve, reject) {
          resolve(module.exports.default || module.exports);
          console.log(modId + " resolved from cache.");
        });
      }
      
      return __packem.fetch(url)
        .then(function(data) {return data.text();})
        .then(function(code) {
          eval(code);
          __packemModules[modId](__packem.require, __packem.import, module, module.exports);
          return module.exports.default || module.exports;
        });
    },
    require: function(modId) {
      var module = { exports : {} };

      __packemModules[modId](__packem.require, __packem.import, module, module.exports);

      return module.exports.default || module.exports;
    },
    reload: function() { __packem.require("_mod_root"); }
  }

  __packem.reload();
})();
`;
