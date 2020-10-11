"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = urlJoin;

var _url = _interopRequireDefault(require("url"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Joins a path onto a URL, and normalizes Windows paths
 * e.g. from \path\to\res.js to /path/to/res.js.
 */
function urlJoin(publicURL, assetPath) {
  const url = _url.default.parse(publicURL, false, true);

  const assetUrl = _url.default.parse(assetPath);

  url.pathname = _path.default.posix.join(url.pathname, assetUrl.pathname);
  url.search = assetUrl.search;
  url.hash = assetUrl.hash;
  return _url.default.format(url);
}