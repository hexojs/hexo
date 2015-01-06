var Promise = require('bluebird');

function readStream(stream){
  return new Promise(function(resolve, reject){
    var data = [];

    stream.on('data', function(chunk){
      data.push(chunk);
    }).on('end', function(){
      resolve(Buffer.concat(data).toString());
    }).on('error', reject);
  });
}

exports.read = readStream;