"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _childState = require("./childState");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Bus extends _events.default {
  emit(event, ...args) {
    if (_childState.child) {
      _childState.child.workerApi.callMaster({
        location: __filename,
        method: 'emit',
        args: [event, ...args]
      }, false);

      return true;
    } else {
      return super.emit(event, ...args);
    }
  }

}

var _default = new Bus();

exports.default = _default;