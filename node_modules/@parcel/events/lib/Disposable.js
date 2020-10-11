"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

/*
 * A general-purpose disposable class. It can normalize disposable-like values
 * (such as single functions or IDisposables), as well as hold multiple
 * disposable-like values to be disposed of at once.
 */
class Disposable {
  // ?Set<DisposableLike>
  constructor(...disposables) {
    _defineProperty(this, "disposed", false);

    _disposables.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _disposables, new Set(disposables));
  }

  add(...disposables) {
    if (this.disposed) {
      throw new _errors.AlreadyDisposedError('Cannot add new disposables after disposable has been disposed');
    }

    (0, _assert.default)(_classPrivateFieldGet(this, _disposables) != null);

    for (let disposable of disposables) {
      _classPrivateFieldGet(this, _disposables).add(disposable);
    }
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    (0, _assert.default)(_classPrivateFieldGet(this, _disposables) != null);

    for (let disposable of _classPrivateFieldGet(this, _disposables)) {
      if (typeof disposable === 'function') {
        disposable();
      } else {
        disposable.dispose();
      }
    }

    _classPrivateFieldSet(this, _disposables, null);

    this.disposed = true;
  }

}

exports.default = Disposable;

var _disposables = new WeakMap();