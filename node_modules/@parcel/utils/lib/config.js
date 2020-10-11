"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveConfig = resolveConfig;
exports.resolveConfigSync = resolveConfigSync;
exports.loadConfig = loadConfig;

var _path = _interopRequireDefault(require("path"));

var _clone = _interopRequireDefault(require("clone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PARSERS = {
  json: require('json5').parse,
  toml: require('@iarna/toml').parse
};

async function resolveConfig(fs, filepath, filenames, opts, root = _path.default.parse(filepath).root) {
  filepath = await fs.realpath(_path.default.dirname(filepath)); // Don't traverse above the module root

  if (_path.default.basename(filepath) === 'node_modules') {
    return null;
  }

  for (const filename of filenames) {
    let file = _path.default.join(filepath, filename);

    if ((await fs.exists(file)) && (await fs.stat(file)).isFile()) {
      return file;
    }
  }

  if (filepath === root) {
    return null;
  }

  return resolveConfig(fs, filepath, filenames, opts);
}

function resolveConfigSync(fs, filepath, filenames, opts, root = _path.default.parse(filepath).root) {
  filepath = fs.realpathSync(_path.default.dirname(filepath)); // Don't traverse above the module root

  if (filepath === root || _path.default.basename(filepath) === 'node_modules') {
    return null;
  }

  for (const filename of filenames) {
    let file = _path.default.join(filepath, filename);

    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return file;
    }
  }

  return resolveConfigSync(fs, filepath, filenames, opts);
}

async function loadConfig(fs, filepath, filenames, opts) {
  let configFile = await resolveConfig(fs, filepath, filenames, opts);

  if (configFile) {
    try {
      let extname = _path.default.extname(configFile).slice(1);

      if (extname === 'js') {
        return {
          // $FlowFixMe
          config: (0, _clone.default)(require(configFile)),
          files: [{
            filePath: configFile
          }]
        };
      }

      let configContent = await fs.readFile(configFile, 'utf8');

      if (!configContent) {
        return null;
      }

      let config;

      if (opts && opts.parse === false) {
        config = configContent;
      } else {
        let parse = PARSERS[extname] || PARSERS.json;
        config = parse(configContent);
      }

      return {
        config: config,
        files: [{
          filePath: configFile
        }]
      };
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND' || err.code === 'ENOENT') {
        return null;
      }

      throw err;
    }
  }

  return null;
}