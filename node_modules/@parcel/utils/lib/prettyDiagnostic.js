"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prettyDiagnostic;

var _codeframe = _interopRequireDefault(require("@parcel/codeframe"));

var _markdownAnsi = _interopRequireDefault(require("@parcel/markdown-ansi"));

var _chalk = _interopRequireDefault(require("chalk"));

var _path = _interopRequireDefault(require("path"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function prettyDiagnostic(diagnostic, options, terminalWidth) {
  let {
    origin,
    message,
    stack,
    codeFrame,
    hints,
    filePath,
    language,
    skipFormatting
  } = diagnostic;

  if (filePath != null && options && !_path.default.isAbsolute(filePath)) {
    filePath = _path.default.join(options.projectRoot, filePath);
  }

  let result = {
    message: (0, _markdownAnsi.default)(`**${origin !== null && origin !== void 0 ? origin : 'unknown'}**: `) + (skipFormatting ? message : (0, _markdownAnsi.default)(message)),
    stack: '',
    codeframe: '',
    hints: []
  };

  if (codeFrame !== undefined) {
    var _codeFrame$code;

    let highlights = Array.isArray(codeFrame.codeHighlights) ? codeFrame.codeHighlights : [codeFrame.codeHighlights];
    let code = (_codeFrame$code = codeFrame.code) !== null && _codeFrame$code !== void 0 ? _codeFrame$code : options && (await options.inputFS.readFile((0, _nullthrows.default)(filePath), 'utf8'));

    if (code != null) {
      let formattedCodeFrame = (0, _codeframe.default)(code, highlights, {
        useColor: true,
        syntaxHighlighting: true,
        language: // $FlowFixMe sketchy null checks do not matter here...
        language || (filePath ? _path.default.extname(filePath).substr(1) : undefined),
        terminalWidth
      });
      result.codeframe += typeof filePath !== 'string' ? '' : _chalk.default.underline(`${filePath}:${highlights[0].start.line}:${highlights[0].start.column}\n`);
      result.codeframe += formattedCodeFrame;
    }
  }

  if (stack != null) {
    result.stack = stack;
  } else if (filePath != null && result.codeframe == null) {
    result.stack = filePath;
  }

  if (Array.isArray(hints) && hints.length) {
    result.hints = hints.map(h => {
      return (0, _markdownAnsi.default)(h);
    });
  }

  return result;
}