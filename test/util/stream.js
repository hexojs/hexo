'use strict';

const Promise = require('bluebird');

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let data = '';

    stream.on('data', chunk => {
      data += chunk.toString();
    }).on('end', () => {
      resolve(data);
    }).on('error', reject);
  });
}

exports.read = readStream;
