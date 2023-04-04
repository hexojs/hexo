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
//this is some new change I am adding on a branch
//More changes added on 2nd level branch
exports.read = readStream;
