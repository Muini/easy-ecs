"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _assert = _interopRequireDefault(require("assert"));

var _path = _interopRequireDefault(require("path"));

var _utils = require("@parcel/utils");

var _AssetGraph = _interopRequireDefault(require("./AssetGraph"));

var _RequestTracker = _interopRequireWildcard(require("./RequestTracker"));

var _constants = require("./constants");

var _ParcelConfig = _interopRequireDefault(require("./ParcelConfig"));

var _ParcelConfigRequestRunner = _interopRequireDefault(require("./requests/ParcelConfigRequestRunner"));

var _EntryRequestRunner = _interopRequireDefault(require("./requests/EntryRequestRunner"));

var _TargetRequestRunner = _interopRequireDefault(require("./requests/TargetRequestRunner"));

var _AssetRequestRunner = _interopRequireDefault(require("./requests/AssetRequestRunner"));

var _DepPathRequestRunner = _interopRequireDefault(require("./requests/DepPathRequestRunner"));

var _Validation = _interopRequireDefault(require("./Validation"));

var _ReporterRunner = require("./ReporterRunner");

var _dumpGraphToGraphViz = _interopRequireDefault(require("./dumpGraphToGraphViz"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AssetGraphBuilder extends _events.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "assetGraph", void 0);

    _defineProperty(this, "requestGraph", void 0);

    _defineProperty(this, "requestTracker", void 0);

    _defineProperty(this, "entryRequestRunner", void 0);

    _defineProperty(this, "targetRequestRunner", void 0);

    _defineProperty(this, "depPathRequestRunner", void 0);

    _defineProperty(this, "assetRequestRunner", void 0);

    _defineProperty(this, "configRequestRunner", void 0);

    _defineProperty(this, "assetRequests", void 0);

    _defineProperty(this, "runValidate", void 0);

    _defineProperty(this, "queue", void 0);

    _defineProperty(this, "rejected", void 0);

    _defineProperty(this, "changedAssets", new Map());

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "optionsRef", void 0);

    _defineProperty(this, "config", void 0);

    _defineProperty(this, "configRef", void 0);

    _defineProperty(this, "workerFarm", void 0);

    _defineProperty(this, "cacheKey", void 0);

    _defineProperty(this, "entries", void 0);

    _defineProperty(this, "initialAssetGroups", void 0);

    _defineProperty(this, "handle", void 0);
  }

  async init({
    options,
    optionsRef,
    entries,
    name,
    assetRequests,
    workerFarm
  }) {
    this.options = options;
    this.optionsRef = optionsRef;
    this.entries = entries;
    this.initialAssetGroups = assetRequests;
    this.workerFarm = workerFarm;
    this.assetRequests = []; // TODO: changing these should not throw away the entire graph.
    // We just need to re-run target resolution.

    let {
      hot,
      publicUrl,
      distDir,
      minify,
      scopeHoist
    } = options;
    this.cacheKey = (0, _utils.md5FromObject)({
      parcelVersion: _constants.PARCEL_VERSION,
      name,
      options: {
        hot,
        publicUrl,
        distDir,
        minify,
        scopeHoist
      },
      entries
    });
    this.queue = new _utils.PromiseQueue();
    this.runValidate = workerFarm.createHandle('runValidate');
    this.handle = workerFarm.createReverseHandle(() => {// Do nothing, this is here because there is a bug in `@parcel/workers`
    });
    let changes = await this.readFromCache();

    if (!changes) {
      this.assetGraph = new _AssetGraph.default();
      this.requestGraph = new _RequestTracker.RequestGraph();
    }

    this.assetGraph.initOptions({
      onNodeRemoved: node => this.handleNodeRemovedFromAssetGraph(node)
    });
    let assetGraph = this.assetGraph;
    this.requestTracker = new _RequestTracker.default({
      graph: this.requestGraph
    });
    let tracker = this.requestTracker;
    this.entryRequestRunner = new _EntryRequestRunner.default({
      tracker,
      options,
      assetGraph
    });
    this.targetRequestRunner = new _TargetRequestRunner.default({
      tracker,
      options,
      assetGraph
    });
    this.configRequestRunner = new _ParcelConfigRequestRunner.default({
      tracker,
      options,
      workerFarm
    });

    if (changes) {
      this.requestGraph.invalidateUnpredictableNodes();
      this.requestTracker.respondToFSEvents(changes);
    } else {
      this.assetGraph.initialize({
        entries,
        assetGroups: assetRequests
      });
    }
  }

  async build(signal) {
    let {
      config,
      configRef
    } = (0, _nullthrows.default)((await this.configRequestRunner.runRequest(null, {
      signal
    }))); // This should not be necessary once sub requests are supported

    if (configRef !== this.configRef) {
      this.configRef = configRef;
      this.config = new _ParcelConfig.default(config, this.options.packageManager, this.options.autoinstall);
      let {
        requestTracker: tracker,
        options,
        optionsRef,
        workerFarm,
        assetGraph
      } = this;
      this.assetRequestRunner = new _AssetRequestRunner.default({
        tracker,
        options,
        optionsRef,
        configRef,
        workerFarm,
        assetGraph
      });
      this.depPathRequestRunner = new _DepPathRequestRunner.default({
        tracker,
        options,
        assetGraph,
        config: this.config
      });
    }

    this.rejected = new Map();
    let root = this.assetGraph.getRootNode();

    if (!root) {
      throw new Error('A root node is required to traverse');
    }

    let visited = new Set([root.id]);

    const visit = node => {
      let request = this.getCorrespondingRequest(node);

      if (!node.complete && !node.deferred && request != null && !this.requestTracker.hasValidResult((0, _nullthrows.default)(request).id)) {
        // $FlowFixMe
        this.queueRequest(request, {
          signal
        }).then(() => visitChildren(node));
      } else {
        visitChildren(node);
      }
    };

    const visitChildren = node => {
      for (let child of this.assetGraph.getNodesConnectedFrom(node)) {
        if ((!visited.has(child.id) || child.hasDeferred) && this.assetGraph.shouldVisitChild(node, child)) {
          visited.add(child.id);
          visit(child);
        }
      }
    };

    visit(root);
    await this.queue.run();
    let errors = [];

    for (let [requestId, error] of this.rejected) {
      // ? Is this still needed?
      if (this.requestTracker.isTracked(requestId)) {
        errors.push(error);
      }
    }

    if (errors.length) {
      throw errors[0]; // TODO: eventually support multiple errors since requests could reject in parallel
    }

    (0, _dumpGraphToGraphViz.default)(this.assetGraph, 'AssetGraph'); // $FlowFixMe Added in Flow 0.121.0 upgrade in #4381

    (0, _dumpGraphToGraphViz.default)(this.requestGraph, 'RequestGraph');
    let changedAssets = this.changedAssets;
    this.changedAssets = new Map();
    return {
      assetGraph: this.assetGraph,
      changedAssets: changedAssets
    };
  }

  async validate() {
    let trackedRequestsDesc = this.assetRequests.filter(request => this.requestTracker.isTracked(request.id) && this.config.getValidatorNames(request.request.filePath).length > 0).map(({
      request
    }) => request); // Schedule validations on workers for all plugins that implement the one-asset-at-a-time "validate" method.

    let promises = trackedRequestsDesc.map(request => this.runValidate({
      requests: [request],
      optionsRef: this.optionsRef,
      configRef: this.configRef
    })); // Skip sending validation requests if no validators were configured

    if (trackedRequestsDesc.length === 0) {
      return;
    } // Schedule validations on the main thread for all validation plugins that implement "validateAll".


    promises.push(new _Validation.default({
      requests: trackedRequestsDesc,
      options: this.options,
      config: this.config,
      report: _ReporterRunner.report,
      dedicatedThread: true
    }).run());
    this.assetRequests = [];
    await Promise.all(promises);
  }

  queueRequest(request, runOpts) {
    return this.queue.add(async () => {
      if (this.rejected.size > 0) {
        return;
      }

      try {
        await this.runRequest(request, runOpts);
      } catch (e) {
        this.rejected.set(request.id, e);
      }
    });
  }

  async runRequest(request, runOpts) {
    switch (request.type) {
      case 'entry_request':
        return this.entryRequestRunner.runRequest(request.request, runOpts);

      case 'target_request':
        return this.targetRequestRunner.runRequest(request.request, runOpts);

      case 'dep_path_request':
        return this.depPathRequestRunner.runRequest(request.request, runOpts);

      case 'asset_request':
        {
          this.assetRequests.push(request);
          let assetActuallyChanged = !this.requestTracker.hasValidResult(request.id);
          let result = await this.assetRequestRunner.runRequest(request.request, runOpts);

          if (assetActuallyChanged && result != null) {
            for (let asset of result.assets) {
              this.changedAssets.set(asset.id, asset);
            }
          }

          return result;
        }
    }
  }

  getCorrespondingRequest(node) {
    let requestNode = node.correspondingRequest != null ? this.requestGraph.getNode(node.correspondingRequest) : null;

    if (requestNode != null) {
      (0, _assert.default)(requestNode.type === 'request');
      return requestNode.value;
    }

    switch (node.type) {
      case 'entry_specifier':
        {
          let type = 'entry_request';
          return {
            type,
            request: node.value,
            id: (0, _RequestTracker.generateRequestId)(type, node.value)
          };
        }

      case 'entry_file':
        {
          let type = 'target_request';
          return {
            type,
            request: node.value,
            id: (0, _RequestTracker.generateRequestId)(type, node.value)
          };
        }

      case 'dependency':
        {
          let type = 'dep_path_request';
          return {
            type,
            request: node.value,
            id: (0, _RequestTracker.generateRequestId)(type, node.value)
          };
        }

      case 'asset_group':
        {
          let type = 'asset_request';
          return {
            type,
            request: node.value,
            id: (0, _RequestTracker.generateRequestId)(type, node.value)
          };
        }
    }
  }

  handleNodeRemovedFromAssetGraph(node) {
    let request = this.getCorrespondingRequest(node);

    if (request != null && this.requestTracker.isTracked(request.id)) {
      this.requestTracker.untrackRequest(request.id);
    }
  }

  respondToFSEvents(events) {
    return this.requestGraph.respondToFSEvents(events);
  }

  getWatcherOptions() {
    let vcsDirs = ['.git', '.hg'].map(dir => _path.default.join(this.options.projectRoot, dir));
    let ignore = [this.options.cacheDir, ...vcsDirs];
    return {
      ignore
    };
  }

  getCacheKeys() {
    let assetGraphKey = (0, _utils.md5FromString)(`${this.cacheKey}:assetGraph`);
    let requestGraphKey = (0, _utils.md5FromString)(`${this.cacheKey}:requestGraph`);
    let snapshotKey = (0, _utils.md5FromString)(`${this.cacheKey}:snapshot`);
    return {
      assetGraphKey,
      requestGraphKey,
      snapshotKey
    };
  }

  async readFromCache() {
    if (this.options.disableCache) {
      return null;
    }

    let {
      assetGraphKey,
      requestGraphKey,
      snapshotKey
    } = this.getCacheKeys();
    let assetGraph = await this.options.cache.get(assetGraphKey);
    let requestGraph = await this.options.cache.get(requestGraphKey);

    if (assetGraph && requestGraph) {
      this.assetGraph = assetGraph;
      this.requestGraph = requestGraph;
      let opts = this.getWatcherOptions();

      let snapshotPath = this.options.cache._getCachePath(snapshotKey, '.txt');

      return this.options.inputFS.getEventsSince(this.options.projectRoot, snapshotPath, opts);
    }

    return null;
  }

  async writeToCache() {
    if (this.options.disableCache) {
      return;
    }

    let {
      assetGraphKey,
      requestGraphKey,
      snapshotKey
    } = this.getCacheKeys();
    await this.options.cache.set(assetGraphKey, this.assetGraph);
    await this.options.cache.set(requestGraphKey, this.requestGraph);
    let opts = this.getWatcherOptions();

    let snapshotPath = this.options.cache._getCachePath(snapshotKey, '.txt');

    await this.options.inputFS.writeSnapshot(this.options.projectRoot, snapshotPath, opts);
  }

}

exports.default = AssetGraphBuilder;