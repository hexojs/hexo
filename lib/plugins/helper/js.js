var extend = require('../../extend'),
  root = hexo.config.root;

extend.helper.register('js', function(path){
  if (!Array.isArray(path)) path = [path];

  var result = [];

  path.forEach(function(item){
    if (item.substr(item.length - 3, 3) !== '.js') item += '.js';
    if (item.substr(0, 1) !== '/') item = root + item;

    result.push('<script type="text/javascript" src="' + item + '"></script>');
  });

  return result.join('\n');
});
