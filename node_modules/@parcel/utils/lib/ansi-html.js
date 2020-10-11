"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ansiHtml = ansiHtml;

var _ansiHtml = _interopRequireDefault(require("ansi-html"));

var _escapeHtml = require("./escape-html");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ansiHtml(ansi) {
  return (0, _ansiHtml.default)((0, _escapeHtml.escapeHTML)(ansi));
}