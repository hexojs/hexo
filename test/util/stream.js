'use strict';

var Promise = require('bluebird');

function readStream(stream) {
  return new Promise(function(resolve, reject) {
    var data = '';

    stream.on('data', function(chunk) {
      data += chunk.toString();
    }).on('end', function() {
      resolve(data);
    }).on('error', reject);
  });
}

exports.read = readStream;
