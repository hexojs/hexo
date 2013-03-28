var extend = require('../../extend');

extend.helper.register('css', function(path){
  if (!Array.isArray) path = [path];

  var result = [];

  path.forEach(function(item){
    result.push('<link rel="stylesheet" href="' + item + '" type="text/css">');
  });

  return result.join('\n');
});