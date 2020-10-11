"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolve = resolve;
exports.resolveSync = resolveSync;

var _promisify = _interopRequireDefault(require("./promisify"));

var _resolve2 = _interopRequireDefault(require("resolve"));

var _ = require("../");

var _module = _interopRequireDefault(require("module"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $FlowFixMe TODO: Type promisify
// $FlowFixMe this is untyped
const resolveAsync = (0, _promisify.default)(_resolve2.default);

async function resolve(fs, id, opts) {
  if (id === 'pnpapi') {
    // the resolve package doesn't recognize pnpapi as a builtin
    return {
      resolved: 'pnpapi'
    };
  }

  let res = await resolveAsync(id, { ...opts,

    async readFile(filename, callback) {
      try {
        let res = await fs.readFile(filename);
        callback(null, res);
      } catch (err) {
        callback(err);
      }
    },

    async isFile(file, callback) {
      try {
        let stat = await fs.stat(file);
        callback(null, stat.isFile());
      } catch (err) {
        callback(null, false);
      }
    },

    async isDirectory(file, callback) {
      try {
        let stat = await fs.stat(file);
        callback(null, stat.isDirectory());
      } catch (err) {
        callback(null, false);
      }
    }

  });

  if (typeof res === 'string') {
    return {
      resolved: res
    };
  }

  return {
    resolved: res[0],
    pkg: res[1]
  };
}

function resolveSync(fs, id, opts) {
  if (id === 'pnpapi') {
    // the resolve package doesn't recognize pnpapi as a builtin
    return {
      resolved: 'pnpapi'
    };
  } // $FlowFixMe


  let res = _resolve2.default.sync(id, { ...opts,
    readFileSync: (...args) => {
      return fs.readFileSync(...args);
    },
    isFile: file => {
      try {
        let stat = fs.statSync(file);
        return stat.isFile();
      } catch (err) {
        return false;
      }
    },
    isDirectory: file => {
      try {
        let stat = fs.statSync(file);
        return stat.isDirectory();
      } catch (err) {
        return false;
      }
    }
  });

  return {
    resolved: res
  };
}