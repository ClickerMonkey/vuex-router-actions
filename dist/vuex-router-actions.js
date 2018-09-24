!function(n,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("VuexRouterActions",[],t):"object"==typeof exports?exports.VuexRouterActions=t():n.VuexRouterActions=t()}(window,function(){return function(n){var t={};function o(e){if(t[e])return t[e].exports;var i=t[e]={i:e,l:!1,exports:{}};return n[e].call(i.exports,i,i.exports,o),i.l=!0,i.exports}return o.m=n,o.c=t,o.d=function(n,t,e){o.o(n,t)||Object.defineProperty(n,t,{enumerable:!0,get:e})},o.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},o.t=function(n,t){if(1&t&&(n=o(n)),8&t)return n;if(4&t&&"object"==typeof n&&n&&n.__esModule)return n;var e=Object.create(null);if(o.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var i in n)o.d(e,i,function(t){return n[t]}.bind(null,i));return e},o.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return o.d(t,"a",t),t},o.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},o.p="",o(o.s=0)}([function(n,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var e,i,r="VuexRouterActions must be passed as a plugin to one store",c="Cached action isInvalid must be a function.",u="Cached action getKey must be a function.",f="Cached action getResultKey must be a function.",a="An action passed is not a valid Vuex action.",s=function(n,t,o){return!1},l=y(),d=0,v=0,p=[];function y(){return{onActionStart:function(){},onActionReject:function(){},onActionResolve:function(){},onActionEnd:function(){},onActionsDone:function(){},createCacheKey:function(n){return JSON.stringify(n)}}}function h(){p.forEach(function(n){return n()}),p=[]}function A(n){var t=n.action,o=n.isInvalid,e=n.onFree;S("function"==typeof o,c);var r=void 0,u=function(){void 0!==r&&e&&e.call(i,r),r=void 0};return p.push(u),g(t,"",function(n){return function(t,e){return(void 0===r||o.call(this,t,e))&&(u(),r=n.apply(this,arguments)),r}})}function b(n,t){var o=R({},l,t),e=n.action,r=n.getKey,c=n.onFree;S("function"==typeof r,u);var f=void 0,a=void 0,s=function(){void 0!==a&&c&&c.call(i,a),f=void 0,a=void 0};return p.push(s),g(e,"",function(n){return function(t,e){var i=o.createCacheKey(r.call(this,t,e));return void 0!==f&&i===f||(s(),f=i,a=n.apply(this,arguments)),a}})}function m(n,t){var o=R({},l,t),e=n.action,r=n.getKey,c=n.getResultKey,u=n.onFree;S("function"==typeof c,f);var a=void 0,s=Object.create(null),d=function(){if(u)for(var n in s)u.call(i,s[n]);a=void 0,s=Object.create(null)};return p.push(d),g(e,"",function(n){return function(t,e){var i=r?o.createCacheKey(r.call(this,t,e)):void 0;i!==a&&(d(),a=i,s=Object.create(null));var u=o.createCacheKey(c.call(this,t,e));return u in s||(s[u]=n.apply(this,arguments)),s[u]}})}function j(n,t,o){return o?(n.onActionStart=o.onActionStart||t.onActionStart,n.onActionReject=o.onActionReject||t.onActionReject,n.onActionResolve=o.onActionResolve||t.onActionResolve,n.onActionEnd=o.onActionEnd||t.onActionEnd,n.onActionsDone=o.onActionsDone||t.onActionsDone,n):t}function R(n,t,o){return o?(n.createCacheKey=o.createCacheKey||t.createCacheKey,n):t}function C(n,t){return K(n,function(n,o){return g(n,o,t)})}function g(n,t,o){if(x(n))return o(n,t);if(P(n))return{root:n.root,handler:o(n.handler,t)};throw a}function O(n,t,o){if("string"==typeof n)return n;if("function"==typeof n)return n(t,o,i);throw"Invalid action name or function."}function x(n){return"function"==typeof n}function P(n){return"object"==typeof n&&"function"==typeof n.handler}function K(n,t){var o=Object.create(null);for(var e in n)o[e]=t(n[e],e);return o}function S(n,t){if(!n)throw t}t.default=function(n){return j(l,l,n),R(l,l,n),function(n){S(void 0===i,r),i=n}},t.actionsDestroy=function(){i=e,l=y(),d=0,v=0,h()},t.actionsDefaultOptions=y,t.actionsDestroyCache=h,t.actionBeforeRoute=function(n,t){void 0===t&&(t=s);var o=function(o,e,c){S(void 0!==i,r);var u=O(n,o,e);i.dispatch(u,{to:o,from:e}).then(function(n){c()},function(n){c(t(o,e,n,i,u))})};return{beforeRouteEnter:o,beforeRouteUpdate:o}},t.actionBeforeLeave=function(n,t){return void 0===t&&(t=!1),{beforeRouteLeave:function(o,e,c){S(void 0!==i,r);var u=O(n,o,e),f=function(){return t?c():void 0};i.dispatch(u,{to:o,from:e}).then(f,f),t||c()}}},t.actionOptional=function(n,t){return void 0===t&&(t=function(){return null}),new Promise(function(o,e){n.then(o,function(n){return o(t())})})},t.actionsCachedConditional=function(n){return K(n,function(n){return A(n)})},t.actionCachedConditional=A,t.actionsCached=function(n,t){var o=R({},l,t);return K(n,function(n){return b(n,o)})},t.actionCached=b,t.actionsCachedResults=function(n,t){var o=R({},l,t);return K(n,function(n){return m(n,o)})},t.actionCachedResults=m,t.actionsWatch=function(n,t){var o=j({},l,t),e=t&&t.onActionsDone,i=0,r=0,c=function(n,t){(e?++i:++v)===n&&o.onActionsDone(t)};return C(n,function(n,t){return function(i,u){var f=n.apply(this,arguments),a=e?++r:++d;return f instanceof Promise?(o.onActionStart(t,a,i,u),f.then(function(n){o.onActionResolve(t,a,i,u,n),o.onActionEnd(t,a,i,u,n,!0),c(a,i)},function(n){o.onActionReject(t,a,i,u,n),o.onActionEnd(t,a,i,u,n,!1),c(a,i)})):(o.onActionStart(t,a,i,u),o.onActionEnd(t,a,i,u,f,!0),c(a,i)),f}})},t.actionsProtect=function(n){return C(n,function(n){return function(t,o){return function(n){return n instanceof Promise?n:n?Promise.resolve(n):Promise.reject(n)}(n.apply(this,arguments))}})},t.actionsLoading=function(n,t){var o=0,e=!1,c=function(t){var c=o>0;c!==e&&(S(void 0!==i,r),e=c,function(n){return"string"==typeof n}(n)?i.commit(n,e):function(n){return"function"==typeof n}(n)&&n(t,e))};return C(t,function(n){return function(t,e){var i=n.apply(this,arguments);if(i instanceof Promise){var r=function(n){return function(){o--,c(n)}}(t);o++,i.then(r,r),c(t)}return i}})}}])});