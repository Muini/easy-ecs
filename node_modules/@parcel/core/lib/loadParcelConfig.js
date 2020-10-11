"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadParcelConfig;
exports.resolveParcelConfig = resolveParcelConfig;
exports.create = create;
exports.readAndProcessConfigChain = readAndProcessConfigChain;
exports.processConfig = processConfig;
exports.processConfigChain = processConfigChain;
exports.resolveExtends = resolveExtends;
exports.validateConfigFile = validateConfigFile;
exports.validateNotEmpty = validateNotEmpty;
exports.mergeConfigs = mergeConfigs;
exports.mergePipelines = mergePipelines;
exports.mergeMaps = mergeMaps;

var _utils = require("@parcel/utils");

var _diagnostic = _interopRequireDefault(require("@parcel/diagnostic"));

var _json = require("json5");

var _path = _interopRequireDefault(require("path"));

var _assert = _interopRequireDefault(require("assert"));

var _ParcelConfig = _interopRequireDefault(require("./ParcelConfig"));

var _ParcelConfig2 = _interopRequireDefault(require("./ParcelConfig.schema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function loadParcelConfig(options) {
  // Resolve plugins from cwd when a config is passed programmatically
  let parcelConfig = options.config ? await create({ ...options.config,
    resolveFrom: options.inputFS.cwd()
  }, options) : await resolveParcelConfig(options);

  if (!parcelConfig && options.defaultConfig) {
    parcelConfig = await create({ ...options.defaultConfig,
      resolveFrom: options.inputFS.cwd()
    }, options);
  }

  if (!parcelConfig) {
    throw new Error('Could not find a .parcelrc');
  }

  return parcelConfig;
}

async function resolveParcelConfig(options) {
  let filePath = getResolveFrom(options);
  let configPath = await (0, _utils.resolveConfig)(options.inputFS, filePath, ['.parcelrc']);

  if (!configPath) {
    return null;
  }

  return readAndProcessConfigChain(configPath, options);
}

function create(config, options) {
  return processConfigChain(config, config.filePath, options);
}

async function readAndProcessConfigChain(configPath, options) {
  let contents = await options.inputFS.readFile(configPath, 'utf8');
  let config;

  try {
    config = (0, _json.parse)(contents);
  } catch (e) {
    let pos = {
      line: e.lineNumber,
      column: e.columnNumber
    };
    throw new _diagnostic.default({
      diagnostic: {
        message: 'Failed to parse .parcelrc',
        origin: '@parcel/core',
        filePath: configPath,
        language: 'json5',
        codeFrame: {
          code: contents,
          codeHighlights: [{
            start: pos,
            end: pos,
            message: e.message
          }]
        }
      }
    });
  }

  return processConfigChain(config, configPath, options);
}

function processPipeline(pipeline, filePath) {
  if (pipeline) {
    return pipeline.map(pkg => {
      if (pkg === '...') return pkg;
      return {
        packageName: pkg,
        resolveFrom: filePath
      };
    });
  }
}

function processMap(map, filePath) {
  if (!map) return undefined;
  let res = {};

  for (let k in map) {
    if (typeof map[k] === 'string') {
      res[k] = {
        packageName: map[k],
        resolveFrom: filePath
      };
    } else {
      res[k] = processPipeline(map[k], filePath);
    }
  }

  return res;
}

function processConfig(configFile) {
  return {
    extends: configFile.extends,
    filePath: configFile.filePath,
    resolveFrom: configFile.resolveFrom,
    resolvers: processPipeline(configFile.resolvers, configFile.filePath),
    transformers: processMap(configFile.transformers, configFile.filePath),
    bundler: configFile.bundler ? {
      packageName: configFile.bundler,
      resolveFrom: configFile.filePath
    } : undefined,
    namers: processPipeline(configFile.namers, configFile.filePath),
    runtimes: processMap(configFile.runtimes, configFile.filePath),
    packagers: processMap(configFile.packagers, configFile.filePath),
    optimizers: processMap(configFile.optimizers, configFile.filePath),
    reporters: processPipeline(configFile.reporters, configFile.filePath),
    validators: processMap(configFile.validators, configFile.filePath)
  };
}

async function processConfigChain(configFile, filePath, options) {
  // Validate config...
  let relativePath = _path.default.relative(options.inputFS.cwd(), filePath);

  validateConfigFile(configFile, relativePath); // Process config...

  let resolvedFile = processConfig({
    filePath,
    ...configFile
  });
  let config = new _ParcelConfig.default(resolvedFile, options.packageManager, options.autoinstall);
  let extendedFiles = [];

  if (configFile.extends) {
    let exts = Array.isArray(configFile.extends) ? configFile.extends : [configFile.extends];

    for (let ext of exts) {
      let resolved = await resolveExtends(ext, filePath, options);
      extendedFiles.push(resolved);
      let {
        extendedFiles: moreExtendedFiles,
        config: baseConfig
      } = await readAndProcessConfigChain(resolved, options);
      extendedFiles = extendedFiles.concat(moreExtendedFiles);
      config = mergeConfigs(baseConfig, resolvedFile);
    }
  }

  return {
    config,
    extendedFiles
  };
}

async function resolveExtends(ext, configPath, options) {
  if (ext.startsWith('.')) {
    return _path.default.resolve(_path.default.dirname(configPath), ext);
  } else {
    let {
      resolved
    } = await (0, _utils.resolve)(options.inputFS, ext, {
      basedir: _path.default.dirname(configPath),
      extensions: ['.json']
    });
    return options.inputFS.realpath(resolved);
  }
}

function validateConfigFile(config, relativePath) {
  validateNotEmpty(config, relativePath);

  _utils.validateSchema.diagnostic(_ParcelConfig2.default, config, relativePath, JSON.stringify(config, null, '\t'), '@parcel/core', '', 'Invalid Parcel Config');
}

function validateNotEmpty(config, relativePath) {
  _assert.default.notDeepStrictEqual(config, {}, `${relativePath} can't be empty`);
}

function mergeConfigs(base, ext) {
  return new _ParcelConfig.default({
    filePath: ext.filePath,
    resolvers: mergePipelines(base.resolvers, ext.resolvers),
    transformers: mergeMaps(base.transformers, ext.transformers, mergePipelines),
    validators: mergeMaps(base.validators, ext.validators, mergePipelines),
    bundler: ext.bundler || base.bundler,
    namers: mergePipelines(base.namers, ext.namers),
    runtimes: mergeMaps(base.runtimes, ext.runtimes, mergePipelines),
    packagers: mergeMaps(base.packagers, ext.packagers),
    optimizers: mergeMaps(base.optimizers, ext.optimizers, mergePipelines),
    reporters: mergePipelines(base.reporters, ext.reporters)
  }, base.packageManager, base.autoinstall);
}

function getResolveFrom(options) {
  let cwd = options.inputFS.cwd();
  let dir = (0, _utils.isDirectoryInside)(cwd, options.projectRoot) ? cwd : options.projectRoot;
  return _path.default.join(dir, 'index');
}

function mergePipelines(base, ext) {
  if (!ext) {
    return base || [];
  }

  if (base) {
    // Merge the base pipeline if a rest element is defined
    let spreadIndex = ext.indexOf('...');

    if (spreadIndex >= 0) {
      if (ext.filter(v => v === '...').length > 1) {
        throw new Error('Only one spread element can be included in a config pipeline');
      }

      ext = [...ext.slice(0, spreadIndex), ...(base || []), ...ext.slice(spreadIndex + 1)];
    }
  }

  return ext;
}

function mergeMaps(base, ext, merger) {
  if (!ext) {
    return base || {};
  }

  if (!base) {
    return ext;
  } // Add the extension options first so they have higher precedence in the output glob map


  let res = {};

  for (let k in ext) {
    // Flow doesn't correctly infer the type. See https://github.com/facebook/flow/issues/1736.
    let key = k;
    res[key] = merger && base[key] ? merger(base[key], ext[key]) : ext[key];
  } // Add base options that aren't defined in the extension


  for (let k in base) {
    let key = k;

    if (!res[key]) {
      res[key] = base[key];
    }
  }

  return res;
}