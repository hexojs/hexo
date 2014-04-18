var pathFn = require('path'),
  util = require('../../../util'),
  file = util.file2;

var callback = function(err){
  process.send(err || null);
};

var init = function(){
  require('../../../hexo').init({silent: true}, function(err){
    hexo.post.load({saveCache: false}, callback);
  });
};

var generate = function(data){
  var publicDir = hexo.public_dir,
    path = data.path,
    dest = pathFn.join(publicDir, path);

  hexo.route.get(data.path)(function(err, result){
    if (result.readable){
      file.copyFile(result.path, dest, callback);
    } else {
      file.writeFile(dest, result, callback);
    }
  });
};

process.on('message', function(data){
  switch (data.type){
    case 'init':
      init(data);
      break;

    case 'generate':
      generate(data);
      break;
  }
});