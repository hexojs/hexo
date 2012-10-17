var extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  fs = require('fs');

extend.process.register(function(locals, callback){
  var publicDir = hexo.public_dir;

  fs.exists(publicDir, function(exist){
    if (exist){
      file.empty(publicDir, function(){
        console.log('Previous generated file cleared.');
        callback();
      });
    } else {
      callback();
    }
  });
});