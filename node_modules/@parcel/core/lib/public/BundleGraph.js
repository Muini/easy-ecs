"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bundleGraphToInternalBundleGraph = bundleGraphToInternalBundleGraph;
exports.default = void 0;

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _Asset = require("./Asset");

var _Bundle = require("./Bundle");

var _Dependency = _interopRequireWildcard(require("./Dependency"));

var _Graph = require("../Graph");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

// Friendly access for other modules within this package that need access
// to the internal bundle.
const _bundleGraphToInternalBundleGraph = new WeakMap();

function bundleGraphToInternalBundleGraph(bundleGraph) {
  return (0, _nullthrows.default)(_bundleGraphToInternalBundleGraph.get(bundleGraph));
}

class BundleGraph {
  // This is invoked as `this.#createBundle.call(null, ...)` below, as private
  // properties aren't currently callable in Flow:
  // https://github.com/parcel-bundler/parcel/pull/4591#discussion_r422661115
  // https://github.com/facebook/flow/issues/7877
  constructor(graph, createBundle, options) {
    _graph.set(this, {
      writable: true,
      value: void 0
    });

    _options.set(this, {
      writable: true,
      value: void 0
    });

    _createBundle.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _graph, graph);

    _classPrivateFieldSet(this, _options, options);

    _classPrivateFieldSet(this, _createBundle, createBundle); // $FlowFixMe


    _bundleGraphToInternalBundleGraph.set(this, graph);
  }

  isDependencyDeferred(dep) {
    return _classPrivateFieldGet(this, _graph).isDependencyDeferred((0, _Dependency.dependencyToInternalDependency)(dep));
  }

  getDependencyResolution(dep, bundle) {
    let resolution = _classPrivateFieldGet(this, _graph).getDependencyResolution((0, _Dependency.dependencyToInternalDependency)(dep), bundle && (0, _Bundle.bundleToInternalBundle)(bundle));

    if (resolution) {
      return (0, _Asset.assetFromValue)(resolution, _classPrivateFieldGet(this, _options));
    }
  }

  getIncomingDependencies(asset) {
    return _classPrivateFieldGet(this, _graph).getIncomingDependencies((0, _Asset.assetToAssetValue)(asset)).map(dep => new _Dependency.default(dep));
  }

  getBundleGroupsContainingBundle(bundle) {
    return _classPrivateFieldGet(this, _graph).getBundleGroupsContainingBundle((0, _Bundle.bundleToInternalBundle)(bundle));
  }

  getSiblingBundles(bundle) {
    return _classPrivateFieldGet(this, _graph).getSiblingBundles((0, _Bundle.bundleToInternalBundle)(bundle)).map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)));
  }

  getReferencedBundles(bundle) {
    return _classPrivateFieldGet(this, _graph).getReferencedBundles((0, _Bundle.bundleToInternalBundle)(bundle)).map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)));
  }

  resolveExternalDependency(dependency, bundle) {
    let resolved = _classPrivateFieldGet(this, _graph).resolveExternalDependency((0, _Dependency.dependencyToInternalDependency)(dependency), bundle && (0, _Bundle.bundleToInternalBundle)(bundle));

    if (resolved == null) {
      return;
    } else if (resolved.type === 'bundle_group') {
      return resolved;
    }

    return {
      type: 'asset',
      value: (0, _Asset.assetFromValue)(resolved.value, _classPrivateFieldGet(this, _options))
    };
  }

  getDependencies(asset) {
    return _classPrivateFieldGet(this, _graph).getDependencies((0, _Asset.assetToAssetValue)(asset)).map(dep => new _Dependency.default(dep));
  }

  isAssetReachableFromBundle(asset, bundle) {
    return _classPrivateFieldGet(this, _graph).isAssetReachableFromBundle((0, _Asset.assetToAssetValue)(asset), (0, _Bundle.bundleToInternalBundle)(bundle));
  }

  findReachableBundleWithAsset(bundle, asset) {
    let result = _classPrivateFieldGet(this, _graph).findReachableBundleWithAsset((0, _Bundle.bundleToInternalBundle)(bundle), (0, _Asset.assetToAssetValue)(asset));

    if (result != null) {
      return _classPrivateFieldGet(this, _createBundle).call(null, result, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options));
    }

    return null;
  }

  isAssetReferenced(asset) {
    return _classPrivateFieldGet(this, _graph).isAssetReferenced((0, _Asset.assetToAssetValue)(asset));
  }

  isAssetReferencedByDependant(bundle, asset) {
    return _classPrivateFieldGet(this, _graph).isAssetReferencedByDependant((0, _Bundle.bundleToInternalBundle)(bundle), (0, _Asset.assetToAssetValue)(asset));
  }

  hasParentBundleOfType(bundle, type) {
    return _classPrivateFieldGet(this, _graph).hasParentBundleOfType((0, _Bundle.bundleToInternalBundle)(bundle), type);
  }

  getBundlesInBundleGroup(bundleGroup) {
    return _classPrivateFieldGet(this, _graph).getBundlesInBundleGroup(bundleGroup).sort((a, b) => bundleGroup.bundleIds.indexOf(a.id) - bundleGroup.bundleIds.indexOf(b.id)).map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options))).reverse();
  }

  getBundles() {
    return _classPrivateFieldGet(this, _graph).getBundles().map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)));
  }

  getChildBundles(bundle) {
    return _classPrivateFieldGet(this, _graph).getChildBundles((0, _Bundle.bundleToInternalBundle)(bundle)).map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)));
  }

  getParentBundles(bundle) {
    return _classPrivateFieldGet(this, _graph).getParentBundles((0, _Bundle.bundleToInternalBundle)(bundle)).map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)));
  }

  resolveSymbol(asset, symbol, boundary) {
    let res = _classPrivateFieldGet(this, _graph).resolveSymbol((0, _Asset.assetToAssetValue)(asset), symbol, boundary ? (0, _Bundle.bundleToInternalBundle)(boundary) : null);

    return {
      asset: (0, _Asset.assetFromValue)(res.asset, _classPrivateFieldGet(this, _options)),
      exportSymbol: res.exportSymbol,
      symbol: res.symbol,
      loc: res.loc
    };
  }

  getExportedSymbols(asset) {
    let res = _classPrivateFieldGet(this, _graph).getExportedSymbols((0, _Asset.assetToAssetValue)(asset));

    return res.map(e => ({
      asset: (0, _Asset.assetFromValue)(e.asset, _classPrivateFieldGet(this, _options)),
      exportSymbol: e.exportSymbol,
      symbol: e.symbol,
      loc: e.loc,
      exportAs: e.exportAs
    }));
  }

  traverseBundles(visit, startBundle) {
    return _classPrivateFieldGet(this, _graph).traverseBundles((0, _Graph.mapVisitor)(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)), visit), startBundle == null ? undefined : (0, _Bundle.bundleToInternalBundle)(startBundle));
  }

  findBundlesWithAsset(asset) {
    return _classPrivateFieldGet(this, _graph).findBundlesWithAsset((0, _Asset.assetToAssetValue)(asset)).map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)));
  }

  findBundlesWithDependency(dependency) {
    return _classPrivateFieldGet(this, _graph).findBundlesWithDependency((0, _Dependency.dependencyToInternalDependency)(dependency)).map(bundle => _classPrivateFieldGet(this, _createBundle).call(null, bundle, _classPrivateFieldGet(this, _graph), _classPrivateFieldGet(this, _options)));
  }

}

exports.default = BundleGraph;

var _graph = new WeakMap();

var _options = new WeakMap();

var _createBundle = new WeakMap();