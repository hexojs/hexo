'use strict';

var strip = require('chalk').stripColor;

exports.stringLength = function(str) {
  str = strip(str);

  var len = str.length;
  var result = len;

  // Detect double-byte characters
  for (var i = 0; i < len; i++) {
    if (str.charCodeAt(i) > 255) {
      result++;
    }
  }

  return result;
};
