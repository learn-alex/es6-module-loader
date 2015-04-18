/*
 *  es6-module-loader v0.16.5
 *  https://github.com/ModuleLoader/es6-module-loader
 *  Copyright (c) 2015 Guy Bedford, Luke Hoban, Addy Osmani; Licensed MIT
 */

!function(a){"object"==typeof exports?module.exports=a():"function"==typeof define&&define.amd?define(a):"undefined"!=typeof window?window.Promise=a():"undefined"!=typeof global?global.Promise=a():"undefined"!=typeof self&&(self.Promise=a())}(function(){var a;return function b(a,c,d){function e(g,h){if(!c[g]){if(!a[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};a[g][0].call(j.exports,function(b){var c=a[g][1][b];return e(c?c:b)},j,j.exports,b,a,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){var c=a("../lib/decorators/unhandledRejection"),d=c(a("../lib/Promise"));b.exports="undefined"!=typeof global?global.Promise=d:"undefined"!=typeof self?self.Promise=d:d},{"../lib/Promise":2,"../lib/decorators/unhandledRejection":4}],2:[function(b,c){!function(a){"use strict";a(function(a){var b=a("./makePromise"),c=a("./Scheduler"),d=a("./env").asap;return b({scheduler:new c(d)})})}("function"==typeof a&&a.amd?a:function(a){c.exports=a(b)})},{"./Scheduler":3,"./env":5,"./makePromise":7}],3:[function(b,c){!function(a){"use strict";a(function(){function a(a){this._async=a,this._running=!1,this._queue=this,this._queueLen=0,this._afterQueue={},this._afterQueueLen=0;var b=this;this.drain=function(){b._drain()}}return a.prototype.enqueue=function(a){this._queue[this._queueLen++]=a,this.run()},a.prototype.afterQueue=function(a){this._afterQueue[this._afterQueueLen++]=a,this.run()},a.prototype.run=function(){this._running||(this._running=!0,this._async(this.drain))},a.prototype._drain=function(){for(var a=0;a<this._queueLen;++a)this._queue[a].run(),this._queue[a]=void 0;for(this._queueLen=0,this._running=!1,a=0;a<this._afterQueueLen;++a)this._afterQueue[a].run(),this._afterQueue[a]=void 0;this._afterQueueLen=0},a})}("function"==typeof a&&a.amd?a:function(a){c.exports=a()})},{}],4:[function(b,c){!function(a){"use strict";a(function(a){function b(a){throw a}function c(){}var d=a("../env").setTimer,e=a("../format");return function(a){function f(a){a.handled||(n.push(a),k("Potentially unhandled rejection ["+a.id+"] "+e.formatError(a.value)))}function g(a){var b=n.indexOf(a);b>=0&&(n.splice(b,1),l("Handled previous rejection ["+a.id+"] "+e.formatObject(a.value)))}function h(a,b){m.push(a,b),null===o&&(o=d(i,0))}function i(){for(o=null;m.length>0;)m.shift()(m.shift())}var j,k=c,l=c;"undefined"!=typeof console&&(j=console,k="undefined"!=typeof j.error?function(a){j.error(a)}:function(a){j.log(a)},l="undefined"!=typeof j.info?function(a){j.info(a)}:function(a){j.log(a)}),a.onPotentiallyUnhandledRejection=function(a){h(f,a)},a.onPotentiallyUnhandledRejectionHandled=function(a){h(g,a)},a.onFatalRejection=function(a){h(b,a.value)};var m=[],n=[],o=null;return a}})}("function"==typeof a&&a.amd?a:function(a){c.exports=a(b)})},{"../env":5,"../format":6}],5:[function(b,c){!function(a){"use strict";a(function(a){function b(){return"undefined"!=typeof process&&null!==process&&"function"==typeof process.nextTick}function c(){return"function"==typeof MutationObserver&&MutationObserver||"function"==typeof WebKitMutationObserver&&WebKitMutationObserver}function d(a){function b(){var a=c;c=void 0,a()}var c,d=document.createTextNode(""),e=new a(b);e.observe(d,{characterData:!0});var f=0;return function(a){c=a,d.data=f^=1}}var e,f="undefined"!=typeof setTimeout&&setTimeout,g=function(a,b){return setTimeout(a,b)},h=function(a){return clearTimeout(a)},i=function(a){return f(a,0)};if(b())i=function(a){return process.nextTick(a)};else if(e=c())i=d(e);else if(!f){var j=a,k=j("vertx");g=function(a,b){return k.setTimer(b,a)},h=k.cancelTimer,i=k.runOnLoop||k.runOnContext}return{setTimer:g,clearTimer:h,asap:i}})}("function"==typeof a&&a.amd?a:function(a){c.exports=a(b)})},{}],6:[function(b,c){!function(a){"use strict";a(function(){function a(a){var c="object"==typeof a&&null!==a&&a.stack?a.stack:b(a);return a instanceof Error?c:c+" (WARNING: non-Error used)"}function b(a){var b=String(a);return"[object Object]"===b&&"undefined"!=typeof JSON&&(b=c(a,b)),b}function c(a,b){try{return JSON.stringify(a)}catch(c){return b}}return{formatError:a,formatObject:b,tryStringify:c}})}("function"==typeof a&&a.amd?a:function(a){c.exports=a()})},{}],7:[function(b,c){!function(a){"use strict";a(function(){return function(a){function b(a,b){this._handler=a===t?b:c(a)}function c(a){function b(a){e.resolve(a)}function c(a){e.reject(a)}function d(a){e.notify(a)}var e=new v;try{a(b,c,d)}catch(f){c(f)}return e}function d(a){return I(a)?a:new b(t,new w(q(a)))}function e(a){return new b(t,new w(new z(a)))}function f(){return _}function g(){return new b(t,new v)}function h(a,b){var c=new v(a.receiver,a.join().context);return new b(t,c)}function i(a){return k(S,null,a)}function j(a,b){return k(N,a,b)}function k(a,c,d){function e(b,e,g){g.resolved||l(d,f,b,a(c,e,b),g)}function f(a,b,c){k[a]=b,0===--j&&c.become(new y(k))}for(var g,h="function"==typeof c?e:f,i=new v,j=d.length>>>0,k=new Array(j),m=0;m<d.length&&!i.resolved;++m)g=d[m],void 0!==g||m in d?l(d,h,m,g,i):--j;return 0===j&&i.become(new y(k)),new b(t,i)}function l(a,b,c,d,e){if(J(d)){var f=r(d),g=f.state();0===g?f.fold(b,c,void 0,e):g>0?b(c,f.value,e):(e.become(f),m(a,c+1,f))}else b(c,d,e)}function m(a,b,c){for(var d=b;d<a.length;++d)n(q(a[d]),c)}function n(a,b){if(a!==b){var c=a.state();0===c?a.visit(a,void 0,a._unreport):0>c&&a._unreport()}}function o(a){return"object"!=typeof a||null===a?e(new TypeError("non-iterable passed to race()")):0===a.length?f():1===a.length?d(a[0]):p(a)}function p(a){var c,d,e,f=new v;for(c=0;c<a.length;++c)if(d=a[c],void 0!==d||c in a){if(e=q(d),0!==e.state()){f.become(e),m(a,c+1,e);break}e.visit(f,f.resolve,f.reject)}return new b(t,f)}function q(a){return I(a)?a._handler.join():J(a)?s(a):new y(a)}function r(a){return I(a)?a._handler.join():s(a)}function s(a){try{var b=a.then;return"function"==typeof b?new x(b,a):new y(a)}catch(c){return new z(c)}}function t(){}function u(){}function v(a,c){b.createContext(this,c),this.consumers=void 0,this.receiver=a,this.handler=void 0,this.resolved=!1}function w(a){this.handler=a}function x(a,b){v.call(this),V.enqueue(new F(a,b,this))}function y(a){b.createContext(this),this.value=a}function z(a){b.createContext(this),this.id=++Z,this.value=a,this.handled=!1,this.reported=!1,this._report()}function A(a,b){this.rejection=a,this.context=b}function B(a){this.rejection=a}function C(){return new z(new TypeError("Promise cycle"))}function D(a,b){this.continuation=a,this.handler=b}function E(a,b){this.handler=b,this.value=a}function F(a,b,c){this._then=a,this.thenable=b,this.resolver=c}function G(a,b,c,d,e){try{a.call(b,c,d,e)}catch(f){d(f)}}function H(a,b,c,d){this.f=a,this.z=b,this.c=c,this.to=d,this.resolver=Y,this.receiver=this}function I(a){return a instanceof b}function J(a){return("object"==typeof a||"function"==typeof a)&&null!==a}function K(a,c,d,e){return"function"!=typeof a?e.become(c):(b.enterContext(c),O(a,c.value,d,e),void b.exitContext())}function L(a,c,d,e,f){return"function"!=typeof a?f.become(d):(b.enterContext(d),P(a,c,d.value,e,f),void b.exitContext())}function M(a,c,d,e,f){return"function"!=typeof a?f.notify(c):(b.enterContext(d),Q(a,c,e,f),void b.exitContext())}function N(a,b,c){try{return a(b,c)}catch(d){return e(d)}}function O(a,b,c,d){try{d.become(q(a.call(c,b)))}catch(e){d.become(new z(e))}}function P(a,b,c,d,e){try{a.call(d,b,c,e)}catch(f){e.become(new z(f))}}function Q(a,b,c,d){try{d.notify(a.call(c,b))}catch(e){d.notify(e)}}function R(a,b){b.prototype=X(a.prototype),b.prototype.constructor=b}function S(a,b){return b}function T(){}function U(){return"undefined"!=typeof process&&null!==process&&"function"==typeof process.emit?function(a,b){return"unhandledRejection"===a?process.emit(a,b.value,b):process.emit(a,b)}:"undefined"!=typeof self&&"function"==typeof CustomEvent?function(a,b,c){var d=!1;try{var e=new c("unhandledRejection");d=e instanceof c}catch(f){}return d?function(a,d){var e=new c(a,{detail:{reason:d.value,key:d},bubbles:!1,cancelable:!0});return!b.dispatchEvent(e)}:a}(T,self,CustomEvent):T}var V=a.scheduler,W=U(),X=Object.create||function(a){function b(){}return b.prototype=a,new b};b.resolve=d,b.reject=e,b.never=f,b._defer=g,b._handler=q,b.prototype.then=function(a,b,c){var d=this._handler,e=d.join().state();if("function"!=typeof a&&e>0||"function"!=typeof b&&0>e)return new this.constructor(t,d);var f=this._beget(),g=f._handler;return d.chain(g,d.receiver,a,b,c),f},b.prototype["catch"]=function(a){return this.then(void 0,a)},b.prototype._beget=function(){return h(this._handler,this.constructor)},b.all=i,b.race=o,b._traverse=j,b._visitRemaining=m,t.prototype.when=t.prototype.become=t.prototype.notify=t.prototype.fail=t.prototype._unreport=t.prototype._report=T,t.prototype._state=0,t.prototype.state=function(){return this._state},t.prototype.join=function(){for(var a=this;void 0!==a.handler;)a=a.handler;return a},t.prototype.chain=function(a,b,c,d,e){this.when({resolver:a,receiver:b,fulfilled:c,rejected:d,progress:e})},t.prototype.visit=function(a,b,c,d){this.chain(Y,a,b,c,d)},t.prototype.fold=function(a,b,c,d){this.when(new H(a,b,c,d))},R(t,u),u.prototype.become=function(a){a.fail()};var Y=new u;R(t,v),v.prototype._state=0,v.prototype.resolve=function(a){this.become(q(a))},v.prototype.reject=function(a){this.resolved||this.become(new z(a))},v.prototype.join=function(){if(!this.resolved)return this;for(var a=this;void 0!==a.handler;)if(a=a.handler,a===this)return this.handler=C();return a},v.prototype.run=function(){var a=this.consumers,b=this.handler;this.handler=this.handler.join(),this.consumers=void 0;for(var c=0;c<a.length;++c)b.when(a[c])},v.prototype.become=function(a){this.resolved||(this.resolved=!0,this.handler=a,void 0!==this.consumers&&V.enqueue(this),void 0!==this.context&&a._report(this.context))},v.prototype.when=function(a){this.resolved?V.enqueue(new D(a,this.handler)):void 0===this.consumers?this.consumers=[a]:this.consumers.push(a)},v.prototype.notify=function(a){this.resolved||V.enqueue(new E(a,this))},v.prototype.fail=function(a){var b="undefined"==typeof a?this.context:a;this.resolved&&this.handler.join().fail(b)},v.prototype._report=function(a){this.resolved&&this.handler.join()._report(a)},v.prototype._unreport=function(){this.resolved&&this.handler.join()._unreport()},R(t,w),w.prototype.when=function(a){V.enqueue(new D(a,this))},w.prototype._report=function(a){this.join()._report(a)},w.prototype._unreport=function(){this.join()._unreport()},R(v,x),R(t,y),y.prototype._state=1,y.prototype.fold=function(a,b,c,d){L(a,b,this,c,d)},y.prototype.when=function(a){K(a.fulfilled,this,a.receiver,a.resolver)};var Z=0;R(t,z),z.prototype._state=-1,z.prototype.fold=function(a,b,c,d){d.become(this)},z.prototype.when=function(a){"function"==typeof a.rejected&&this._unreport(),K(a.rejected,this,a.receiver,a.resolver)},z.prototype._report=function(a){V.afterQueue(new A(this,a))},z.prototype._unreport=function(){this.handled||(this.handled=!0,V.afterQueue(new B(this)))},z.prototype.fail=function(a){this.reported=!0,W("unhandledRejection",this),b.onFatalRejection(this,void 0===a?this.context:a)},A.prototype.run=function(){this.rejection.handled||this.rejection.reported||(this.rejection.reported=!0,W("unhandledRejection",this.rejection)||b.onPotentiallyUnhandledRejection(this.rejection,this.context))},B.prototype.run=function(){this.rejection.reported&&(W("rejectionHandled",this.rejection)||b.onPotentiallyUnhandledRejectionHandled(this.rejection))},b.createContext=b.enterContext=b.exitContext=b.onPotentiallyUnhandledRejection=b.onPotentiallyUnhandledRejectionHandled=b.onFatalRejection=T;var $=new t,_=new b(t,$);return D.prototype.run=function(){this.handler.join().when(this.continuation)},E.prototype.run=function(){var a=this.handler.consumers;if(void 0!==a)for(var b,c=0;c<a.length;++c)b=a[c],M(b.progress,this.value,this.handler,b.receiver,b.resolver)},F.prototype.run=function(){function a(a){d.resolve(a)}function b(a){d.reject(a)}function c(a){d.notify(a)}var d=this.resolver;G(this._then,this.thenable,a,b,c)},H.prototype.fulfilled=function(a){this.f.call(this.c,this.z,a,this.to)},H.prototype.rejected=function(a){this.to.reject(a)},H.prototype.progress=function(a){this.to.notify(a)},b}})}("function"==typeof a&&a.amd?a:function(a){c.exports=a()})},{}]},{},[1])(1)}),function(a){function b(a,b){var c;if(a instanceof Error){var c=new a.constructor(a.message,a.fileName,a.lineNumber);c.message=a.message+"\n	"+b,c.stack=a.stack}else c=a+"\n	"+b;return c}function c(a,c,d){try{new Function(a).call(d)}catch(e){throw b(e,"Evaluating "+c)}}function d(){}function e(b){b=b||{},b.normalize&&(this.normalize=b.normalize),b.locate&&(this.locate=b.locate),b.fetch&&(this.fetch=b.fetch),b.translate&&(this.translate=b.translate),b.instantiate&&(this.instantiate=b.instantiate),this._loader={loaderObj:this,loads:[],modules:{},importPromises:{},moduleRecords:{}},k(this,"global",{get:function(){return a}}),this.transpiler&&f(this)}function f(b){a.traceur&&!b.has("traceur")&&b.set("traceur",b.newModule({"default":a.traceur,__useDefault:!0})),a.babel&&!b.has("babel")&&b.set("babel",b.newModule({"default":a.babel,__useDefault:!0}))}function g(b){e.call(this,b||{});var c;if(h)c=a.location.href;else if("undefined"!=typeof document){if(c=document.baseURI,!c){var d=document.getElementsByTagName("base");c=d[0]&&d[0].href||window.location.href}c=c.split("#")[0].split("?")[0],c=c.substr(0,c.lastIndexOf("/")+1)}else{if("undefined"==typeof process||!process.cwd)throw new TypeError("No environment baseURL");c="file://"+(j?"/":"")+process.cwd()+"/",j&&(c=c.replace(/\\/g,"/"))}this.baseURL=c,this.paths={}}var h="undefined"!=typeof self&&"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope,i="undefined"!=typeof window&&!h,j="undefined"!=typeof process&&!!process.platform.match(/^win/);a.console&&(console.assert=console.assert||function(){});var k,l=Array.prototype.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1};!function(){try{Object.defineProperty({},"a",{})&&(k=Object.defineProperty)}catch(a){k=function(a,b,c){try{a[b]=c.value||c.get.call(a)}catch(d){}}}}(),function(){function f(a){return{status:"loading",name:a,linkSets:[],dependencies:[],metadata:{}}}function g(a,b,c){return new Promise(o({step:c.address?"fetch":"locate",loader:a,moduleName:b,moduleMetadata:c&&c.metadata||{},moduleSource:c.source,moduleAddress:c.address}))}function h(a,b,c,d){return new Promise(function(e){e(a.loaderObj.normalize(b,c,d))}).then(function(b){var c;if(a.modules[b])return c=f(b),c.status="linked",c.module=a.modules[b],c;for(var d=0,e=a.loads.length;e>d;d++)if(c=a.loads[d],c.name==b)return c;return c=f(b),a.loads.push(c),i(a,c),c})}function i(a,b){j(a,b,Promise.resolve().then(function(){return a.loaderObj.locate({name:b.name,metadata:b.metadata})}))}function j(a,b,c){n(a,b,c.then(function(c){return"loading"==b.status?(b.address=c,a.loaderObj.fetch({name:b.name,metadata:b.metadata,address:c})):void 0}))}function n(b,d,e){e.then(function(e){return"loading"==d.status?Promise.resolve(b.loaderObj.translate({name:d.name,metadata:d.metadata,address:d.address,source:e})).then(function(a){return d.source=a,b.loaderObj.instantiate({name:d.name,metadata:d.metadata,address:d.address,source:a})}).then(function(e){if(void 0===e)return d.address=d.address||"<Anonymous Module "+ ++F+">",d.isDeclarative=!0,m.call(b.loaderObj,d).then(function(b){var e=a.System,f=e.register;e.register=function(a,b,c){"string"!=typeof a&&(c=b,b=a),d.declare=c,d.depsList=b},c(b,d.address,{}),e.register=f});if("object"!=typeof e)throw TypeError("Invalid instantiate return value");d.depsList=e.deps||[],d.execute=e.execute,d.isDeclarative=!1}).then(function(){d.dependencies=[];for(var a=d.depsList,c=[],e=0,f=a.length;f>e;e++)(function(a,e){c.push(h(b,a,d.name,d.address).then(function(b){if(d.dependencies[e]={key:a,value:b.name},"linked"!=b.status)for(var c=d.linkSets.concat([]),f=0,g=c.length;g>f;f++)q(c[f],b)}))})(a[e],e);return Promise.all(c)}).then(function(){d.status="loaded";for(var a=d.linkSets.concat([]),b=0,c=a.length;c>b;b++)s(a[b],d)}):void 0})["catch"](function(a){d.status="failed",d.exception=a;for(var b=d.linkSets.concat([]),c=0,e=b.length;e>c;c++)t(b[c],d,a)})}function o(a){return function(b){var c=a.loader,d=a.moduleName,e=a.step;if(c.modules[d])throw new TypeError('"'+d+'" already exists in the module table');for(var g,h=0,k=c.loads.length;k>h;h++)if(c.loads[h].name==d)return g=c.loads[h],"translate"!=e||g.source||(g.address=a.moduleAddress,n(c,g,Promise.resolve(a.moduleSource))),g.linkSets[0].done.then(function(){b(g)});var l=f(d);l.metadata=a.moduleMetadata;var m=p(c,l);c.loads.push(l),b(m.done),"locate"==e?i(c,l):"fetch"==e?j(c,l,Promise.resolve(a.moduleAddress)):(l.address=a.moduleAddress,n(c,l,Promise.resolve(a.moduleSource)))}}function p(a,b){var c={loader:a,loads:[],startingLoad:b,loadingCount:0};return c.done=new Promise(function(a,b){c.resolve=a,c.reject=b}),q(c,b),c}function q(a,b){for(var c=0,d=a.loads.length;d>c;c++)if(a.loads[c]==b)return;a.loads.push(b),b.linkSets.push(a),"loaded"!=b.status&&a.loadingCount++;for(var e=a.loader,c=0,d=b.dependencies.length;d>c;c++){var f=b.dependencies[c].value;if(!e.modules[f])for(var g=0,h=e.loads.length;h>g;g++)if(e.loads[g].name==f){q(a,e.loads[g]);break}}}function r(a){var b=!1;try{y(a,function(c,d){t(a,c,d),b=!0})}catch(c){t(a,null,c),b=!0}return b}function s(a,b){if(a.loadingCount--,!(a.loadingCount>0)){var c=a.startingLoad;if(a.loader.loaderObj.execute===!1){for(var d=[].concat(a.loads),e=0,f=d.length;f>e;e++){var b=d[e];b.module=b.isDeclarative?{name:b.name,module:G({}),evaluated:!0}:{module:G({})},b.status="linked",u(a.loader,b)}return a.resolve(c)}var g=r(a);g||a.resolve(c)}}function t(a,c,d){var e=a.loader;c?(c&&a.loads[0].name!=c.name&&(d=b(d,'Error loading "'+c.name+'" from "'+a.loads[0].name+'" at '+(a.loads[0].address||"<unknown>"))),c&&(d=b(d,'Error loading "'+c.name+'" at '+(c.address||"<unknown>")))):d=b(d,'Error linking "'+a.loads[0].name+'" at '+(a.loads[0].address||"<unknown>"));for(var f=a.loads.concat([]),g=0,h=f.length;h>g;g++){var c=f[g];e.loaderObj.failed=e.loaderObj.failed||[],-1==l.call(e.loaderObj.failed,c)&&e.loaderObj.failed.push(c);var i=l.call(c.linkSets,a);if(c.linkSets.splice(i,1),0==c.linkSets.length){var j=l.call(a.loader.loads,c);-1!=j&&a.loader.loads.splice(j,1)}}a.reject(d)}function u(a,b){if(a.loaderObj.trace){a.loaderObj.loads||(a.loaderObj.loads={});var c={};b.dependencies.forEach(function(a){c[a.key]=a.value}),a.loaderObj.loads[b.name]={name:b.name,deps:b.dependencies.map(function(a){return a.key}),depMap:c,address:b.address,metadata:b.metadata,source:b.source,kind:b.isDeclarative?"declarative":"dynamic"}}b.name&&(a.modules[b.name]=b.module);var d=l.call(a.loads,b);-1!=d&&a.loads.splice(d,1);for(var e=0,f=b.linkSets.length;f>e;e++)d=l.call(b.linkSets[e].loads,b),-1!=d&&b.linkSets[e].loads.splice(d,1);b.linkSets.splice(0,b.linkSets.length)}function v(a,b,c){try{var e=b.execute()}catch(f){return void c(b,f)}return e&&e instanceof d?e:void c(b,new TypeError("Execution must define a Module instance"))}function w(a,b,c){var d=a._loader.importPromises;return d[b]=c.then(function(a){return d[b]=void 0,a},function(a){throw d[b]=void 0,a})}function x(a,b,c){if(c[a.groupIndex]=c[a.groupIndex]||[],-1==l.call(c[a.groupIndex],a)){c[a.groupIndex].push(a);for(var d=0,e=b.length;e>d;d++)for(var f=b[d],g=0;g<a.dependencies.length;g++)if(f.name==a.dependencies[g].value){var h=a.groupIndex+(f.isDeclarative!=a.isDeclarative);if(void 0===f.groupIndex||f.groupIndex<h){if(void 0!==f.groupIndex&&(c[f.groupIndex].splice(l.call(c[f.groupIndex],f),1),0==c[f.groupIndex].length))throw new TypeError("Mixed dependency cycle detected");f.groupIndex=h}x(f,b,c)}}}function y(a,b){var c=a.loader;if(a.loads.length){var d=[],e=a.loads[0];e.groupIndex=0,x(e,a.loads,d);for(var f=e.isDeclarative==d.length%2,g=d.length-1;g>=0;g--){for(var h=d[g],i=0;i<h.length;i++){var j=h[i];if(f)A(j,a.loads,c);else{var k=v(a,j,b);if(!k)return;j.module={name:j.name,module:k},j.status="linked"}u(c,j)}f=!f}}}function z(a,b){var c=b.moduleRecords;return c[a]||(c[a]={name:a,dependencies:[],module:new d,importers:[]})}function A(b,c,d){if(!b.module){var e=b.module=z(b.name,d),f=b.module.module,g=b.declare.call(a,function(a,b){e.locked=!0,f[a]=b;for(var c=0,d=e.importers.length;d>c;c++){var g=e.importers[c];if(!g.locked){var h=l.call(g.dependencies,e);g.setters[h](f)}}return e.locked=!1,b});e.setters=g.setters,e.execute=g.execute;for(var h=0,i=b.dependencies.length;i>h;h++){var j=b.dependencies[h].value,k=d.modules[j];if(!k)for(var m=0;m<c.length;m++)c[m].name==j&&(c[m].module?k=z(j,d):(A(c[m],c,d),k=c[m].module));k.importers?(e.dependencies.push(k),k.importers.push(e)):e.dependencies.push(null),e.setters[h]&&e.setters[h](k.module)}b.status="linked"}}function B(b){try{b.execute.call(a)}catch(c){return c}}function C(a,b){return D(b.module,[],a),b.module.module}function D(a,b,c){var d=E(a,b,c);if(d)throw d}function E(a,c,d){if(!a.evaluated&&a.dependencies){c.push(a);for(var e,f=a.dependencies,g=0,h=f.length;h>g;g++){var i=f[g];if(i&&-1==l.call(c,i)&&(e=E(i,c,d)))return e=b(e,"Error evaluating "+i.name)}if(a.failed)return new Error("Module failed execution.");if(!a.evaluated)return a.evaluated=!0,e=B(a),e?a.failed=!0:Object.preventExtensions&&Object.preventExtensions(a.module),a.execute=void 0,e}}var F=0;e.prototype={constructor:e,define:function(a,b,c){if(this._loader.importPromises[a])throw new TypeError("Module is already loading.");return w(this,a,new Promise(o({step:"translate",loader:this._loader,moduleName:a,moduleMetadata:c&&c.metadata||{},moduleSource:b,moduleAddress:c&&c.address})))},"delete":function(a){var b=this._loader;return delete b.importPromises[a],delete b.moduleRecords[a],b.modules[a]?delete b.modules[a]:!1},get:function(a){return this._loader.modules[a]?(D(this._loader.modules[a],[],this),this._loader.modules[a].module):void 0},has:function(a){return!!this._loader.modules[a]},"import":function(a,b){var c=this;return Promise.resolve(c.normalize(a,b)).then(function(a){var b=c._loader;return b.modules[a]?(D(b.modules[a],[],b._loader),b.modules[a].module):b.importPromises[a]||w(c,a,g(b,a,{}).then(function(c){return delete b.importPromises[a],C(b,c)}))})},load:function(a){return this._loader.modules[a]?(D(this._loader.modules[a],[],this._loader),Promise.resolve(this._loader.modules[a].module)):this._loader.importPromises[a]||w(this,a,g(this._loader,a,{}))},module:function(a,b){var c=f();c.address=b&&b.address;var d=p(this._loader,c),e=Promise.resolve(a),g=this._loader,h=d.done.then(function(){return C(g,c)});return n(g,c,e),h},newModule:function(a){if("object"!=typeof a)throw new TypeError("Expected object");var b=new d;for(var c in a)!function(c){k(b,c,{configurable:!1,enumerable:!0,get:function(){return a[c]}})}(c);return Object.preventExtensions&&Object.preventExtensions(b),b},set:function(a,b){if(!(b instanceof d))throw new TypeError("Loader.set("+a+", module) must be a module");this._loader.modules[a]={module:b}},normalize:function(a){return a},locate:function(a){return a.name},fetch:function(){},translate:function(a){return a.source},instantiate:function(){}};var G=e.prototype.newModule}();var m=function(){function b(a){var b=this;return(b.pluginLoader||b)["import"](b.transpiler).then(function(c){return c.__useDefault&&(c=c["default"]),'var __moduleName = "'+a.name+'", __moduleAddress = "'+a.address+'";'+(c.Compiler?d:g).call(b,a,c)+"\n//# sourceURL="+a.address+"!eval"})}function d(a,b){var c=this.traceurOptions||{};c.modules="instantiate",c.script=!1,c.sourceMaps="inline",c.filename=a.address,c.inputSourceMap=a.metadata.sourceMap,c.moduleName=!1;var d=new b.Compiler(c);return f(a.source,d,c.filename)}function f(a,b,c){try{return b.compile(a,c)}catch(d){throw d[0]}}function g(a,b){var c=this.babelOptions||{};return c.modules="system",c.sourceMap="inline",c.filename=a.address,c.code=!0,c.ast=!1,b.transform(a.source,c).code}return e.prototype.transpiler="traceur",e.prototype.instantiate=function(b){var d=this;return Promise.resolve(d.normalize(d.transpiler)).then(function(e){return b.name===e?{deps:[],execute:function(){var e=a.System,f=a.Reflect.Loader;return c("(function(require,exports,module){"+b.source+"})();",b.address,a),a.System=e,a.Reflect.Loader=f,d.newModule({"default":a[b.name],__useDefault:!0})}}:void 0})},b}();"undefined"==typeof URL&&(URL=function(){function a(b,c){if("string"!=typeof b)throw new TypeError("URL must be a string");var d=String(b).replace(/^\s+|\s+$/g,"").match(/^([^:\/?#]+:)?(?:\/\/(?:([^:@\/?#]*)(?::([^:@\/?#]*))?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);if(!d)throw new RangeError;var e=d[1]||"",f=d[2]||"",g=d[3]||"",h=d[4]||"",i=d[5]||"",j=d[6]||"",k=d[7]||"",l=d[8]||"",m=d[9]||"";if(void 0!==c){var n=c instanceof a?c:new a(c),o=""===e&&""===h&&""===f;o&&""===k&&""===l&&(l=n.search),o&&"/"!==k.charAt(0)&&(k=""!==k?(""===n.host&&""===n.username||""!==n.pathname?"":"/")+n.pathname.slice(0,n.pathname.lastIndexOf("/")+1)+k:n.pathname);var p=[];k.replace(/^(\.\.?(\/|$))+/,"").replace(/\/(\.(\/|$))+/g,"/").replace(/\/\.\.$/,"/../").replace(/\/?[^\/]*/g,function(a){"/.."===a?p.pop():p.push(a)}),k=p.join("").replace(/^\//,"/"===k.charAt(0)?"/":""),o&&(j=n.port,i=n.hostname,h=n.host,g=n.password,f=n.username),""===e&&(e=n.protocol)}"file:"==e&&(k=k.replace(/\\/g,"/")),this.origin=e+(""!==e||""!==h?"//":"")+h,this.href=e+(""!==e||""!==h?"//":"")+(""!==f?f+(""!==g?":"+g:"")+"@":"")+h+k+l+m,this.protocol=e,this.username=f,this.password=g,this.host=h,this.hostname=i,this.port=j,this.pathname=k,this.search=l,this.hash=m}return a}());var n;!function(){function a(){}var b;if("undefined"!=typeof XMLHttpRequest)b=function(a,b,c){function d(){b(f.responseText)}function e(){c(f.statusText+": "+a||"XHR error")}var f=new XMLHttpRequest,g=!0,h=!1;if(!("withCredentials"in f)){var i=/^(\w+:)?\/\/([^\/]+)/.exec(a);i&&(g=i[2]===window.location.host,i[1]&&(g&=i[1]===window.location.protocol))}g||"undefined"==typeof XDomainRequest||(f=new XDomainRequest,f.onload=d,f.onerror=e,f.ontimeout=e,f.onprogress=function(){},f.timeout=0,h=!0),f.onreadystatechange=function(){4===f.readyState&&(200===f.status||0==f.status&&f.responseText?d():e())},f.open("GET",a,!0),h&&setTimeout(function(){f.send()},0),f.send(null)};else{if("undefined"==typeof require)throw new TypeError("No environment fetch API available.");var c;b=function(a,b,d){if("file:///"!=a.substr(0,8))throw"Only file URLs of the form file:/// allowed running in Node.";return c=c||require("fs"),a=j?a.replace(/\//g,"\\").substr(8):a.substr(7),c.readFile(a,function(a,c){return a?d(a):void b(c+"")})}}a.prototype=e.prototype,g.prototype=new a,g.prototype.normalize=function(a,b){if("string"!=typeof a)throw new TypeError("Module name must be a string");var c=a.split("/"),d=0,e=!1,f=0;if("."==c[0])d++,e=!0;else{for(;".."==c[d];)d++;d&&(e=!0),f=d}if(!e)return a;{var g=[],h=(b||"").split("/");h.length-1-f}return g=g.concat(h.splice(0,h.length-1-f)),g=g.concat(c.splice(d,c.length-d)),g.join("/")};var d={};g.prototype.locate=function(a){var b,c=a.name,e="",f=0;for(var g in this.paths){var h=g.split("*");if(h.length>2)throw new TypeError("Only one wildcard in a path is permitted");if(1==h.length){if(c==g){e=g;break}}else{var j=g.split("/").length;j>=f&&c.substr(0,h[0].length)==h[0]&&c.substr(c.length-h[1].length)==h[1]&&(f=j,e=g,b=c.substr(h[0].length,c.length-h[1].length-h[0].length))}}var k=this.paths[e]||c;return b&&(k=k.replace("*",b)),i&&(k=k.replace(/#/g,"%23")),new URL(k,d[this.baseURL]=d[this.baseURL]||new URL(this.baseURL)).href},g.prototype.fetch=function(a){return new Promise(function(c,d){b(a.address,c,d)})}}(),function(){function a(){document.removeEventListener("DOMContentLoaded",a,!1),window.removeEventListener("load",a,!1),b()}function b(){for(var a=document.getElementsByTagName("script"),b=0;b<a.length;b++){var c=a[b];if("module"==c.type){var d=c.innerHTML.substr(1);n.module(d)["catch"](function(a){setTimeout(function(){throw a})})}}}if(i&&"undefined"!=typeof document.getElementsByTagName){var c=document.getElementsByTagName("script");c=c[c.length-1],"complete"===document.readyState?setTimeout(b):document.addEventListener&&(document.addEventListener("DOMContentLoaded",a,!1),window.addEventListener("load",a,!1))}}(),"object"==typeof exports&&(module.exports=e),a.Reflect=a.Reflect||{},a.Reflect.Loader=a.Reflect.Loader||e,a.Reflect.global=a.Reflect.global||a,a.LoaderPolyfill=e,n||(n=new g,n.constructor=g),"object"==typeof exports&&(module.exports=n),a.System=n}("undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope?self:global);
//# sourceMappingURL=es6-module-loader-dev.js.map