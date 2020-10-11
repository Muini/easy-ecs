"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("@parcel/utils");

var _logger = require("@parcel/logger");

var _sourceMap = require("@parcel/source-map");

var _diagnostic = _interopRequireWildcard(require("@parcel/diagnostic"));

var _stream = require("stream");

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _path = _interopRequireDefault(require("path"));

var _url = _interopRequireDefault(require("url"));

var _crypto = _interopRequireDefault(require("crypto"));

var _Bundle = require("./public/Bundle");

var _BundleGraph = _interopRequireWildcard(require("./public/BundleGraph"));

var _PluginOptions = _interopRequireDefault(require("./public/PluginOptions"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const BOUNDARY_LENGTH = _constants.HASH_REF_PREFIX.length + 32 - 1;

class PackagerRunner {
  constructor({
    config,
    configRef,
    farm,
    options,
    optionsRef,
    report
  }) {
    _defineProperty(this, "config", void 0);

    _defineProperty(this, "configRef", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "optionsRef", void 0);

    _defineProperty(this, "farm", void 0);

    _defineProperty(this, "pluginOptions", void 0);

    _defineProperty(this, "distDir", void 0);

    _defineProperty(this, "distExists", void 0);

    _defineProperty(this, "report", void 0);

    _defineProperty(this, "getBundleInfoFromWorker", void 0);

    this.config = config;
    this.configRef = configRef;
    this.options = options;
    this.optionsRef = optionsRef;
    this.pluginOptions = new _PluginOptions.default(this.options);
    this.farm = farm;
    this.report = report;
    this.getBundleInfoFromWorker = farm ? farm.createHandle('runPackage') : () => {
      throw new Error('Cannot call PackagerRunner.writeBundleFromWorker() in a worker');
    };
  }

  async writeBundles(bundleGraph) {
    let farm = (0, _nullthrows.default)(this.farm);
    let {
      ref,
      dispose
    } = await farm.createSharedReference(bundleGraph);
    let bundleInfoMap = {};
    let writeEarlyPromises = {};
    let hashRefToNameHash = new Map(); // skip inline bundles, they will be processed via the parent bundle

    let bundles = bundleGraph.getBundles().filter(bundle => !bundle.isInline);
    await Promise.all(bundles.map(async bundle => {
      let info = await this.processBundle(bundle, bundleGraph, ref);
      bundleInfoMap[bundle.id] = info;

      if (!info.hashReferences.length) {
        hashRefToNameHash.set(bundle.hashReference, info.hash.slice(-8));
        writeEarlyPromises[bundle.id] = this.writeToDist({
          bundle,
          info,
          hashRefToNameHash,
          bundleGraph
        });
      }
    }));
    assignComplexNameHashes(hashRefToNameHash, bundles, bundleInfoMap);
    await Promise.all(bundles.map(bundle => {
      var _writeEarlyPromises$b;

      return (_writeEarlyPromises$b = writeEarlyPromises[bundle.id]) !== null && _writeEarlyPromises$b !== void 0 ? _writeEarlyPromises$b : this.writeToDist({
        bundle,
        info: bundleInfoMap[bundle.id],
        hashRefToNameHash,
        bundleGraph
      });
    }));
    await dispose();
  }

  async processBundle(bundle, bundleGraph, bundleGraphReference) {
    var _await$this$getBundle;

    let start = Date.now();
    let cacheKey = await this.getCacheKey(bundle, bundleGraph);
    let cacheKeys = {
      content: getContentKey(cacheKey),
      map: getMapKey(cacheKey),
      info: getInfoKey(cacheKey)
    };
    let {
      hash,
      hashReferences
    } = (_await$this$getBundle = await this.getBundleInfoFromCache(cacheKeys.info)) !== null && _await$this$getBundle !== void 0 ? _await$this$getBundle : await this.getBundleInfoFromWorker({
      bundle,
      bundleGraphReference,
      cacheKeys,
      optionsRef: (0, _nullthrows.default)(this.optionsRef),
      configRef: (0, _nullthrows.default)(this.configRef)
    });
    return {
      time: Date.now() - start,
      hash,
      hashReferences,
      cacheKeys
    };
  }

  getBundleInfoFromCache(infoKey) {
    if (this.options.disableCache) {
      return;
    }

    return this.options.cache.get(infoKey);
  }

  async getBundleInfo(bundle, bundleGraph, cacheKeys) {
    let {
      contents,
      map
    } = await this.getBundleResult(bundle, bundleGraph);
    return this.writeToCache(cacheKeys, contents, map);
  }

  async getBundleResult(bundle, bundleGraph) {
    await _sourceMap.init;
    let packaged = await this.package(bundle, bundleGraph);
    let res = await this.optimize(bundle, bundleGraph, packaged.contents, packaged.map);
    let map = res.map ? await this.generateSourceMap(bundle, res.map) : null;
    return {
      contents: res.contents,
      map
    };
  }

  getSourceMapReference(bundle, map) {
    if (map && this.options.sourceMaps) {
      if (bundle.isInline || bundle.target.sourceMap && bundle.target.sourceMap.inline) {
        return this.generateSourceMap((0, _Bundle.bundleToInternalBundle)(bundle), map);
      } else {
        return _path.default.basename(bundle.filePath) + '.map';
      }
    } else {
      return null;
    }
  }

  async package(internalBundle, bundleGraph) {
    let bundle = new _Bundle.NamedBundle(internalBundle, bundleGraph, this.options);
    this.report({
      type: 'buildProgress',
      phase: 'packaging',
      bundle
    });
    let packager = await this.config.getPackager(bundle.filePath);

    try {
      return await packager.plugin.package({
        bundle,
        bundleGraph: new _BundleGraph.default(bundleGraph, (bundle, bundleGraph, options) => new _Bundle.NamedBundle(bundle, bundleGraph, options), this.options),
        getSourceMapReference: map => {
          return this.getSourceMapReference(bundle, map);
        },
        options: this.pluginOptions,
        logger: new _logger.PluginLogger({
          origin: packager.name
        }),
        getInlineBundleContents: async (bundle, bundleGraph) => {
          if (!bundle.isInline) {
            throw new Error('Bundle is not inline and unable to retrieve contents');
          }

          let res = await this.getBundleResult((0, _Bundle.bundleToInternalBundle)(bundle), // $FlowFixMe
          (0, _BundleGraph.bundleGraphToInternalBundleGraph)(bundleGraph));
          return {
            contents: res.contents
          };
        }
      });
    } catch (e) {
      throw new _diagnostic.default({
        diagnostic: (0, _diagnostic.errorToDiagnostic)(e, packager.name)
      });
    }
  }

  async optimize(internalBundle, bundleGraph, contents, map) {
    let bundle = new _Bundle.NamedBundle(internalBundle, bundleGraph, this.options);
    let optimizers = await this.config.getOptimizers(bundle.filePath, internalBundle.pipeline);

    if (!optimizers.length) {
      return {
        contents,
        map
      };
    }

    this.report({
      type: 'buildProgress',
      phase: 'optimizing',
      bundle
    });
    let optimized = {
      contents,
      map
    };

    for (let optimizer of optimizers) {
      try {
        optimized = await optimizer.plugin.optimize({
          bundle,
          contents: optimized.contents,
          map: optimized.map,
          getSourceMapReference: map => {
            return this.getSourceMapReference(bundle, map);
          },
          options: this.pluginOptions,
          logger: new _logger.PluginLogger({
            origin: optimizer.name
          })
        });
      } catch (e) {
        throw new _diagnostic.default({
          diagnostic: (0, _diagnostic.errorToDiagnostic)(e, optimizer.name)
        });
      }
    }

    return optimized;
  }

  generateSourceMap(bundle, map) {
    // sourceRoot should be a relative path between outDir and rootDir for node.js targets
    let filePath = (0, _nullthrows.default)(bundle.filePath);

    let sourceRoot = _path.default.relative(_path.default.dirname(filePath), this.options.projectRoot);

    let inlineSources = false;

    if (bundle.target) {
      if (bundle.target.sourceMap && bundle.target.sourceMap.sourceRoot !== undefined) {
        sourceRoot = bundle.target.sourceMap.sourceRoot;
      } else if (this.options.serve && bundle.target.env.context === 'browser') {
        sourceRoot = '/__parcel_source_root';
      }

      if (bundle.target.sourceMap && bundle.target.sourceMap.inlineSources !== undefined) {
        inlineSources = bundle.target.sourceMap.inlineSources;
      } else if (bundle.target.env.context !== 'node') {
        // inlining should only happen in production for browser targets by default
        inlineSources = this.options.mode === 'production';
      }
    }

    let isInlineMap = bundle.isInline || bundle.target.sourceMap && bundle.target.sourceMap.inline; // $FlowFixMe format is never object so it's always a string...

    return map.stringify({
      file: _path.default.basename(filePath + '.map'),
      // $FlowFixMe
      fs: this.options.inputFS,
      rootDir: this.options.projectRoot,
      sourceRoot: !inlineSources ? _url.default.format(_url.default.parse(sourceRoot + '/')) : undefined,
      inlineSources,
      format: isInlineMap ? 'inline' : 'string'
    });
  }

  async getCacheKey(bundle, bundleGraph) {
    let filePath = (0, _nullthrows.default)(bundle.filePath); // TODO: include packagers and optimizers used in inline bundles as well

    let {
      version: packager
    } = await this.config.getPackager(filePath);
    let optimizers = (await this.config.getOptimizers(filePath)).map(({
      name,
      version
    }) => [name, version]); // TODO: add third party configs to the cache key

    let {
      sourceMaps
    } = this.options;
    return (0, _utils.md5FromObject)({
      parcelVersion: _constants.PARCEL_VERSION,
      packager,
      optimizers,
      opts: {
        sourceMaps
      },
      hash: bundleGraph.getHash(bundle)
    });
  }

  async readFromCache(cacheKey) {
    let contentKey = getContentKey(cacheKey);
    let mapKey = getMapKey(cacheKey);
    let contentExists = await this.options.cache.blobExists(contentKey);

    if (!contentExists) {
      return null;
    }

    let mapExists = await this.options.cache.blobExists(mapKey);
    return {
      contents: this.options.cache.getStream(contentKey),
      map: mapExists ? this.options.cache.getStream(mapKey) : null
    };
  }

  async writeToDist({
    bundle,
    bundleGraph,
    info,
    hashRefToNameHash
  }) {
    let {
      inputFS,
      outputFS
    } = this.options;
    let filePath = (0, _nullthrows.default)(bundle.filePath);
    let thisHashReference = bundle.hashReference; // Without content hashing, the hash reference is already the correct id

    if (this.options.contentHash && filePath.includes(thisHashReference)) {
      let thisNameHash = (0, _nullthrows.default)(hashRefToNameHash.get(thisHashReference));
      filePath = filePath.replace(thisHashReference, thisNameHash);
      bundle.filePath = filePath;
      bundle.name = (0, _nullthrows.default)(bundle.name).replace(thisHashReference, thisNameHash);
    }

    let dir = _path.default.dirname(filePath);

    await outputFS.mkdirp(dir); // ? Got rid of dist exists, is this an expensive operation
    // Use the file mode from the entry asset as the file mode for the bundle.
    // Don't do this for browser builds, as the executable bit in particular is unnecessary.

    let publicBundle = new _Bundle.NamedBundle(bundle, bundleGraph, this.options);
    let writeOptions = publicBundle.env.isBrowser() ? undefined : {
      mode: (await inputFS.stat((0, _nullthrows.default)(publicBundle.getMainEntry()).filePath)).mode
    };
    let cacheKeys = info.cacheKeys;
    let contentStream = this.options.cache.getStream(cacheKeys.content);
    let size = await writeFileStream(outputFS, filePath, contentStream, info.hashReferences, hashRefToNameHash, writeOptions);
    bundle.stats = {
      size,
      time: info.time
    };
    let mapKey = cacheKeys.map;

    if ((typeof bundle.target.sourceMap === 'object' ? !bundle.target.sourceMap.inline : bundle.target.sourceMap) && (await this.options.cache.blobExists(mapKey))) {
      let mapStream = this.options.cache.getStream(mapKey);
      await writeFileStream(outputFS, filePath + '.map', mapStream, info.hashReferences, hashRefToNameHash);
    }
  }

  async writeToCache(cacheKeys, contents, map) {
    let size = 0;

    let hash = _crypto.default.createHash('md5');

    let boundaryStr = '';
    let hashReferences = [];
    await this.options.cache.setStream(cacheKeys.content, (0, _utils.blobToStream)(contents).pipe(new _utils.TapStream(buf => {
      var _str$match;

      let str = boundaryStr + buf.toString();
      hashReferences = hashReferences.concat((_str$match = str.match(_constants.HASH_REF_REGEX)) !== null && _str$match !== void 0 ? _str$match : []);
      size += buf.length;
      hash.update(buf);
      boundaryStr = str.slice(str.length - BOUNDARY_LENGTH);
    })));

    if (map != null) {
      await this.options.cache.setStream(cacheKeys.map, (0, _utils.blobToStream)(map));
    }

    let info = {
      size,
      hash: hash.digest('hex'),
      hashReferences
    };
    await this.options.cache.set(cacheKeys.info, info);
    return info;
  }

}

exports.default = PackagerRunner;

function writeFileStream(fs, filePath, stream, hashReferences, hashRefToNameHash, options) {
  return new Promise((resolve, reject) => {
    let initialStream = hashReferences.length ? stream.pipe(replaceStream(hashRefToNameHash)) : stream;
    let fsStream = fs.createWriteStream(filePath, options);
    let fsStreamClosed = new Promise(resolve => {
      fsStream.on('close', () => resolve());
    });
    let bytesWritten = 0;
    initialStream.pipe(new _utils.TapStream(buf => {
      bytesWritten += buf.length;
    })).pipe(fsStream).on('finish', () => resolve(fsStreamClosed.then(() => bytesWritten))).on('error', reject);
  });
}

function replaceStream(hashRefToNameHash) {
  let boundaryStr = '';
  return new _stream.Transform({
    transform(chunk, encoding, cb) {
      let str = boundaryStr + chunk.toString();
      let replaced = str.replace(_constants.HASH_REF_REGEX, match => {
        return hashRefToNameHash.get(match) || match;
      });
      boundaryStr = replaced.slice(replaced.length - BOUNDARY_LENGTH);
      let strUpToBoundary = replaced.slice(0, replaced.length - BOUNDARY_LENGTH);
      cb(null, strUpToBoundary);
    },

    flush(cb) {
      cb(null, boundaryStr);
    }

  });
}

function getContentKey(cacheKey) {
  return (0, _utils.md5FromString)(`${cacheKey}:content`);
}

function getMapKey(cacheKey) {
  return (0, _utils.md5FromString)(`${cacheKey}:map`);
}

function getInfoKey(cacheKey) {
  return (0, _utils.md5FromString)(`${cacheKey}:info`);
}

function assignComplexNameHashes(hashRefToNameHash, bundles, bundleInfoMap) {
  for (let bundle of bundles) {
    if (hashRefToNameHash.get(bundle.hashReference) != null) {
      continue;
    }

    let includedBundles = [...getBundlesIncludedInHash(bundle.id, bundleInfoMap)];
    hashRefToNameHash.set(bundle.hashReference, (0, _utils.md5FromString)(includedBundles.map(bundleId => bundleInfoMap[bundleId].hash).join(':')).slice(-8));
  }
}

function getBundlesIncludedInHash(bundleId, bundleInfoMap, included = new Set()) {
  included.add(bundleId);

  for (let hashRef of bundleInfoMap[bundleId].hashReferences) {
    let referencedId = getIdFromHashRef(hashRef);

    if (!included.has(referencedId)) {
      getBundlesIncludedInHash(referencedId, bundleInfoMap, included);
    }
  }

  return included;
}

function getIdFromHashRef(hashRef) {
  return hashRef.slice(_constants.HASH_REF_PREFIX.length);
}