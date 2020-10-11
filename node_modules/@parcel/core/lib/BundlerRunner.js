"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _path = _interopRequireDefault(require("path"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _logger = require("@parcel/logger");

var _diagnostic = _interopRequireWildcard(require("@parcel/diagnostic"));

var _AssetGraph = _interopRequireDefault(require("./AssetGraph"));

var _BundleGraph = _interopRequireDefault(require("./public/BundleGraph"));

var _BundleGraph2 = _interopRequireWildcard(require("./BundleGraph"));

var _MutableBundleGraph = _interopRequireDefault(require("./public/MutableBundleGraph"));

var _Bundle = require("./public/Bundle");

var _ReporterRunner = require("./ReporterRunner");

var _dumpGraphToGraphViz = _interopRequireDefault(require("./dumpGraphToGraphViz"));

var _utils = require("@parcel/utils");

var _PluginOptions = _interopRequireDefault(require("./public/PluginOptions"));

var _applyRuntimes = _interopRequireDefault(require("./applyRuntimes"));

var _constants = require("./constants");

var _utils2 = require("./utils");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BundlerRunner {
  constructor(opts) {
    _defineProperty(this, "options", void 0);

    _defineProperty(this, "config", void 0);

    _defineProperty(this, "pluginOptions", void 0);

    _defineProperty(this, "farm", void 0);

    _defineProperty(this, "runtimesBuilder", void 0);

    _defineProperty(this, "isBundling", false);

    this.options = opts.options;
    this.config = opts.config;
    this.pluginOptions = new _PluginOptions.default(this.options);
    this.runtimesBuilder = opts.runtimesBuilder;
    this.farm = opts.workerFarm;
  }

  async bundle(graph, {
    signal
  }) {
    (0, _ReporterRunner.report)({
      type: 'buildProgress',
      phase: 'bundling'
    });
    let cacheKey;

    if (!this.options.disableCache) {
      cacheKey = await this.getCacheKey(graph);
      let cachedBundleGraph = await this.options.cache.get(cacheKey);
      (0, _utils2.assertSignalNotAborted)(signal);

      if (cachedBundleGraph) {
        return cachedBundleGraph;
      }
    }

    let bundleGraph = (0, _BundleGraph2.removeAssetGroups)(graph); // $FlowFixMe

    let internalBundleGraph = new _BundleGraph2.default({
      graph: bundleGraph
    });
    await (0, _dumpGraphToGraphViz.default)(bundleGraph, 'before_bundle');
    let mutableBundleGraph = new _MutableBundleGraph.default(internalBundleGraph, this.options);
    let {
      plugin: bundler
    } = await this.config.getBundler();

    try {
      await bundler.bundle({
        bundleGraph: mutableBundleGraph,
        options: this.pluginOptions,
        logger: new _logger.PluginLogger({
          origin: this.config.getBundlerName()
        })
      });
    } catch (e) {
      throw new _diagnostic.default({
        diagnostic: (0, _diagnostic.errorToDiagnostic)(e, this.config.getBundlerName())
      });
    }

    (0, _utils2.assertSignalNotAborted)(signal);
    await (0, _dumpGraphToGraphViz.default)(bundleGraph, 'after_bundle');

    try {
      await bundler.optimize({
        bundleGraph: mutableBundleGraph,
        options: this.pluginOptions,
        logger: new _logger.PluginLogger({
          origin: this.config.getBundlerName()
        })
      });
    } catch (e) {
      throw new _diagnostic.default({
        diagnostic: (0, _diagnostic.errorToDiagnostic)(e, this.config.getBundlerName())
      });
    }

    (0, _utils2.assertSignalNotAborted)(signal);
    await (0, _dumpGraphToGraphViz.default)(bundleGraph, 'after_optimize');
    await this.nameBundles(internalBundleGraph);
    await (0, _applyRuntimes.default)({
      bundleGraph: internalBundleGraph,
      runtimesBuilder: this.runtimesBuilder,
      config: this.config,
      options: this.options,
      pluginOptions: this.pluginOptions
    });
    (0, _utils2.assertSignalNotAborted)(signal);
    await (0, _dumpGraphToGraphViz.default)(bundleGraph, 'after_runtimes');

    if (cacheKey != null) {
      await this.options.cache.set(cacheKey, internalBundleGraph);
    }

    (0, _utils2.assertSignalNotAborted)(signal);
    return internalBundleGraph;
  }

  async getCacheKey(assetGraph) {
    let name = this.config.getBundlerName();
    let {
      version
    } = await this.config.getBundler();
    return (0, _utils.md5FromObject)({
      parcelVersion: _constants.PARCEL_VERSION,
      name,
      version,
      hash: assetGraph.getHash()
    });
  }

  async nameBundles(bundleGraph) {
    let namers = await this.config.getNamers();
    let bundles = bundleGraph.getBundles();
    await Promise.all(bundles.map(bundle => this.nameBundle(namers, bundle, bundleGraph)));
    let bundlePaths = bundles.map(b => b.filePath);

    _assert.default.deepEqual(bundlePaths, (0, _utils.unique)(bundlePaths), 'Bundles must have unique filePaths');
  }

  async nameBundle(namers, internalBundle, internalBundleGraph) {
    let bundle = new _Bundle.Bundle(internalBundle, internalBundleGraph, this.options);
    let bundleGraph = new _BundleGraph.default(internalBundleGraph, (bundle, bundleGraph, options) => new _Bundle.NamedBundle(bundle, bundleGraph, options), this.options);

    for (let namer of namers) {
      try {
        let name = await namer.plugin.name({
          bundle,
          bundleGraph,
          options: this.pluginOptions,
          logger: new _logger.PluginLogger({
            origin: namer.name
          })
        });

        if (name != null) {
          if (_path.default.extname(name).slice(1) !== bundle.type) {
            throw new Error(`Destination name ${name} extension does not match bundle type "${bundle.type}"`);
          }

          let target = (0, _nullthrows.default)(internalBundle.target);
          internalBundle.filePath = _path.default.join(target.distDir, (0, _utils.normalizeSeparators)(name));
          internalBundle.name = name;
          let {
            hashReference
          } = internalBundle;
          internalBundle.displayName = name.includes(hashReference) ? name.replace(hashReference, '[hash]') : name;
          return;
        }
      } catch (e) {
        throw new _diagnostic.default({
          diagnostic: (0, _diagnostic.errorToDiagnostic)(e, namer.name)
        });
      }
    }

    throw new Error('Unable to name bundle');
  }

}

exports.default = BundlerRunner;