var fs = require('graceful-fs'),
  path = require('path');

module.exports = function(args, callback){
  var shell = args._[0];
  if (!shell) return callback();

  var stream = fs.createReadStream(path.join(__dirname, shell));

  stream.pipe(process.stdout)
    .on('error', callback)
    .on('end', callback);
};