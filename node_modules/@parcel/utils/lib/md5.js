"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.md5FromString = md5FromString;
exports.md5FromReadableStream = md5FromReadableStream;
exports.md5FromObject = md5FromObject;
exports.md5FromFilePath = md5FromFilePath;

var _crypto = _interopRequireDefault(require("crypto"));

var _collection = require("./collection");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5FromString(string, encoding = 'hex') {
  return _crypto.default.createHash('md5').update(string).digest(encoding);
}

function md5FromReadableStream(stream) {
  return new Promise((resolve, reject) => {
    stream.on('error', err => {
      reject(err);
    });
    stream.pipe(_crypto.default.createHash('md5').setEncoding('hex')).on('finish', function () {
      resolve(this.read());
    }).on('error', err => {
      reject(err);
    });
  });
}

function md5FromObject(obj, encoding = 'hex') {
  return md5FromString(JSON.stringify((0, _collection.objectSortedEntriesDeep)(obj)), encoding);
}

function md5FromFilePath(fs, filePath) {
  return md5FromReadableStream(fs.createReadStream(filePath));
}