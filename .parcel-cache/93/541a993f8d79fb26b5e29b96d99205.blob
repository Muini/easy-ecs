// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function(modules, cache, entry, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject.parcelRequire === 'function' &&
    globalObject.parcelRequire;
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function(id, exports) {
    modules[id] = [
      function(require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  globalObject.parcelRequire = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"e448859bf7adc7d0af8ae08a380e0983":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = 1234;
var HMR_ENV_HASH = "d751713988987e9331980363e24189ce";
module.bundle.HMR_BUNDLE_ID = "3a669dfb7e1a0d2c77d4b8533915802e";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH */

var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept, acceptedAssets; // eslint-disable-next-line no-redeclare

var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
  var port = HMR_PORT || location.port;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    acceptedAssets = {};
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      // Remove error overlay if there is one
      removeErrorOverlay();
      let assets = data.assets.filter(asset => asset.envHash === HMR_ENV_HASH); // Handle HMR Update

      var handled = false;
      assets.forEach(asset => {
        var didAccept = asset.type === 'css' || hmrAcceptCheck(global.parcelRequire, asset.id);

        if (didAccept) {
          handled = true;
        }
      });

      if (handled) {
        console.clear();
        assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });

        for (var i = 0; i < assetsToAccept.length; i++) {
          var id = assetsToAccept[i][1];

          if (!acceptedAssets[id]) {
            hmrAcceptRun(assetsToAccept[i][0], id);
          }
        }
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'error') {
      // Log parcel errors to console
      for (let ansiDiagnostic of data.diagnostics.ansi) {
        let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
        console.error('🚨 [parcel]: ' + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
      } // Render the fancy html overlay


      removeErrorOverlay();
      var overlay = createErrorOverlay(data.diagnostics.html);
      document.body.appendChild(overlay);
    }
  };

  ws.onerror = function (e) {
    console.error(e.message);
  };

  ws.onclose = function (e) {
    console.warn('[parcel] 🚨 Connection to the HMR server was lost');
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
    console.log('[parcel] ✨ Error resolved');
  }
}

function createErrorOverlay(diagnostics) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';

  for (let diagnostic of diagnostics) {
    let stack = diagnostic.codeframe ? diagnostic.codeframe : diagnostic.stack;
    errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>
          ${stack}
        </pre>
        <div>
          ${diagnostic.hints.map(hint => '<div>' + hint + '</div>').join('')}
        </div>
      </div>
    `;
  }

  errorHTML += '</div>';
  overlay.innerHTML = errorHTML;
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push([bundle, k]);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    if (link.parentNode !== null) {
      link.parentNode.removeChild(link);
    }
  };

  newLink.setAttribute('href', link.getAttribute('href').split('?')[0] + '?' + Date.now());
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      var absolute = /^https?:\/\//i.test(links[i].getAttribute('href'));

      if (!absolute) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    if (asset.type === 'css') {
      reloadCSS();
    } else {
      var fn = new Function('require', 'module', 'exports', asset.output);
      modules[asset.id] = [fn, asset.depsByBundle[bundle.HMR_BUNDLE_ID]];
    }
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (v) {
    return hmrAcceptCheck(v[0], v[1]);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached && cached.hot) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      var assetsToAlsoAccept = cb(function () {
        return getParents(global.parcelRequire, id);
      });

      if (assetsToAlsoAccept && assetsToAccept.length) {
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
      }
    });
  }

  acceptedAssets[id] = true;
}
},{}],"8e04587db259c14f56856faad630f8b7":[function(require,module,exports) {
"use strict";

var _ecs = require("../core/ecs");

var _addons = require("../core/addons");

var _game = require("./game");

const world = new _ecs.World({
  addons: [_addons.Loop, _addons.Time, _addons.Input, _addons.Renderer, _addons.SaveGame],
  systems: [_game.PlayerMovement, _game.NPCMovement, _game.CharacterRenderer]
});
const player = new _game.Player(world, {
  x: _addons.Renderer.canvas.width / 2 << 0,
  y: _addons.Renderer.canvas.height / 2 << 0,
  health: 100,
  speed: 0.2,
  size: 10
});

for (let i = 0; i < 4; i++) {
  new _game.Soldier(world, {
    color: `rgba(200, 50, 50, 1.0)`,
    x: Math.random() * _addons.Renderer.canvas.width << 0,
    y: Math.random() * _addons.Renderer.canvas.height << 0,
    health: 100,
    speed: Math.random() * 0.1,
    size: 8
  });
}

world.start();
setTimeout(_ => {
  const id = _addons.SaveGame.save();

  setTimeout(_ => {
    _addons.SaveGame.restore(id);
  }, 2000);
}, 300);
},{"../core/ecs":"8a1d1c9cdbc85affbed1550e03245838","../core/addons":"dba21f87c252cd8c1b57bab0f8b96806","./game":"3a615ed6f65f84f73c82d111c449bb14"}],"8a1d1c9cdbc85affbed1550e03245838":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.System = exports.Component = exports.Entity = exports.World = exports.Addon = void 0;

var _utils = require("./utils");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Addon {
  static get name() {
    return this.constructor.name;
  }

}

exports.Addon = Addon;

_defineProperty(Addon, "onInit", world => {});

_defineProperty(Addon, "onStart", world => {});

_defineProperty(Addon, "onBeforeUpdate", (world, time) => {});

_defineProperty(Addon, "onAfterUpdate", (world, time) => {});

class World {
  constructor(props = {
    addons: [],
    systems: []
  }) {
    _defineProperty(this, "addons", []);

    _defineProperty(this, "systems", []);

    _defineProperty(this, "systemsList", []);

    _defineProperty(this, "entities", []);

    this.addons = props.addons;
    props.systems.forEach(system => {
      this.systems = [...this.systems, new system()];
    });
    this.init();
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  start() {
    this.addons.forEach(addon => addon.onStart(this));
  }

  init() {
    // const now = performance.now()
    this.addons.forEach(addon => addon.onInit(this));
    this.systems.forEach(system => {
      const entities = this.entities.filter(entity => system.dependencies.every(dependency => entity.components.indexOf(dependency.name) >= 0));
      system.onInit(entities);
    }); // console.log('init took', performance.now() - now, 'ms\n')
  }

  update(time) {
    // const now = performance.now()
    this.addons.forEach(addon => addon.onBeforeUpdate(this, time));
    this.systems.forEach(system => {
      const entities = this.entities.filter(entity => system.dependencies.every(dependency => entity.components.indexOf(dependency.name) >= 0));
      system.onUpdate(entities);
    });
    this.addons.forEach(addon => addon.onAfterUpdate(this, time)); // console.log('update took', performance.now() - now, 'ms\n')
  }

}

exports.World = World;

class Entity {
  constructor(world, values) {
    _defineProperty(this, "id", (0, _utils.UUID)());

    _defineProperty(this, "components", []);

    this.constructor.components.forEach(component => {
      this.addComponent(component, values);
    });
    world.addEntity(this);
  }

  addComponent(component, values) {
    this.components.push(component.name);
    component.props.forEach(prop => {
      this[prop] = values[prop] ? values[prop] : component[prop];
    });
  }

  serialize() {
    return JSON.stringify(this);
  }

  unserialize(json) {
    const props = JSON.parse(json);
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop];
    });
  }

  destroy() {}

}

exports.Entity = Entity;

_defineProperty(Entity, "components", []);

class Component {
  static get props() {
    return Object.keys(this);
  }

  static get name() {
    return this.constructor.name;
  }

}

exports.Component = Component;

class System {
  constructor() {
    _defineProperty(this, "dependencies", []);

    _defineProperty(this, "onInit", entities => {});

    _defineProperty(this, "onUpdate", entities => {});
  }

  get name() {
    return this.constructor.name;
  }

}

exports.System = System;
},{"./utils":"b4481cbe9c64107962c5f69654f3217d"}],"b4481cbe9c64107962c5f69654f3217d":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = UUID;

function UUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}
},{}],"dba21f87c252cd8c1b57bab0f8b96806":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SaveGame = exports.Renderer = exports.Input = exports.Loop = exports.Time = void 0;

var _utils = require("./utils");

var _ecs = require("./ecs");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Time extends _ecs.Addon {}

exports.Time = Time;

_defineProperty(Time, "time", 0);

_defineProperty(Time, "delta", 0);

_defineProperty(Time, "elapsed", 0);

_defineProperty(Time, "onBeforeUpdate", (world, time) => {
  Time.delta = time - Time.time;
  Time.time = time;
  Time.elapsed += Time.delta;
});

class Loop extends _ecs.Addon {
  static get isRunning() {
    return Loop.raf !== null;
  }

}

exports.Loop = Loop;

_defineProperty(Loop, "raf", null);

_defineProperty(Loop, "onStart", world => {
  Loop.raf = requestAnimationFrame(world.update.bind(world));
});

_defineProperty(Loop, "onBeforeUpdate", world => {
  Loop.raf = requestAnimationFrame(world.update.bind(world));
});

_defineProperty(Loop, "stop", () => {
  cancelAnimationFrame(Loop.raf);
  Loop.raf = null;
});

class Input extends _ecs.Addon {}

exports.Input = Input;

_defineProperty(Input, "keypress", null);

_defineProperty(Input, "keydown", []);

_defineProperty(Input, "mouse", {
  x: 0,
  y: 0
});

_defineProperty(Input, "INPUT_LEFT", 37);

_defineProperty(Input, "INPUT_RIGHT", 39);

_defineProperty(Input, "INPUT_UP", 38);

_defineProperty(Input, "INPUT_DOWN", 40);

_defineProperty(Input, "onInit", world => {
  document.addEventListener('keydown', evt => {
    if (Input.keydown.indexOf(evt.keyCode) !== -1) return;
    Input.keydown = [...Input.keydown, evt.keyCode];
  });
  document.addEventListener('keyup', evt => {
    Input.keydown.splice(Input.keydown.indexOf(evt.keyCode), 1);
  });
  document.addEventListener('mousemove', evt => {
    Input.mouse = {
      x: evt.clientX,
      y: evt.clientY
    };
  });
});

_defineProperty(Input, "onBeforeUpdate", world => {
  Input.keypress = Input.keydown;
});

_defineProperty(Input, "onAfterUpdate", world => {
  Input.keypress = null;
});

_defineProperty(Input, "isPressed", key => {
  return Input.keypress.indexOf(key) !== -1;
});

class Renderer extends _ecs.Addon {}

exports.Renderer = Renderer;

_defineProperty(Renderer, "canvas", null);

_defineProperty(Renderer, "ctx", null);

_defineProperty(Renderer, "width", 0);

_defineProperty(Renderer, "height", 0);

_defineProperty(Renderer, "onInit", world => {
  Renderer.canvas = document.getElementById('game');
  Renderer.ctx = Renderer.canvas.getContext('2d');
  Renderer.width = 512;
  Renderer.height = 512;
  Renderer.canvas.width = Renderer.width * window.devicePixelRatio;
  Renderer.canvas.height = Renderer.height * window.devicePixelRatio;
  Renderer.canvas.style['width'] = Renderer.width;
  Renderer.canvas.style['height'] = Renderer.height;
});

_defineProperty(Renderer, "onBeforeUpdate", world => {
  Renderer.ctx.clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height);
});

class SaveGame extends _ecs.Addon {}

exports.SaveGame = SaveGame;

_defineProperty(SaveGame, "world", null);

_defineProperty(SaveGame, "onInit", world => {
  SaveGame.world = world;
});

_defineProperty(SaveGame, "save", () => {
  const saveFile = {
    id: (0, _utils.UUID)(),
    timestamp: Date.now(),
    entities: SaveGame.world.entities.map(entity => entity.serialize())
  };
  localStorage.setItem(`save${saveFile.id}`, JSON.stringify(saveFile));
  return saveFile.id;
});

_defineProperty(SaveGame, "restore", id => {
  const saveFile = localStorage.getItem(`save${id}`);
  const saveData = JSON.parse(saveFile);
  SaveGame.world.entities = [];
  saveData.entities.forEach(entityData => {
    new _ecs.Entity(SaveGame.world).unserialize(entityData);
  });
});
},{"./ecs":"8a1d1c9cdbc85affbed1550e03245838","./utils":"b4481cbe9c64107962c5f69654f3217d"}],"3a615ed6f65f84f73c82d111c449bb14":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CharacterRenderer = exports.PlayerMovement = exports.NPCMovement = exports.Soldier = exports.Player = exports.Character = exports.NPC = exports.Controllable = exports.Renderable = exports.Health = exports.Movable = exports.Position = void 0;

var _ecs = require("../core/ecs");

var _addons = require("../core/addons");

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Position extends _ecs.Component {}

exports.Position = Position;

_defineProperty(Position, "x", 0);

_defineProperty(Position, "y", 0);

_defineProperty(Position, "rotation", 0);

class Movable extends _ecs.Component {}

exports.Movable = Movable;

_defineProperty(Movable, "speed", 0);

class Health extends _ecs.Component {}

exports.Health = Health;

_defineProperty(Health, "health", 0);

_defineProperty(Health, "maxHealth", 100);

class Renderable extends _ecs.Component {}

exports.Renderable = Renderable;

_defineProperty(Renderable, "color", `rgba(255, 255, 255, 1.0)`);

_defineProperty(Renderable, "size", 8);

class Controllable extends _ecs.Component {}

exports.Controllable = Controllable;

class NPC extends _ecs.Component {}

exports.NPC = NPC;

class Character extends _ecs.Entity {}

exports.Character = Character;

_defineProperty(Character, "components", [Position, Movable, Health, Renderable]);

class Player extends Character {}

exports.Player = Player;

_defineProperty(Player, "components", [..._get(_getPrototypeOf(Player), "components", Player), Controllable]);

class Soldier extends Character {}

exports.Soldier = Soldier;

_defineProperty(Soldier, "components", [..._get(_getPrototypeOf(Soldier), "components", Soldier), NPC]);

class NPCMovement extends _ecs.System {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "dependencies", [Position, Movable, NPC]);

    _defineProperty(this, "onUpdate", entities => {
      entities.forEach(entity => {
        entity.x += entity.speed * _addons.Time.delta;
      });
    });
  }

}

exports.NPCMovement = NPCMovement;

class PlayerMovement extends _ecs.System {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "dependencies", [Controllable, Movable]);

    _defineProperty(this, "onUpdate", entities => {
      entities.forEach(entity => {
        const amount = entity.speed * _addons.Time.delta;

        _addons.Input.keypress.forEach(key => {
          switch (key) {
            case _addons.Input.INPUT_LEFT:
              entity.x -= amount;
              entity.rotation = Math.PI;
              break;

            case _addons.Input.INPUT_RIGHT:
              entity.x += amount;
              entity.rotation = 0;
              break;

            case _addons.Input.INPUT_UP:
              entity.y -= amount;
              entity.rotation = -Math.PI / 2;
              break;

            case _addons.Input.INPUT_DOWN:
              entity.y += amount;
              entity.rotation = Math.PI / 2;
              break;
          }
        });
      });
    });
  }

}

exports.PlayerMovement = PlayerMovement;

class CharacterRenderer extends _ecs.System {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "dependencies", [Renderable]);

    _defineProperty(this, "onUpdate", entities => {
      entities.forEach(entity => {
        _addons.Renderer.ctx.translate(entity.x, entity.y);

        _addons.Renderer.ctx.rotate(entity.rotation);

        _addons.Renderer.ctx.fillStyle = entity.color;

        _addons.Renderer.ctx.beginPath();

        _addons.Renderer.ctx.moveTo(entity.size, 0);

        _addons.Renderer.ctx.lineTo(-entity.size, -entity.size / 1.5);

        _addons.Renderer.ctx.lineTo(-entity.size, entity.size / 1.5);

        _addons.Renderer.ctx.fill();

        _addons.Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
      });
    });
  }

}

exports.CharacterRenderer = CharacterRenderer;
},{"../core/ecs":"8a1d1c9cdbc85affbed1550e03245838","../core/addons":"dba21f87c252cd8c1b57bab0f8b96806"}]},{},["e448859bf7adc7d0af8ae08a380e0983","8e04587db259c14f56856faad630f8b7"], null)

//# sourceMappingURL=index.js.map
