"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reportWorker = reportWorker;
exports.report = report;
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _Bundle = require("./public/Bundle");

var _workers = _interopRequireWildcard(require("@parcel/workers"));

var _ParcelConfig = _interopRequireDefault(require("./ParcelConfig"));

var _logger = _interopRequireWildcard(require("@parcel/logger"));

var _PluginOptions = _interopRequireDefault(require("./public/PluginOptions"));

var _BundleGraph = _interopRequireDefault(require("./BundleGraph"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ReporterRunner {
  constructor(opts) {
    _defineProperty(this, "config", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "pluginOptions", void 0);

    this.config = opts.config;
    this.options = opts.options;
    this.pluginOptions = new _PluginOptions.default(this.options);

    _logger.default.onLog(event => this.report(event));

    _workers.bus.on('reporterEvent', event => {
      if (event.type === 'buildProgress' && (event.phase === 'optimizing' || event.phase === 'packaging') && !(event.bundle instanceof _Bundle.NamedBundle)) {
        // Convert any internal bundles back to their public equivalents as reporting
        // is public api
        let bundleGraph = opts.workerFarm.workerApi.getSharedReference(event.bundleGraphRef);
        (0, _assert.default)(bundleGraph instanceof _BundleGraph.default);
        this.report({ ...event,
          bundle: new _Bundle.NamedBundle(event.bundle, bundleGraph, this.options)
        });
        return;
      }

      this.report(event);
    });

    if (this.options.patchConsole) {
      (0, _logger.patchConsole)();
    } else {
      (0, _logger.unpatchConsole)();
    }
  }

  async report(event) {
    let reporters = await this.config.getReporters();

    for (let reporter of reporters) {
      try {
        await reporter.plugin.report({
          event,
          options: this.pluginOptions,
          logger: new _logger.PluginLogger({
            origin: reporter.name
          })
        });
      } catch (e) {
        // We shouldn't emit a report event here as we will cause infinite loops...
        _logger.INTERNAL_ORIGINAL_CONSOLE.error(e);
      }
    }
  }

}

exports.default = ReporterRunner;

function reportWorker(workerApi, event) {
  if (event.type === 'buildProgress' && (event.phase === 'optimizing' || event.phase === 'packaging')) {
    // Convert any public api bundles to their internal equivalents for
    // easy serialization
    _workers.bus.emit('reporterEvent', { ...event,
      bundle: (0, _Bundle.bundleToInternalBundle)(event.bundle),
      bundleGraphRef: workerApi.resolveSharedReference((0, _Bundle.bundleToInternalBundleGraph)(event.bundle))
    });

    return;
  }

  _workers.bus.emit('reporterEvent', event);
}

function report(event) {
  _workers.bus.emit('reporterEvent', event);
}