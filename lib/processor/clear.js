var extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  fs = require('fs');

extend.processor.register(function(locals, callback){
  var publicDir = hexo.public_dir;

  fs.exists(publicDir, function(exist){
    if (exist){
      console.log('Clearing.')
      file.empty(publicDir, callback);
    } else {
      callback();
    }
  });
});