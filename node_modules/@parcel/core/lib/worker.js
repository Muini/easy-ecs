"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runTransform = runTransform;
exports.runValidate = runValidate;
exports.runPackage = runPackage;

var _assert = _interopRequireDefault(require("assert"));

var _BundleGraph = _interopRequireDefault(require("./BundleGraph"));

var _Transformation = _interopRequireDefault(require("./Transformation"));

var _ReporterRunner = require("./ReporterRunner");

var _PackagerRunner = _interopRequireDefault(require("./PackagerRunner"));

var _Validation = _interopRequireDefault(require("./Validation"));

var _ParcelConfig = _interopRequireDefault(require("./ParcelConfig"));

var _utils = require("./utils");

require("@parcel/cache");

require("@parcel/package-manager");

require("@parcel/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// register with serializer
(0, _utils.registerCoreWithSerializer)(); // Remove the workerApi type from the TransformationOpts and ValidationOpts types:
// https://github.com/facebook/flow/issues/2835

function runTransform(workerApi, opts) {
  let {
    optionsRef,
    configRef,
    ...rest
  } = opts;
  let options = workerApi.getSharedReference(optionsRef // $FlowFixMe
  );
  let processedConfig = workerApi.getSharedReference(configRef // $FlowFixMe
  );
  let config = new _ParcelConfig.default(processedConfig, options.packageManager, options.autoinstall);
  return new _Transformation.default({
    workerApi,
    report: _ReporterRunner.reportWorker.bind(null, workerApi),
    options,
    config,
    ...rest
  }).run();
}

function runValidate(workerApi, opts) {
  let {
    optionsRef,
    configRef,
    ...rest
  } = opts;
  let options = workerApi.getSharedReference(optionsRef // $FlowFixMe
  );
  let processedConfig = workerApi.getSharedReference(configRef // $FlowFixMe
  );
  let config = new _ParcelConfig.default(processedConfig, options.packageManager, options.autoinstall);
  return new _Validation.default({
    workerApi,
    report: _ReporterRunner.reportWorker.bind(null, workerApi),
    options,
    config,
    ...rest
  }).run();
}

function runPackage(workerApi, {
  bundle,
  bundleGraphReference,
  configRef,
  cacheKeys,
  optionsRef
}) {
  let bundleGraph = workerApi.getSharedReference(bundleGraphReference);
  (0, _assert.default)(bundleGraph instanceof _BundleGraph.default);
  let options = workerApi.getSharedReference(optionsRef // $FlowFixMe
  );
  let processedConfig = workerApi.getSharedReference(configRef // $FlowFixMe
  );
  let config = new _ParcelConfig.default(processedConfig, options.packageManager, options.autoinstall);
  return new _PackagerRunner.default({
    config,
    options,
    report: _ReporterRunner.reportWorker.bind(null, workerApi)
  }).getBundleInfo(bundle, bundleGraph, cacheKeys);
}