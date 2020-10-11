"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWorkerFarm = createWorkerFarm;
exports.BuildError = exports.default = exports.INTERNAL_RESOLVE = exports.INTERNAL_TRANSFORM = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _diagnostic = _interopRequireWildcard(require("@parcel/diagnostic"));

var _Dependency = require("./Dependency");

var _Environment = require("./Environment");

var _Asset = require("./public/Asset");

var _Bundle = require("./public/Bundle");

var _BundleGraph = _interopRequireDefault(require("./public/BundleGraph"));

var _BundlerRunner = _interopRequireDefault(require("./BundlerRunner"));

var _workers = _interopRequireDefault(require("@parcel/workers"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _AssetGraphBuilder = _interopRequireDefault(require("./AssetGraphBuilder"));

var _utils = require("./utils");

var _PackagerRunner = _interopRequireDefault(require("./PackagerRunner"));

var _loadParcelConfig = _interopRequireDefault(require("./loadParcelConfig"));

var _ReporterRunner = _interopRequireWildcard(require("./ReporterRunner"));

var _dumpGraphToGraphViz = _interopRequireDefault(require("./dumpGraphToGraphViz"));

var _resolveOptions = _interopRequireDefault(require("./resolveOptions"));

var _events = require("@parcel/events");

var _cache = require("@parcel/cache");

var _cjsPonyfill = require("abortcontroller-polyfill/dist/cjs-ponyfill");

var _utils2 = require("@parcel/utils");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

(0, _utils.registerCoreWithSerializer)();
const INTERNAL_TRANSFORM = Symbol('internal_transform');
exports.INTERNAL_TRANSFORM = INTERNAL_TRANSFORM;
const INTERNAL_RESOLVE = Symbol('internal_resolve');
exports.INTERNAL_RESOLVE = INTERNAL_RESOLVE;

class Parcel {
  // AssetGraphBuilder
  // AssetGraphBuilder
  // BundlerRunner
  // PackagerRunner
  // WorkerFarm
  // boolean
  // InitialParcelOptions;
  // ReporterRunner
  // ?ParcelOptions
  // (bundle: IBundle, bundleGraph: InternalBundleGraph) => Promise<Stats>;
  // AbortController
  // PromiseQueue<?BuildEvent>
  // AsyncSubscription
  // number
  constructor(options) {
    _assetGraphBuilder.set(this, {
      writable: true,
      value: void 0
    });

    _runtimesAssetGraphBuilder.set(this, {
      writable: true,
      value: void 0
    });

    _bundlerRunner.set(this, {
      writable: true,
      value: void 0
    });

    _packagerRunner.set(this, {
      writable: true,
      value: void 0
    });

    _config.set(this, {
      writable: true,
      value: void 0
    });

    _farm.set(this, {
      writable: true,
      value: void 0
    });

    _initialized.set(this, {
      writable: true,
      value: false
    });

    _initialOptions.set(this, {
      writable: true,
      value: void 0
    });

    _reporterRunner.set(this, {
      writable: true,
      value: void 0
    });

    _resolvedOptions.set(this, {
      writable: true,
      value: null
    });

    _runPackage.set(this, {
      writable: true,
      value: void 0
    });

    _watchAbortController.set(this, {
      writable: true,
      value: void 0
    });

    _watchQueue.set(this, {
      writable: true,
      value: new _utils2.PromiseQueue({
        maxConcurrent: 1
      })
    });

    _watchEvents.set(this, {
      writable: true,
      value: new _events.ValueEmitter()
    });

    _watcherSubscription.set(this, {
      writable: true,
      value: void 0
    });

    _watcherCount.set(this, {
      writable: true,
      value: 0
    });

    _classPrivateFieldSet(this, _initialOptions, options);
  }

  async init() {
    var _classPrivateFieldGet2;

    if (_classPrivateFieldGet(this, _initialized)) {
      return;
    }

    let resolvedOptions = await (0, _resolveOptions.default)(_classPrivateFieldGet(this, _initialOptions));

    _classPrivateFieldSet(this, _resolvedOptions, resolvedOptions);

    await (0, _cache.createCacheDir)(resolvedOptions.outputFS, resolvedOptions.cacheDir);
    let {
      config
    } = await (0, _loadParcelConfig.default)(resolvedOptions);

    _classPrivateFieldSet(this, _config, config);

    _classPrivateFieldSet(this, _farm, (_classPrivateFieldGet2 = _classPrivateFieldGet(this, _initialOptions).workerFarm) !== null && _classPrivateFieldGet2 !== void 0 ? _classPrivateFieldGet2 : createWorkerFarm({
      patchConsole: resolvedOptions.patchConsole
    })); // ? Should we have a dispose function on the Parcel class or should we create these references
    //  - in run and watch and dispose at the end of run and in the unsubsribe function of watch


    let {
      ref: optionsRef
    } = await _classPrivateFieldGet(this, _farm).createSharedReference(resolvedOptions);
    let {
      ref: configRef
    } = await _classPrivateFieldGet(this, _farm).createSharedReference(config.getConfig());

    _classPrivateFieldSet(this, _assetGraphBuilder, new _AssetGraphBuilder.default());

    _classPrivateFieldSet(this, _runtimesAssetGraphBuilder, new _AssetGraphBuilder.default());

    await Promise.all([_classPrivateFieldGet(this, _assetGraphBuilder).init({
      name: 'MainAssetGraph',
      options: resolvedOptions,
      optionsRef,
      entries: resolvedOptions.entries,
      workerFarm: _classPrivateFieldGet(this, _farm)
    }), _classPrivateFieldGet(this, _runtimesAssetGraphBuilder).init({
      name: 'RuntimesAssetGraph',
      options: resolvedOptions,
      optionsRef,
      workerFarm: _classPrivateFieldGet(this, _farm)
    })]);

    _classPrivateFieldSet(this, _bundlerRunner, new _BundlerRunner.default({
      options: resolvedOptions,
      runtimesBuilder: _classPrivateFieldGet(this, _runtimesAssetGraphBuilder),
      config,
      workerFarm: _classPrivateFieldGet(this, _farm)
    }));

    _classPrivateFieldSet(this, _reporterRunner, new _ReporterRunner.default({
      config,
      options: resolvedOptions,
      workerFarm: _classPrivateFieldGet(this, _farm)
    }));

    _classPrivateFieldSet(this, _packagerRunner, new _PackagerRunner.default({
      config,
      farm: _classPrivateFieldGet(this, _farm),
      options: resolvedOptions,
      optionsRef,
      configRef,
      report: _ReporterRunner.report
    }));

    _classPrivateFieldSet(this, _runPackage, _classPrivateFieldGet(this, _farm).createHandle('runPackage'));

    _classPrivateFieldSet(this, _initialized, true);
  }

  async run() {
    let startTime = Date.now();

    if (!_classPrivateFieldGet(this, _initialized)) {
      await this.init();
    }

    let result = await this.build({
      startTime
    });
    await Promise.all([_classPrivateFieldGet(this, _assetGraphBuilder).writeToCache(), _classPrivateFieldGet(this, _runtimesAssetGraphBuilder).writeToCache()]);

    if (!_classPrivateFieldGet(this, _initialOptions).workerFarm) {
      // If there wasn't a workerFarm passed in, we created it. End the farm.
      await _classPrivateFieldGet(this, _farm).end();
    }

    if (result.type === 'buildFailure') {
      throw new BuildError(result.diagnostics);
    }

    return result.bundleGraph;
  }

  async startNextBuild() {
    _classPrivateFieldSet(this, _watchAbortController, new _cjsPonyfill.AbortController());

    try {
      _classPrivateFieldGet(this, _watchEvents).emit({
        buildEvent: await this.build({
          signal: _classPrivateFieldGet(this, _watchAbortController).signal
        })
      });
    } catch (err) {
      // Ignore BuildAbortErrors and only emit critical errors.
      if (!(err instanceof _utils.BuildAbortError)) {
        throw err;
      }
    }
  }

  async watch(cb) {
    var _this$watcherCount;

    let watchEventsDisposable;

    if (cb) {
      watchEventsDisposable = _classPrivateFieldGet(this, _watchEvents).addListener(({
        error,
        buildEvent
      }) => cb(error, buildEvent));
    }

    if (_classPrivateFieldGet(this, _watcherCount) === 0) {
      if (!_classPrivateFieldGet(this, _initialized)) {
        await this.init();
      }

      _classPrivateFieldSet(this, _watcherSubscription, (await this._getWatcherSubscription()));

      await _classPrivateFieldGet(this, _reporterRunner).report({
        type: 'watchStart'
      }); // Kick off a first build, but don't await its results. Its results will
      // be provided to the callback.

      _classPrivateFieldGet(this, _watchQueue).add(() => this.startNextBuild());

      _classPrivateFieldGet(this, _watchQueue).run();
    }

    _classPrivateFieldSet(this, _watcherCount, (_this$watcherCount = +_classPrivateFieldGet(this, _watcherCount)) + 1), _this$watcherCount;
    let unsubscribePromise;

    const unsubscribe = async () => {
      var _this$watcherCount2;

      if (watchEventsDisposable) {
        watchEventsDisposable.dispose();
      }

      _classPrivateFieldSet(this, _watcherCount, (_this$watcherCount2 = +_classPrivateFieldGet(this, _watcherCount)) - 1), _this$watcherCount2;

      if (_classPrivateFieldGet(this, _watcherCount) === 0) {
        await (0, _nullthrows.default)(_classPrivateFieldGet(this, _watcherSubscription)).unsubscribe();

        _classPrivateFieldSet(this, _watcherSubscription, null);

        await _classPrivateFieldGet(this, _reporterRunner).report({
          type: 'watchEnd'
        });
        await Promise.all([_classPrivateFieldGet(this, _assetGraphBuilder).writeToCache(), _classPrivateFieldGet(this, _runtimesAssetGraphBuilder).writeToCache()]);
      }
    };

    return {
      unsubscribe() {
        if (unsubscribePromise == null) {
          unsubscribePromise = unsubscribe();
        }

        return unsubscribePromise;
      }

    };
  }

  async build({
    signal,
    startTime = Date.now()
  }) {
    let options = (0, _nullthrows.default)(_classPrivateFieldGet(this, _resolvedOptions));

    try {
      if (options.profile) {
        await _classPrivateFieldGet(this, _farm).startProfile();
      }

      _classPrivateFieldGet(this, _reporterRunner).report({
        type: 'buildStart'
      });

      let {
        assetGraph,
        changedAssets
      } = await _classPrivateFieldGet(this, _assetGraphBuilder).build(signal);
      (0, _dumpGraphToGraphViz.default)(assetGraph, 'MainAssetGraph'); // $FlowFixMe Added in Flow 0.121.0 upgrade in #4381

      let bundleGraph = await _classPrivateFieldGet(this, _bundlerRunner).bundle(assetGraph, {
        signal
      }); // $FlowFixMe Added in Flow 0.121.0 upgrade in #4381 (Windows only)

      (0, _dumpGraphToGraphViz.default)(bundleGraph._graph, 'BundleGraph');
      await _classPrivateFieldGet(this, _packagerRunner).writeBundles(bundleGraph);
      (0, _utils.assertSignalNotAborted)(signal);
      let event = {
        type: 'buildSuccess',
        changedAssets: new Map(Array.from(changedAssets).map(([id, asset]) => [id, (0, _Asset.assetFromValue)(asset, options)])),
        bundleGraph: new _BundleGraph.default(bundleGraph, (bundle, bundleGraph, options) => new _Bundle.NamedBundle(bundle, bundleGraph, options), options),
        buildTime: Date.now() - startTime
      };
      await _classPrivateFieldGet(this, _reporterRunner).report(event);
      await _classPrivateFieldGet(this, _assetGraphBuilder).validate();
      return event;
    } catch (e) {
      if (e instanceof _utils.BuildAbortError) {
        throw e;
      }

      let diagnostic = (0, _diagnostic.anyToDiagnostic)(e);
      let event = {
        type: 'buildFailure',
        diagnostics: Array.isArray(diagnostic) ? diagnostic : [diagnostic]
      };
      await _classPrivateFieldGet(this, _reporterRunner).report(event);
      return event;
    } finally {
      if (options.profile) {
        await _classPrivateFieldGet(this, _farm).endProfile();
      }
    }
  } // $FlowFixMe


  async [INTERNAL_TRANSFORM]({
    filePath,
    env,
    code
  }) {
    let [result] = await Promise.all([_classPrivateFieldGet(this, _assetGraphBuilder).runTransform({
      filePath,
      code,
      env: (0, _Environment.createEnvironment)(env)
    }), _classPrivateFieldGet(this, _reporterRunner).config.getReporters()]);
    return result;
  } // $FlowFixMe


  async [INTERNAL_RESOLVE]({
    moduleSpecifier,
    sourcePath,
    env
  }) {
    let resolved = await _classPrivateFieldGet(this, _assetGraphBuilder).resolverRunner.resolve((0, _Dependency.createDependency)({
      moduleSpecifier,
      sourcePath,
      env: (0, _Environment.createEnvironment)(env)
    }));
    return resolved.filePath;
  }

  _getWatcherSubscription() {
    (0, _assert.default)(_classPrivateFieldGet(this, _watcherSubscription) == null);
    let resolvedOptions = (0, _nullthrows.default)(_classPrivateFieldGet(this, _resolvedOptions));

    let opts = _classPrivateFieldGet(this, _assetGraphBuilder).getWatcherOptions();

    return resolvedOptions.inputFS.watch(resolvedOptions.projectRoot, (err, events) => {
      if (err) {
        _classPrivateFieldGet(this, _watchEvents).emit({
          error: err
        });

        return;
      }

      let isInvalid = _classPrivateFieldGet(this, _assetGraphBuilder).respondToFSEvents(events);

      if (isInvalid && _classPrivateFieldGet(this, _watchQueue).getNumWaiting() === 0) {
        if (_classPrivateFieldGet(this, _watchAbortController)) {
          _classPrivateFieldGet(this, _watchAbortController).abort();
        }

        _classPrivateFieldGet(this, _watchQueue).add(() => this.startNextBuild());

        _classPrivateFieldGet(this, _watchQueue).run();
      }
    }, opts);
  } // This is mainly for integration tests and it not public api!


  _getResolvedParcelOptions() {
    return (0, _nullthrows.default)(_classPrivateFieldGet(this, _resolvedOptions), 'Resolved options is null, please let parcel intitialise before accessing this.');
  }

}

exports.default = Parcel;

var _assetGraphBuilder = new WeakMap();

var _runtimesAssetGraphBuilder = new WeakMap();

var _bundlerRunner = new WeakMap();

var _packagerRunner = new WeakMap();

var _config = new WeakMap();

var _farm = new WeakMap();

var _initialized = new WeakMap();

var _initialOptions = new WeakMap();

var _reporterRunner = new WeakMap();

var _resolvedOptions = new WeakMap();

var _runPackage = new WeakMap();

var _watchAbortController = new WeakMap();

var _watchQueue = new WeakMap();

var _watchEvents = new WeakMap();

var _watcherSubscription = new WeakMap();

var _watcherCount = new WeakMap();

class BuildError extends _diagnostic.default {
  constructor(diagnostics) {
    super({
      diagnostic: diagnostics
    });
    this.name = 'BuildError';
  }

}

exports.BuildError = BuildError;

function createWorkerFarm(options = {}) {
  return new _workers.default({ ...options,
    workerPath: require.resolve('./worker')
  });
}