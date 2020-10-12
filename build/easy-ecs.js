function t(){return([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(function(t){return(t^crypto.getRandomValues(new Uint8Array(1))[0]&15>>t/4).toString(16)}))}function n(t){return function(t){if(Array.isArray(t))return e(t)}(t)||function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(t)||function(t,n){if(!t)return;if("string"==typeof t)return e(t,n);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return e(t,n)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function e(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}function r(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}function o(t,n){for(var e=0;e<n.length;e++){var r=n[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function i(t,n,e){return n&&o(t.prototype,n),e&&o(t,e),t}function u(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}var a=function(){function t(){r(this,t)}return i(t,null,[{key:"name",get:function(){return this.constructor.name}}]),t}();exports.Addon=a,u(a,"onInit",(function(t){})),u(a,"onStart",(function(t){})),u(a,"onBeforeUpdate",(function(t,n){})),u(a,"onAfterUpdate",(function(t,n){}));var c=function(){function t(){var e=this,o=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{addons:[],systems:[]};r(this,t),u(this,"addons",[]),u(this,"systems",[]),u(this,"systemsList",[]),u(this,"entities",[]),this.addons=o.addons,o.systems.forEach((function(t){e.systems=[].concat(n(e.systems),[new t])})),this.init()}return i(t,[{key:"addEntity",value:function(t){this.entities.push(t)}},{key:"start",value:function(){var t=this;this.addons.forEach((function(n){return n.onStart(t)}))}},{key:"init",value:function(){var t=this;this.addons.forEach((function(n){return n.onInit(t)})),this.systems.forEach((function(n){var e=t.entities.filter((function(t){return n.dependencies.every((function(n){return t.components.indexOf(n.name)>=0}))}));n.onInit(e)}))}},{key:"update",value:function(t){var n=this;this.addons.forEach((function(e){return e.onBeforeUpdate(n,t)})),this.systems.forEach((function(t){var e=n.entities.filter((function(n){return t.dependencies.every((function(t){return n.components.indexOf(t.name)>=0}))}));t.onUpdate(e)})),this.addons.forEach((function(e){return e.onAfterUpdate(n,t)}))}}]),t}();exports.World=c;var s=function(){function n(e,o){var i=this;r(this,n),u(this,"id",t()),u(this,"components",[]),this.constructor.components.forEach((function(t){i.addComponent(t,o)})),e.addEntity(this)}return i(n,[{key:"addComponent",value:function(t,n){var e=this;this.components.push(t.name),t.props.forEach((function(r){e[r]=n[r]?n[r]:t[r]}))}},{key:"serialize",value:function(){return JSON.stringify(this)}},{key:"unserialize",value:function(t){var n=this,e=JSON.parse(t);Object.keys(e).forEach((function(t){n[t]=e[t]}))}},{key:"destroy",value:function(){}}]),n}();exports.Entity=s,u(s,"components",[]);var f=function(){function t(){r(this,t)}return i(t,null,[{key:"props",get:function(){return Object.keys(this)}},{key:"name",get:function(){return this.constructor.name}}]),t}();exports.Component=f;var l=function(){function t(){r(this,t),u(this,"dependencies",[]),u(this,"onInit",(function(t){})),u(this,"onUpdate",(function(t){}))}return i(t,[{key:"name",get:function(){return this.constructor.name}}]),t}();function d(t){return function(t){if(Array.isArray(t))return p(t)}(t)||function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(t)||function(t,n){if(!t)return;if("string"==typeof t)return p(t,n);var e=Object.prototype.toString.call(t).slice(8,-1);"Object"===e&&t.constructor&&(e=t.constructor.name);if("Map"===e||"Set"===e)return Array.from(t);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return p(t,n)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function p(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}function y(t){return(y="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function h(t,n){for(var e=0;e<n.length;e++){var r=n[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function m(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}function v(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(n&&n.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),n&&b(t,n)}function b(t,n){return(b=Object.setPrototypeOf||function(t,n){return t.__proto__=n,t})(t,n)}function w(t){var n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var e,r=k(t);if(n){var o=k(this).constructor;e=Reflect.construct(r,arguments,o)}else e=r.apply(this,arguments);return g(this,e)}}function g(t,n){return!n||"object"!==y(n)&&"function"!=typeof n?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):n}function k(t){return(k=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function O(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}exports.System=l;var S=function(t){v(e,a);var n=w(e);function e(){return m(this,e),n.apply(this,arguments)}return e}();exports.Time=S,O(S,"time",0),O(S,"delta",0),O(S,"elapsed",0),O(S,"onBeforeUpdate",(function(t,n){S.delta=n-S.time,S.time=n,S.elapsed+=S.delta}));var x=function(t){v(i,a);var n,e,r,o=w(i);function i(){return m(this,i),o.apply(this,arguments)}return n=i,r=[{key:"isRunning",get:function(){return null!==i.raf}}],(e=null)&&h(n.prototype,e),r&&h(n,r),i}();exports.Loop=x,O(x,"raf",null),O(x,"onStart",(function(t){x.raf=requestAnimationFrame(t.update.bind(t))})),O(x,"onBeforeUpdate",(function(t){x.raf=requestAnimationFrame(t.update.bind(t))})),O(x,"stop",(function(){cancelAnimationFrame(x.raf),x.raf=null}));var E=function(t){v(e,a);var n=w(e);function e(){return m(this,e),n.apply(this,arguments)}return e}();exports.Input=E,O(E,"keypress",null),O(E,"keydown",[]),O(E,"mouse",{x:0,y:0}),O(E,"INPUT_LEFT",37),O(E,"INPUT_RIGHT",39),O(E,"INPUT_UP",38),O(E,"INPUT_DOWN",40),O(E,"onInit",(function(t){document.addEventListener("keydown",(function(t){-1===E.keydown.indexOf(t.keyCode)&&(E.keydown=[].concat(d(E.keydown),[t.keyCode]))})),document.addEventListener("keyup",(function(t){E.keydown.splice(E.keydown.indexOf(t.keyCode),1)})),document.addEventListener("mousemove",(function(t){E.mouse={x:t.clientX,y:t.clientY}}))})),O(E,"onBeforeUpdate",(function(t){E.keypress=E.keydown})),O(E,"onAfterUpdate",(function(t){E.keypress=null})),O(E,"isPressed",(function(t){return-1!==E.keypress.indexOf(t)}));var A=function(t){v(e,a);var n=w(e);function e(){return m(this,e),n.apply(this,arguments)}return e}();exports.Renderer=A,O(A,"canvas",null),O(A,"ctx",null),O(A,"width",0),O(A,"height",0),O(A,"onInit",(function(t){A.canvas=document.getElementById("game"),A.ctx=A.canvas.getContext("2d"),A.width=512,A.height=512,A.canvas.width=A.width*window.devicePixelRatio,A.canvas.height=A.height*window.devicePixelRatio,A.canvas.style.width=A.width,A.canvas.style.height=A.height})),O(A,"onBeforeUpdate",(function(t){A.ctx.clearRect(0,0,A.canvas.width,A.canvas.height)}));var I=function(t){v(e,a);var n=w(e);function e(){return m(this,e),n.apply(this,arguments)}return e}();exports.SaveGame=I,O(I,"world",null),O(I,"onInit",(function(t){I.world=t})),O(I,"save",(function(){var n={id:t(),timestamp:Date.now(),entities:I.world.entities.map((function(t){return t.serialize()}))};return localStorage.setItem("save".concat(n.id),JSON.stringify(n)),n.id})),O(I,"restore",(function(t){var n=localStorage.getItem("save".concat(t)),e=JSON.parse(n);I.world.entities=[],e.entities.forEach((function(t){new s(I.world).unserialize(t)}))}));
//# sourceMappingURL=easy-ecs.js.map
