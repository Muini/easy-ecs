"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.relativeBundlePath = relativeBundlePath;

var _path = _interopRequireDefault(require("path"));

var _path2 = require("./path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function relativeBundlePath(from, to, opts = {
  leadingDotSlash: true
}) {
  return (0, _path2.relativePath)(_path.default.dirname(from.filePath), to.filePath, opts.leadingDotSlash);
}