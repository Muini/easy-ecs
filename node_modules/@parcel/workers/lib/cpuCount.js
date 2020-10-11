"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detectRealCores = detectRealCores;
exports.default = getCores;

var _os = _interopRequireDefault(require("os"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const exec = command => {
  try {
    let stdout = (0, _child_process.execSync)(command, {
      encoding: 'utf8',
      // This prevents the command from outputting to the console
      stdio: [null, null, null]
    });
    return stdout.trim();
  } catch (e) {
    return '';
  }
};

function detectRealCores() {
  let platform = _os.default.platform();

  let amount = 0;

  if (platform === 'linux') {
    amount = parseInt(exec('lscpu -p | egrep -v "^#" | sort -u -t, -k 2,4 | wc -l'), 10);
  } else if (platform === 'darwin') {
    amount = parseInt(exec('sysctl -n hw.physicalcpu_max'), 10);
  }

  if (!amount || amount <= 0) {
    throw new Error('Could not detect cpu count!');
  }

  return amount;
}

let cores;

function getCores(bypassCache = false) {
  // Do not re-run commands if we already have the count...
  if (cores && !bypassCache) {
    return cores;
  }

  try {
    cores = detectRealCores();
  } catch (e) {
    // Guess the amount of real cores
    cores = _os.default.cpus().filter((cpu, index) => !cpu.model.includes('Intel') || index % 2 === 1).length;
  } // Another fallback


  if (!cores) {
    cores = 1;
  }

  return cores;
}