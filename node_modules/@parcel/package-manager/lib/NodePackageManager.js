"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodePackageManager = void 0;

var _utils = require("@parcel/utils");

var _core = require("@parcel/core");

var _diagnostic = _interopRequireWildcard(require("@parcel/diagnostic"));

var _fs = _interopRequireDefault(require("fs"));

var _module = _interopRequireDefault(require("module"));

var _path = _interopRequireDefault(require("path"));

var _semver = _interopRequireDefault(require("semver"));

var _utils2 = require("./utils");

var _installPackage = require("./installPackage");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// This implements a package manager for Node by monkey patching the Node require
// algorithm so that it uses the specified FileSystem instead of the native one.
// It also handles installing packages when they are required if not already installed.
// See https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js
// for reference to Node internals.
class NodePackageManager {
  constructor(fs, installer) {
    _defineProperty(this, "fs", void 0);

    _defineProperty(this, "installer", void 0);

    _defineProperty(this, "cache", new Map());

    this.fs = fs;
    this.installer = installer;
  }

  static deserialize(opts) {
    return new NodePackageManager(opts.fs, opts.installer);
  }

  serialize() {
    return {
      $$raw: false,
      fs: this.fs,
      installer: this.installer
    };
  }

  async require(name, from, opts) {
    let {
      resolved
    } = await this.resolve(name, from, opts);
    return this.load(resolved, from);
  }

  requireSync(name, from) {
    let {
      resolved
    } = this.resolveSync(name, from);
    return this.load(resolved, from);
  }

  load(resolved, from) {
    if (!_path.default.isAbsolute(resolved)) {
      // Node builtin module
      // $FlowFixMe
      return require(resolved);
    }

    let filePath = this.fs.realpathSync(resolved);
    const cachedModule = _module.default._cache[filePath];

    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }

    let m = new _module.default(filePath, _module.default._cache[from] || module.parent);
    _module.default._cache[filePath] = m; // Patch require within this module so it goes through our require

    m.require = id => {
      return this.requireSync(id, filePath);
    }; // Patch `fs.readFileSync` temporarily so that it goes through our file system


    let readFileSync = _fs.default.readFileSync; // $FlowFixMe

    _fs.default.readFileSync = (filename, encoding) => {
      // $FlowFixMe
      _fs.default.readFileSync = readFileSync;
      return this.fs.readFileSync(filename, encoding);
    };

    try {
      m.load(filePath);
    } catch (err) {
      delete _module.default._cache[filePath];
      throw err;
    }

    return m.exports;
  }

  async resolve(name, from, options) {
    let basedir = _path.default.dirname(from);

    let key = basedir + ':' + name;
    let resolved = this.cache.get(key);

    if (!resolved) {
      try {
        resolved = await (0, _utils.resolve)(this.fs, name, {
          basedir,
          extensions: Object.keys(_module.default._extensions)
        });
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND' || (options === null || options === void 0 ? void 0 : options.autoinstall) === false) {
          throw e;
        }

        let conflicts = await (0, _utils2.getConflictingLocalDependencies)(this.fs, name, from);

        if (conflicts == null) {
          var _options$saveDev;

          await this.install([{
            name,
            range: options === null || options === void 0 ? void 0 : options.range
          }], from, {
            saveDev: (_options$saveDev = options === null || options === void 0 ? void 0 : options.saveDev) !== null && _options$saveDev !== void 0 ? _options$saveDev : true
          });
          return this.resolve(name, from, { ...options,
            autoinstall: false
          });
        }

        throw new _diagnostic.default({
          diagnostic: conflicts.fields.map(field => ({
            message: `Could not find module "${name}", but it was listed in package.json. Run your package manager first.`,
            filePath: conflicts.filePath,
            origin: '@parcel/package-manager',
            language: 'json',
            codeFrame: {
              code: conflicts.json,
              codeHighlights: (0, _diagnostic.generateJSONCodeHighlights)(conflicts.json, [{
                key: `/${field}/${(0, _diagnostic.encodeJSONKeyComponent)(name)}`,
                type: 'key',
                message: 'Defined here, but not installed'
              }])
            }
          }))
        });
      }

      let range = options === null || options === void 0 ? void 0 : options.range;

      if (range != null) {
        let pkg = resolved.pkg;

        if (pkg == null || !_semver.default.satisfies(pkg.version, range)) {
          let conflicts = await (0, _utils2.getConflictingLocalDependencies)(this.fs, name, from);

          if (conflicts == null && (options === null || options === void 0 ? void 0 : options.autoinstall) !== false) {
            await this.install([{
              name,
              range
            }], from);
            return this.resolve(name, from, { ...options,
              autoinstall: false
            });
          } else if (conflicts != null) {
            throw new _diagnostic.default({
              diagnostic: {
                message: `Could not find module "${name}" satisfying ${range}.`,
                filePath: conflicts.filePath,
                origin: '@parcel/package-manager',
                language: 'json',
                codeFrame: {
                  code: conflicts.json,
                  codeHighlights: (0, _diagnostic.generateJSONCodeHighlights)(conflicts.json, conflicts.fields.map(field => ({
                    key: `/${field}/${(0, _diagnostic.encodeJSONKeyComponent)(name)}`,
                    type: 'key',
                    message: 'Found this conflicting local requirement.'
                  })))
                }
              }
            });
          }

          let version = pkg === null || pkg === void 0 ? void 0 : pkg.version;
          let message = `Could not resolve package "${name}" that satisfies ${range}.`;

          if (version != null) {
            message += ` Found ${version}.`;
          }

          throw new _diagnostic.default({
            diagnostic: {
              message,
              origin: '@parcel/package-manager'
            }
          });
        }
      }

      this.cache.set(key, resolved);
    }

    return resolved;
  }

  resolveSync(name, from) {
    let basedir = _path.default.dirname(from);

    return (0, _utils.resolveSync)(this.fs, name, {
      basedir,
      extensions: Object.keys(_module.default._extensions)
    });
  }

  async install(modules, from, opts) {
    await (0, _installPackage.installPackage)(this.fs, modules, from, {
      packageInstaller: this.installer,
      ...opts
    });
  }

}

exports.NodePackageManager = NodePackageManager;
(0, _core.registerSerializableClass)(`${_package.default.version}:NodePackageManager`, NodePackageManager);