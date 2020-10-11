"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDependency = createDependency;
exports.mergeDependencies = mergeDependencies;

var _utils = require("@parcel/utils");

var _Environment = require("./Environment");

function createDependency(opts) {
  var _opts$isAsync, _opts$isEntry, _opts$isOptional, _opts$isURL;

  let id = opts.id || (0, _utils.md5FromObject)({
    sourceAssetId: opts.sourceAssetId,
    moduleSpecifier: opts.moduleSpecifier,
    env: (0, _Environment.getEnvironmentHash)(opts.env),
    target: opts.target,
    pipeline: opts.pipeline
  });
  return { ...opts,
    id,
    isAsync: (_opts$isAsync = opts.isAsync) !== null && _opts$isAsync !== void 0 ? _opts$isAsync : false,
    isEntry: (_opts$isEntry = opts.isEntry) !== null && _opts$isEntry !== void 0 ? _opts$isEntry : false,
    isOptional: (_opts$isOptional = opts.isOptional) !== null && _opts$isOptional !== void 0 ? _opts$isOptional : false,
    isURL: (_opts$isURL = opts.isURL) !== null && _opts$isURL !== void 0 ? _opts$isURL : false,
    meta: opts.meta || {},
    symbols: opts.symbols || new Map()
  };
}

function mergeDependencies(a, b) {
  var _a$isWeak;

  let {
    meta,
    symbols,
    isWeak,
    ...other
  } = b;
  Object.assign(a, other);
  Object.assign(a.meta, meta);
  a.isWeak = a.isWeak === isWeak ? a.isWeak : (_a$isWeak = a.isWeak) !== null && _a$isWeak !== void 0 ? _a$isWeak : isWeak;

  for (let [k, v] of symbols) {
    a.symbols.set(k, v);
  }
}