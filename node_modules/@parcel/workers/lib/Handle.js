"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@parcel/core");

var _childState = require("./childState");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let HANDLE_ID = 0;
const handleById = new Map();

class Handle {
  constructor(opts) {
    _defineProperty(this, "id", void 0);

    _defineProperty(this, "childId", void 0);

    _defineProperty(this, "fn", void 0);

    _defineProperty(this, "workerApi", void 0);

    this.id = ++HANDLE_ID;
    this.fn = opts.fn;
    this.childId = opts.childId;
    this.workerApi = opts.workerApi;
    handleById.set(this.id, this);
  }

  dispose() {
    handleById.delete(this.id);
  }

  serialize() {
    return {
      id: this.id,
      childId: this.childId
    };
  }

  static deserialize(opts) {
    return function (...args) {
      let workerApi;

      if (_childState.child) {
        workerApi = _childState.child.workerApi;
      } else {
        let handle = handleById.get(opts.id);

        if (!handle) {
          throw new Error('Corresponding Handle was not found. It may have been disposed.');
        }

        workerApi = handle.workerApi;
      }

      if (opts.childId != null && _childState.child) {
        throw new Error('Cannot call another child from a child');
      }

      if (opts.childId != null && workerApi.callChild) {
        return workerApi.callChild(opts.childId, {
          handle: opts.id,
          args
        });
      }

      return workerApi.callMaster({
        handle: opts.id,
        args
      }, true);
    };
  }

} // Register the Handle as a serializable class so that it will properly be deserialized
// by anything that uses WorkerFarm.


exports.default = Handle;
(0, _core.registerSerializableClass)(`${_package.default.version}:Handle`, Handle);