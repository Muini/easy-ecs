"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isGlob = isGlob;
exports.isGlobMatch = isGlobMatch;
exports.globSync = globSync;
exports.glob = glob;

var _isGlob2 = _interopRequireDefault(require("is-glob"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _micromatch = require("micromatch");

var _path = require("./path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isGlob(p) {
  return (0, _isGlob2.default)((0, _path.normalizeSeparators)(p));
}

function isGlobMatch(filePath, glob) {
  return (0, _micromatch.isMatch)(filePath, (0, _path.normalizeSeparators)(glob));
}

function globSync(p, options) {
  return _fastGlob.default.sync((0, _path.normalizeSeparators)(p), options);
}

function glob(p, fs, options) {
  // $FlowFixMe
  options = { ...options,
    fs: {
      stat: async (p, cb) => {
        try {
          cb(null, (await fs.stat(p)));
        } catch (err) {
          cb(err);
        }
      },
      lstat: async (p, cb) => {
        // Our FileSystem interface doesn't have lstat support at the moment,
        // but this is fine for our purposes since we follow symlinks by default.
        try {
          cb(null, (await fs.stat(p)));
        } catch (err) {
          cb(err);
        }
      },
      readdir: async (p, opts, cb) => {
        if (typeof opts === 'function') {
          cb = opts;
          opts = null;
        }

        try {
          cb(null, (await fs.readdir(p, opts)));
        } catch (err) {
          cb(err);
        }
      }
    }
  }; // $FlowFixMe Added in Flow 0.121.0 upgrade in #4381

  return (0, _fastGlob.default)((0, _path.normalizeSeparators)(p), options);
}