"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = relativeUrl;

var _path = _interopRequireDefault(require("path"));

var _url = _interopRequireDefault(require("url"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function relativeUrl(from, to) {
  return _url.default.format(_url.default.parse(_path.default.relative(from, to)));
}