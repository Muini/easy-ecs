"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bundleToInternalBundle = bundleToInternalBundle;
exports.bundleToInternalBundleGraph = bundleToInternalBundleGraph;
exports.NamedBundle = exports.Bundle = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _utils = require("@parcel/utils");

var _Asset = require("./Asset");

var _Graph = require("../Graph");

var _Environment = _interopRequireDefault(require("./Environment"));

var _Dependency = _interopRequireDefault(require("./Dependency"));

var _Target = _interopRequireDefault(require("./Target"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

const internalBundleToBundle = new _utils.DefaultWeakMap(() => new _utils.DefaultWeakMap(() => new WeakMap()));
const internalBundleToNamedBundle = new _utils.DefaultWeakMap(() => new _utils.DefaultWeakMap(() => new WeakMap())); // Friendly access for other modules within this package that need access
// to the internal bundle.

const _bundleToInternalBundle = new WeakMap();

function bundleToInternalBundle(bundle) {
  return (0, _nullthrows.default)(_bundleToInternalBundle.get(bundle));
}

const _bundleToInternalBundleGraph = new WeakMap();

function bundleToInternalBundleGraph(bundle) {
  return (0, _nullthrows.default)(_bundleToInternalBundleGraph.get(bundle));
}

class Bundle {
  // InternalBundle
  // BundleGraph
  // ParcelOptions
  constructor(bundle, bundleGraph, options) {
    _bundle.set(this, {
      writable: true,
      value: void 0
    });

    _bundleGraph.set(this, {
      writable: true,
      value: void 0
    });

    _options.set(this, {
      writable: true,
      value: void 0
    });

    let existingMap = internalBundleToBundle.get(options).get(bundleGraph);
    let existing = existingMap.get(bundle);

    if (existing != null) {
      return existing;
    }

    _classPrivateFieldSet(this, _bundle, bundle);

    _classPrivateFieldSet(this, _bundleGraph, bundleGraph);

    _classPrivateFieldSet(this, _options, options);

    _bundleToInternalBundle.set(this, bundle);

    _bundleToInternalBundleGraph.set(this, bundleGraph);

    existingMap.set(bundle, this);
  }

  get id() {
    return _classPrivateFieldGet(this, _bundle).id;
  }

  get hashReference() {
    return _classPrivateFieldGet(this, _bundle).hashReference;
  }

  get type() {
    return _classPrivateFieldGet(this, _bundle).type;
  }

  get env() {
    return new _Environment.default(_classPrivateFieldGet(this, _bundle).env);
  }

  get isEntry() {
    return _classPrivateFieldGet(this, _bundle).isEntry;
  }

  get isInline() {
    return _classPrivateFieldGet(this, _bundle).isInline;
  }

  get isSplittable() {
    return _classPrivateFieldGet(this, _bundle).isSplittable;
  }

  get target() {
    return new _Target.default(_classPrivateFieldGet(this, _bundle).target);
  }

  get filePath() {
    return _classPrivateFieldGet(this, _bundle).filePath;
  }

  get name() {
    return _classPrivateFieldGet(this, _bundle).name;
  }

  get stats() {
    return _classPrivateFieldGet(this, _bundle).stats;
  }

  hasAsset(asset) {
    return _classPrivateFieldGet(this, _bundleGraph).bundleHasAsset(_classPrivateFieldGet(this, _bundle), (0, _Asset.assetToAssetValue)(asset));
  }

  getEntryAssets() {
    return _classPrivateFieldGet(this, _bundle).entryAssetIds.map(id => {
      let assetNode = _classPrivateFieldGet(this, _bundleGraph)._graph.getNode(id);

      (0, _assert.default)(assetNode != null && assetNode.type === 'asset');
      return (0, _Asset.assetFromValue)(assetNode.value, _classPrivateFieldGet(this, _options));
    });
  }

  getMainEntry() {
    // The main entry is the last one to execute
    return this.getEntryAssets().pop();
  }

  traverse(visit) {
    return _classPrivateFieldGet(this, _bundleGraph).traverseBundle(_classPrivateFieldGet(this, _bundle), (0, _Graph.mapVisitor)(node => {
      if (node.type === 'asset') {
        return {
          type: 'asset',
          value: (0, _Asset.assetFromValue)(node.value, _classPrivateFieldGet(this, _options))
        };
      } else if (node.type === 'dependency') {
        return {
          type: 'dependency',
          value: new _Dependency.default(node.value)
        };
      }
    }, visit));
  }

  traverseAssets(visit) {
    return _classPrivateFieldGet(this, _bundleGraph).traverseAssets(_classPrivateFieldGet(this, _bundle), (0, _Graph.mapVisitor)(asset => (0, _Asset.assetFromValue)(asset, _classPrivateFieldGet(this, _options)), visit));
  }

}

exports.Bundle = Bundle;

var _bundle = new WeakMap();

var _bundleGraph = new WeakMap();

var _options = new WeakMap();

class NamedBundle extends Bundle {
  // InternalBundle
  // BundleGraph
  constructor(bundle, bundleGraph, options) {
    let existingMap = internalBundleToNamedBundle.get(options).get(bundleGraph);
    let existing = existingMap.get(bundle);

    if (existing != null) {
      return existing;
    }

    super(bundle, bundleGraph, options);

    _bundle2.set(this, {
      writable: true,
      value: void 0
    });

    _bundleGraph2.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _bundle2, bundle); // Repeating for flow


    _classPrivateFieldSet(this, _bundleGraph2, bundleGraph); // Repeating for flow


    existingMap.set(bundle, this);
  }

  get filePath() {
    return (0, _nullthrows.default)(_classPrivateFieldGet(this, _bundle2).filePath);
  }

  get name() {
    return (0, _nullthrows.default)(_classPrivateFieldGet(this, _bundle2).name);
  }

  get displayName() {
    return (0, _nullthrows.default)(_classPrivateFieldGet(this, _bundle2).displayName);
  }

}

exports.NamedBundle = NamedBundle;

var _bundle2 = new WeakMap();

var _bundleGraph2 = new WeakMap();