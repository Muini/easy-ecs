"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Npm = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _crossSpawn = _interopRequireDefault(require("cross-spawn"));

var _logger = _interopRequireDefault(require("@parcel/logger"));

var _promiseFromProcess = _interopRequireDefault(require("./promiseFromProcess"));

var _core = require("@parcel/core");

var _utils = require("./utils");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $FlowFixMe
const NPM_CMD = 'npm';

class Npm {
  async install({
    modules,
    cwd,
    packagePath,
    saveDev = true
  }) {
    // npm doesn't auto-create a package.json when installing,
    // so create an empty one if needed.
    if (packagePath == null) {
      await _fs.default.writeFile(_path.default.join(cwd, 'package.json'), '{}');
    }

    let args = ['install', '--json', saveDev ? '--save-dev' : '--save'].concat(modules.map(_utils.npmSpecifierFromModuleRequest));
    let installProcess = (0, _crossSpawn.default)(NPM_CMD, args, {
      cwd
    });
    let stdout = '';
    installProcess.stdout.on('data', str => {
      stdout += str;
    });
    let stderr = [];
    installProcess.stderr.on('data', str => {
      stderr.push(str);
    });

    try {
      await (0, _promiseFromProcess.default)(installProcess);
      let results = JSON.parse(stdout);
      let addedCount = results.added.length;

      if (addedCount > 0) {
        _logger.default.log({
          origin: '@parcel/package-manager',
          message: `Added ${addedCount} packages via npm`
        });
      } // Since we succeeded, stderr might have useful information not included
      // in the json written to stdout. It's also not necessary to log these as
      // errors as they often aren't.


      for (let message of stderr) {
        _logger.default.log({
          origin: '@parcel/package-manager',
          message
        });
      }
    } catch (e) {
      throw new Error('npm failed to install modules');
    }
  }

}

exports.Npm = Npm;
(0, _core.registerSerializableClass)(`${_package.default.version}:Npm`, Npm);