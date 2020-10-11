"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.anyToDiagnostic = anyToDiagnostic;
exports.errorToDiagnostic = errorToDiagnostic;
exports.generateJSONCodeHighlights = generateJSONCodeHighlights;
exports.getJSONSourceLocation = getJSONSourceLocation;
exports.encodeJSONKeyComponent = encodeJSONKeyComponent;
exports.default = void 0;

var _jsonSourceMap = _interopRequireDefault(require("json-source-map"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function anyToDiagnostic(input) {
  // $FlowFixMe
  let diagnostic = input;

  if (input instanceof ThrowableDiagnostic) {
    diagnostic = input.diagnostics;
  } else if (input instanceof Error) {
    diagnostic = errorToDiagnostic(input);
  }

  return diagnostic;
}

function errorToDiagnostic(error, realOrigin) {
  let codeFrame = undefined;

  if (typeof error === 'string') {
    return {
      origin: realOrigin || 'Error',
      message: error,
      codeFrame
    };
  }

  if (error instanceof ThrowableDiagnostic) {
    return error.diagnostics.map(d => {
      return { ...d,
        origin: realOrigin || d.origin || 'unknown'
      };
    });
  }

  if (error.loc && error.source) {
    codeFrame = {
      code: error.source,
      codeHighlights: {
        start: {
          line: error.loc.line,
          column: error.loc.column
        },
        end: {
          line: error.loc.line,
          column: error.loc.column
        }
      }
    };
  }

  return {
    origin: realOrigin || 'Error',
    message: error.message,
    name: error.name,
    filePath: error.filePath || error.fileName,
    stack: error.highlightedCodeFrame || error.codeFrame || error.stack,
    codeFrame
  };
}

class ThrowableDiagnostic extends Error {
  constructor(opts) {
    let diagnostics = Array.isArray(opts.diagnostic) ? opts.diagnostic : [opts.diagnostic]; // construct error from diagnostics...

    super(diagnostics[0].message);

    _defineProperty(this, "diagnostics", void 0);

    this.stack = diagnostics[0].stack || super.stack;
    this.name = diagnostics[0].name || super.name;
    this.diagnostics = diagnostics;
  }

} // ids.key has to be "/some/parent/child"


exports.default = ThrowableDiagnostic;

function generateJSONCodeHighlights(code, ids) {
  // json-source-map doesn't support a tabWidth option (yet)
  let map = _jsonSourceMap.default.parse(code.replace(/\t/g, ' '));

  return ids.map(({
    key,
    type,
    message
  }) => {
    let pos = (0, _nullthrows.default)(map.pointers[key]);
    return { ...getJSONSourceLocation(pos, type),
      message
    };
  });
}

function getJSONSourceLocation(pos, type) {
  if (!type && pos.value) {
    // key and value
    return {
      start: {
        line: pos.key.line + 1,
        column: pos.key.column + 1
      },
      end: {
        line: pos.valueEnd.line + 1,
        column: pos.valueEnd.column
      }
    };
  } else if (type == 'key' || !pos.value) {
    return {
      start: {
        line: pos.key.line + 1,
        column: pos.key.column + 1
      },
      end: {
        line: pos.keyEnd.line + 1,
        column: pos.keyEnd.column
      }
    };
  } else {
    return {
      start: {
        line: pos.value.line + 1,
        column: pos.value.column + 1
      },
      end: {
        line: pos.valueEnd.line + 1,
        column: pos.valueEnd.column
      }
    };
  }
}

function encodeJSONKeyComponent(component) {
  return component.replace(/\//g, '~1');
}