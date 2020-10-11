"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEnvironment = createEnvironment;
exports.mergeEnvironments = mergeEnvironments;
exports.getEnvironmentHash = getEnvironmentHash;

var _utils = require("@parcel/utils");

const DEFAULT_ENGINES = {
  browsers: ['> 0.25%'],
  node: '>= 8.0.0'
};

function createEnvironment({
  context,
  engines,
  includeNodeModules,
  outputFormat,
  minify = false,
  isLibrary = false,
  scopeHoist = false
} = {}) {
  if (context == null) {
    var _engines, _engines2;

    if ((_engines = engines) === null || _engines === void 0 ? void 0 : _engines.node) {
      context = 'node';
    } else if ((_engines2 = engines) === null || _engines2 === void 0 ? void 0 : _engines2.browsers) {
      context = 'browser';
    } else {
      context = 'browser';
    }
  }

  if (engines == null) {
    switch (context) {
      case 'node':
      case 'electron-main':
        engines = {
          node: DEFAULT_ENGINES.node
        };
        break;

      case 'browser':
      case 'web-worker':
      case 'service-worker':
      case 'electron-renderer':
        engines = {
          browsers: DEFAULT_ENGINES.browsers
        };
        break;

      default:
        engines = {};
    }
  }

  if (includeNodeModules == null) {
    switch (context) {
      case 'node':
      case 'electron-main':
      case 'electron-renderer':
        includeNodeModules = false;
        break;

      case 'browser':
      case 'web-worker':
      case 'service-worker':
      default:
        includeNodeModules = true;
        break;
    }
  }

  if (outputFormat == null) {
    switch (context) {
      case 'node':
      case 'electron-main':
      case 'electron-renderer':
        outputFormat = 'commonjs';
        break;

      default:
        outputFormat = 'global';
        break;
    }
  }

  return {
    context,
    engines,
    includeNodeModules,
    outputFormat,
    isLibrary,
    minify,
    scopeHoist
  };
}

function mergeEnvironments(a, b) {
  // If merging the same object, avoid copying.
  if (a === b) {
    return a;
  }

  return createEnvironment({ ...a,
    ...b
  });
}

function getEnvironmentHash(env) {
  // context is excluded from hash so that assets can be shared between e.g. workers and browser.
  // Different engines should be sufficient to distinguish multi-target builds.
  return (0, _utils.md5FromObject)({
    engines: env.engines,
    includeNodeModules: env.includeNodeModules,
    outputFormat: env.outputFormat,
    isLibrary: env.isLibrary
  });
}