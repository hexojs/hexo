'use strict';

const strip = require('strip-ansi');

exports.stringLength = str => {
  str = strip(str);

  let result = str.length;

  // Detect double-byte characters
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      result++;
    }
  }

  return result;
};
