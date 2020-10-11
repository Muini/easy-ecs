"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dumpGraphToGraphViz;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const COLORS = {
  root: 'gray',
  asset: 'green',
  dependency: 'orange',
  transformer_request: 'cyan',
  file: 'gray',
  default: 'white'
};
const TYPE_COLORS = {
  bundle: 'blue',
  contains: 'grey',
  internal_async: 'orange',
  references: 'red'
};

async function dumpGraphToGraphViz( // $FlowFixMe
graph, name) {}

function getEnvDescription(env) {
  var _description;

  let description;

  if (typeof env.engines.browsers === 'string') {
    description = `${env.context}: ${env.engines.browsers}`;
  } else if (Array.isArray(env.engines.browsers)) {
    description = `${env.context}: ${env.engines.browsers.join(', ')}`;
  } else if (env.engines.node) {
    description = `node: ${env.engines.node}`;
  }

  return (_description = description) !== null && _description !== void 0 ? _description : '';
}