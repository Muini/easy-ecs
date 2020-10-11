"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBundleGroupId = getBundleGroupId;
exports.assertSignalNotAborted = assertSignalNotAborted;
exports.registerCoreWithSerializer = registerCoreWithSerializer;
exports.BuildAbortError = void 0;

var _serializer = require("./serializer");

var _AssetGraph = _interopRequireDefault(require("./AssetGraph"));

var _BundleGraph = _interopRequireDefault(require("./BundleGraph"));

var _Graph = _interopRequireDefault(require("./Graph"));

var _ParcelConfig = _interopRequireDefault(require("./ParcelConfig"));

var _RequestTracker = require("./RequestTracker");

var _Config = _interopRequireDefault(require("./public/Config"));

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getBundleGroupId(bundleGroup) {
  return 'bundle_group:' + bundleGroup.entryAssetId;
}

function assertSignalNotAborted(signal) {
  if (signal && signal.aborted) {
    throw new BuildAbortError();
  }
}

class BuildAbortError extends Error {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "name", 'BuildAbortError');
  }

}

exports.BuildAbortError = BuildAbortError;
let coreRegistered;

function registerCoreWithSerializer() {
  if (coreRegistered) {
    return;
  }

  const packageVersion = _package.default.version;

  if (typeof packageVersion !== 'string') {
    throw new Error('Expected package version to be a string');
  } // $FlowFixMe


  for (let [name, ctor] of Object.entries({
    AssetGraph: _AssetGraph.default,
    Config: _Config.default,
    BundleGraph: _BundleGraph.default,
    Graph: _Graph.default,
    ParcelConfig: _ParcelConfig.default,
    RequestGraph: _RequestTracker.RequestGraph
  })) {
    (0, _serializer.registerSerializableClass)(packageVersion + ':' + name, ctor);
  }

  coreRegistered = true;
}