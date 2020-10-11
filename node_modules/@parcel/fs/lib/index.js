"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ncp = ncp;
Object.defineProperty(exports, "NodeFS", {
  enumerable: true,
  get: function () {
    return _NodeFS.NodeFS;
  }
});
Object.defineProperty(exports, "MemoryFS", {
  enumerable: true,
  get: function () {
    return _MemoryFS.MemoryFS;
  }
});
Object.defineProperty(exports, "OverlayFS", {
  enumerable: true,
  get: function () {
    return _OverlayFS.OverlayFS;
  }
});

var _path = _interopRequireDefault(require("path"));

var _NodeFS = require("./NodeFS");

var _MemoryFS = require("./MemoryFS");

var _OverlayFS = require("./OverlayFS");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Recursively copies a directory from the sourceFS to the destinationFS
async function ncp(sourceFS, source, destinationFS, destination) {
  await destinationFS.mkdirp(destination);
  let files = await sourceFS.readdir(source);

  for (let file of files) {
    let sourcePath = _path.default.join(source, file);

    let destPath = _path.default.join(destination, file);

    let stats = await sourceFS.stat(sourcePath);

    if (stats.isFile()) {
      await new Promise((resolve, reject) => {
        sourceFS.createReadStream(sourcePath).pipe(destinationFS.createWriteStream(destPath)).on('finish', () => resolve()).on('error', reject);
      });
    } else if (stats.isDirectory()) {
      await ncp(sourceFS, sourcePath, destinationFS, destPath);
    }
  }
}