var url = require('url'),
  pathFn = require('path');

exports.url_for = function(path){
  path = path || '/';

  var config = this.config || hexo.config,
    root = config.root,
    data = url.parse(path);

  if (!data.protocol && path.substring(0, 2) !== '//'){
    if (path.substring(0, root.length) !== root) path = root + path;

    if (config.relative_link){
      path = pathFn.relative(root + this.path, path);
    }
  }

  return path;
};