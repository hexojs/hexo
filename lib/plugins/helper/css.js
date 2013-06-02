var extend = require('../../extend'),
  root = hexo.config.root;

extend.helper.register('css', function(path){
  if (!Array.isArray(path)) path = [path];

  var result = [];

  path.forEach(function(item){
    if (item.substr(item.length - 4, 4) !== '.css') item += '.css';
    if (item.substr(0, 1) !== '/') item = root + item;

    result.push('<link rel="stylesheet" href="' + item + '" type="text/css">');
  });

  return result.join('\n');
});
