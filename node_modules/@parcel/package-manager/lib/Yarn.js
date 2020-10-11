"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Yarn = void 0;

var _commandExists = _interopRequireDefault(require("command-exists"));

var _crossSpawn = _interopRequireDefault(require("cross-spawn"));

var _logger = _interopRequireDefault(require("@parcel/logger"));

var _split = _interopRequireDefault(require("split2"));

var _JSONParseStream = _interopRequireDefault(require("./JSONParseStream"));

var _promiseFromProcess = _interopRequireDefault(require("./promiseFromProcess"));

var _core = require("@parcel/core");

var _utils = require("./utils");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $FlowFixMe
const YARN_CMD = 'yarn';
let hasYarn;

class Yarn {
  static async exists() {
    if (hasYarn != null) {
      return hasYarn;
    }

    try {
      hasYarn = Boolean((await (0, _commandExists.default)('yarn')));
    } catch (err) {
      hasYarn = false;
    }

    return hasYarn;
  }

  async install({
    modules,
    cwd,
    saveDev = true
  }) {
    let args = ['add', '--json'].concat(modules.map(_utils.npmSpecifierFromModuleRequest));

    if (saveDev) {
      args.push('-D');
    }

    let installProcess = (0, _crossSpawn.default)(YARN_CMD, args, {
      cwd
    });
    installProcess.stdout // Invoking yarn with --json provides streaming, newline-delimited JSON output.
    .pipe((0, _split.default)()).pipe(new _JSONParseStream.default()).on('error', e => {
      _logger.default.error(e, '@parcel/package-manager');
    }).on('data', message => {
      switch (message.type) {
        case 'step':
          _logger.default.progress(prefix(`[${message.data.current}/${message.data.total}] ${message.data.message}`));

          return;

        case 'success':
        case 'info':
          _logger.default.info({
            origin: '@parcel/package-manager',
            message: prefix(message.data)
          });

          return;

        default: // ignore

      }
    });
    installProcess.stderr.pipe((0, _split.default)()).pipe(new _JSONParseStream.default()).on('error', e => {
      _logger.default.error(e, '@parcel/package-manager');
    }).on('data', message => {
      switch (message.type) {
        case 'warning':
          _logger.default.warn({
            origin: '@parcel/package-manager',
            message: prefix(message.data)
          });

          return;

        case 'error':
          _logger.default.error({
            origin: '@parcel/package-manager',
            message: prefix(message.data)
          });

          return;

        default: // ignore

      }
    });

    try {
      return await (0, _promiseFromProcess.default)(installProcess);
    } catch (e) {
      throw new Error('Yarn failed to install modules');
    }
  }

}

exports.Yarn = Yarn;

function prefix(message) {
  return 'yarn: ' + message;
}

(0, _core.registerSerializableClass)(`${_package.default.version}:Yarn`, Yarn);