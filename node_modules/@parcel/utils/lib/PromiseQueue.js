"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Deferred = require("./Deferred");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PromiseQueue {
  constructor(opts = {
    maxConcurrent: Infinity
  }) {
    _defineProperty(this, "_deferred", void 0);

    _defineProperty(this, "_maxConcurrent", void 0);

    _defineProperty(this, "_numRunning", 0);

    _defineProperty(this, "_queue", []);

    _defineProperty(this, "_runPromise", null);

    _defineProperty(this, "_count", 0);

    _defineProperty(this, "_results", []);

    if (opts.maxConcurrent <= 0) {
      throw new TypeError('maxConcurrent must be a positive, non-zero value');
    }

    this._maxConcurrent = opts.maxConcurrent;
  }

  getNumWaiting() {
    return this._queue.length;
  }

  add(fn) {
    return new Promise((resolve, reject) => {
      let i = this._count++;

      this._queue.push(() => fn().then(result => {
        this._results[i] = result;
        resolve(result);
      }, err => {
        reject(err);
        throw err;
      }));

      if (this._numRunning > 0 && this._numRunning < this._maxConcurrent) {
        this._next();
      }
    });
  }

  run() {
    if (this._runPromise != null) {
      return this._runPromise;
    }

    if (this._queue.length === 0) {
      return Promise.resolve([]);
    }

    let {
      deferred,
      promise
    } = (0, _Deferred.makeDeferredWithPromise)();
    this._deferred = deferred;
    this._runPromise = promise;

    while (this._queue.length && this._numRunning < this._maxConcurrent) {
      this._next();
    }

    return promise;
  }

  async _next() {
    let fn = this._queue.shift();

    await this._runFn(fn);

    if (this._queue.length) {
      this._next();
    } else if (this._numRunning === 0) {
      this._resolve();
    }
  }

  async _runFn(fn) {
    this._numRunning++;

    try {
      await fn();
      this._numRunning--;
    } catch (e) {
      this._reject(e); // rejecting resets state so numRunning is reset to 0 here

    }
  }

  _resetState() {
    this._queue = [];
    this._count = 0;
    this._results = [];
    this._runPromise = null;
    this._numRunning = 0;
    this._deferred = null;
  }

  _reject(err) {
    if (this._deferred != null) {
      this._deferred.reject(err);
    }

    this._resetState();
  }

  _resolve() {
    if (this._deferred != null) {
      this._deferred.resolve(this._results);
    }

    this._resetState();
  }

}

exports.default = PromiseQueue;