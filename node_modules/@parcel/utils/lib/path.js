"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeSeparators = normalizeSeparators;
exports.normalizePath = normalizePath;
exports.relativePath = relativePath;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SEPARATOR_REGEX = /[\\]+/g;

function normalizeSeparators(filePath) {
  return filePath.replace(SEPARATOR_REGEX, '/');
}

function normalizePath(filePath, leadingDotSlash = true) {
  if (leadingDotSlash && filePath[0] !== '.' && filePath[0] !== '/') {
    return normalizeSeparators('./' + filePath);
  } else {
    return normalizeSeparators(filePath);
  }
}

function relativePath(from, to, leadingDotSlash = true) {
  return normalizePath(_path.default.relative(from, to), leadingDotSlash);
}