"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapeMarkdown = escapeMarkdown;
const escapeCharacters = ['\\', '*', '_', '~'];

function escapeMarkdown(s) {
  for (const char of escapeCharacters) {
    s = s.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
  }

  return s;
}