"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assetToAssetValue = assetToAssetValue;
exports.mutableAssetToUncommittedAsset = mutableAssetToUncommittedAsset;
exports.assetFromValue = assetFromValue;
exports.MutableAsset = exports.Asset = void 0;

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _Environment = _interopRequireDefault(require("./Environment"));

var _Dependency = _interopRequireDefault(require("./Dependency"));

var _Symbols = require("./Symbols");

var _UncommittedAsset = _interopRequireDefault(require("../UncommittedAsset"));

var _CommittedAsset = _interopRequireDefault(require("../CommittedAsset"));

var _Environment2 = require("../Environment");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

const inspect = Symbol.for('nodejs.util.inspect.custom');
const assetValueToAsset = new WeakMap();
const assetValueToMutableAsset = new WeakMap();

const _assetToAssetValue = new WeakMap();

const _mutableAssetToUncommittedAsset = new WeakMap();

function assetToAssetValue(asset) {
  return (0, _nullthrows.default)(_assetToAssetValue.get(asset));
}

function mutableAssetToUncommittedAsset(mutableAsset) {
  return (0, _nullthrows.default)(_mutableAssetToUncommittedAsset.get(mutableAsset));
}

function assetFromValue(value, options) {
  return new Asset(value.committed ? new _CommittedAsset.default(value, options) : new _UncommittedAsset.default({
    value,
    options
  }));
}

class BaseAsset {
  // CommittedAsset | UncommittedAsset
  constructor(asset) {
    _asset.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _asset, asset);

    _assetToAssetValue.set(this, asset.value);
  } // $FlowFixMe


  [inspect]() {
    return `Asset(${this.filePath})`;
  }

  get id() {
    return _classPrivateFieldGet(this, _asset).value.id;
  }

  get type() {
    return _classPrivateFieldGet(this, _asset).value.type;
  }

  get env() {
    return new _Environment.default(_classPrivateFieldGet(this, _asset).value.env);
  }

  get fs() {
    return _classPrivateFieldGet(this, _asset).options.inputFS;
  }

  get filePath() {
    return _classPrivateFieldGet(this, _asset).value.filePath;
  }

  get meta() {
    return _classPrivateFieldGet(this, _asset).value.meta;
  }

  get isIsolated() {
    return _classPrivateFieldGet(this, _asset).value.isIsolated;
  }

  get isInline() {
    return _classPrivateFieldGet(this, _asset).value.isInline;
  }

  get isSplittable() {
    return _classPrivateFieldGet(this, _asset).value.isSplittable;
  }

  get isSource() {
    return _classPrivateFieldGet(this, _asset).value.isSource;
  }

  get sideEffects() {
    return _classPrivateFieldGet(this, _asset).value.sideEffects;
  }

  get symbols() {
    return new _Symbols.Symbols(_classPrivateFieldGet(this, _asset).value);
  }

  get uniqueKey() {
    return _classPrivateFieldGet(this, _asset).value.uniqueKey;
  }

  get astGenerator() {
    return _classPrivateFieldGet(this, _asset).value.astGenerator;
  }

  getConfig(filePaths, options) {
    return _classPrivateFieldGet(this, _asset).getConfig(filePaths, options);
  }

  getIncludedFiles() {
    return _classPrivateFieldGet(this, _asset).getIncludedFiles();
  }

  getDependencies() {
    return _classPrivateFieldGet(this, _asset).getDependencies().map(dep => new _Dependency.default(dep));
  }

  getPackage() {
    return _classPrivateFieldGet(this, _asset).getPackage();
  }

  getCode() {
    return _classPrivateFieldGet(this, _asset).getCode();
  }

  getBuffer() {
    return _classPrivateFieldGet(this, _asset).getBuffer();
  }

  getStream() {
    return _classPrivateFieldGet(this, _asset).getStream();
  }

  getMap() {
    return _classPrivateFieldGet(this, _asset).getMap();
  }

  getAST() {
    return _classPrivateFieldGet(this, _asset).getAST();
  }

  getMapBuffer() {
    return _classPrivateFieldGet(this, _asset).getMapBuffer();
  }

}

var _asset = new WeakMap();

class Asset extends BaseAsset {
  // InternalAsset
  constructor(asset) {
    let existing = assetValueToAsset.get(asset.value);

    if (existing != null) {
      return existing;
    }

    super(asset);

    _asset2.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _asset2, asset);

    assetValueToAsset.set(asset.value, this);
  }

  get stats() {
    return _classPrivateFieldGet(this, _asset2).value.stats;
  }

}

exports.Asset = Asset;

var _asset2 = new WeakMap();

class MutableAsset extends BaseAsset {
  // InternalAsset
  constructor(asset) {
    let existing = assetValueToMutableAsset.get(asset.value);

    if (existing != null) {
      return existing;
    }

    super(asset);

    _asset3.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _asset3, asset);

    assetValueToMutableAsset.set(asset.value, this);

    _mutableAssetToUncommittedAsset.set(this, asset);
  }

  setMap(map) {
    _classPrivateFieldGet(this, _asset3).setMap(map);
  }

  get type() {
    return _classPrivateFieldGet(this, _asset3).value.type;
  }

  set type(type) {
    _classPrivateFieldGet(this, _asset3).value.type = type;
  }

  get isIsolated() {
    return _classPrivateFieldGet(this, _asset3).value.isIsolated;
  }

  set isIsolated(isIsolated) {
    _classPrivateFieldGet(this, _asset3).value.isIsolated = isIsolated;
  }

  get isInline() {
    return _classPrivateFieldGet(this, _asset3).value.isInline;
  }

  set isInline(isInline) {
    _classPrivateFieldGet(this, _asset3).value.isInline = isInline;
  }

  get isSplittable() {
    return _classPrivateFieldGet(this, _asset3).value.isSplittable;
  }

  set isSplittable(isSplittable) {
    _classPrivateFieldGet(this, _asset3).value.isSplittable = isSplittable;
  }

  get symbols() {
    return new _Symbols.MutableAssetSymbols(_classPrivateFieldGet(this, _asset3).value);
  }

  addDependency(dep) {
    return _classPrivateFieldGet(this, _asset3).addDependency(dep);
  }

  addIncludedFile(file) {
    _classPrivateFieldGet(this, _asset3).addIncludedFile(file);
  }

  isASTDirty() {
    return _classPrivateFieldGet(this, _asset3).isASTDirty;
  }

  setBuffer(buffer) {
    _classPrivateFieldGet(this, _asset3).setBuffer(buffer);
  }

  setCode(code) {
    _classPrivateFieldGet(this, _asset3).setCode(code);
  }

  setStream(stream) {
    _classPrivateFieldGet(this, _asset3).setStream(stream);
  }

  setAST(ast) {
    return _classPrivateFieldGet(this, _asset3).setAST(ast);
  }

  addURLDependency(url, opts) {
    return this.addDependency({
      moduleSpecifier: url,
      isURL: true,
      isAsync: true,
      // The browser has native loaders for url dependencies
      ...opts
    });
  }

  setEnvironment(env) {
    _classPrivateFieldGet(this, _asset3).value.env = (0, _Environment2.createEnvironment)(env);
  }

}

exports.MutableAsset = MutableAsset;

var _asset3 = new WeakMap();